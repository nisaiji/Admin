import React, { useEffect, useState } from "react";
import { useFormik } from "formik";
import Globe from "../../assets/images/Globe.png";
import facebook from "../../assets/images/facebook.png";
import instagram from "../../assets/images/instagram.png";
import linkedin from "../../assets/images/linkedin.png";
import twitter from "../../assets/images/twitter.png";
import whatsapp from "../../assets/images/whatsapp.png";
import youtube from "../../assets/images/youtube.png";
import * as Yup from "yup";
import { axiosClient } from "../../services/axiosClient";
import EndPoints from "../../services/EndPoints";
import toast, { Toaster } from "react-hot-toast";
import Spinner from "../Spinner";
import { useTranslation } from "react-i18next";
import statesAndCity from "../../assets/locale/statesAndCity/en";
// import Countries from "../../utils/Countries.json";
import StateAndDistricts from "../../utils/StatesAndDistricts.json";
import Breadcrumbs from "../BreadCrumbs";
import {
  Box,
  FormControl,
  FormHelperText,
  InputLabel,
  MenuItem,
  Select,
} from "@mui/material";

export default function AdminProfile() {
  const [admin, setAdmin] = useState([]);
  const [loading, setLoading] = useState(false);
  const [filteredCities, setFilteredCities] = useState([]);
  const [selectedCountry, setSelectedCountry] = useState("");
  const [states, setStates] = useState([]);
  const [districts, setDistricts] = useState([]);
  const [toastDisplayed, setToastDisplayed] = useState(false);
  const { t } = useTranslation();
  const Countries = [{ name: "India", code: "IN" }];

  // vaidation schema for the form using Yup
  const validationSchema = Yup.object({
    schoolName: Yup.string().trim().required(t("validationError.schoolName")),
    principal: Yup.string().trim().required(t("validationError.principalName")),
    username: Yup.string().trim().required(t("validationError.adminName")),
    schoolBoard: Yup.string().trim().required(t("validationError.schoolBoard")),
    affiliationNo: Yup.string()
      .trim()
      .required(t("validationError.affiliationNumber")),
    address: Yup.string().trim().required(t("validationError.address")),
    country: Yup.string().trim().required(t("validationError.country")),
    state: Yup.string().trim().required(t("validationError.state")),
    district: Yup.string().trim().required(t("validationError.district")),
    city: Yup.string().trim().required(t("validationError.city")),
    pincode: Yup.string().trim().required(t("validationError.pincode")),
    phone: Yup.string().trim().length(10).required(t("validationError.phone")),
    email: Yup.string()
      .trim()
      .email(t("validationError.emailAddress"))
      .required(t("validationError.email")),
  });

  // Formik instance for handling form state and submission
  const formik = useFormik({
    initialValues: {
      schoolName: "",
      principal: "",
      username: "",
      schoolBoard: "",
      affiliationNo: "",
      schoolNumber: "",
      address: "",
      email: "",
      country: "",
      district: "",
      city: "",
      pincode: "",
      state: "",
      phone: "",
      website: "",
      facebook: "",
      instagram: "",
      linkedin: "",
      twitter: "",
      whatsapp: "",
      youtube: "",
    },
    validationSchema,
    onSubmit: (values) => {},
  });

  // get admin data from the API
  const getadmin = async () => {
    try {
      setLoading(true);
      const res = await axiosClient.get(EndPoints.ADMIN.GET_ADMIN);
      if (res?.statusCode === 200) {
        if (res?.result?.country === "India") {
          setSelectedCountry("India");
          setStates(StateAndDistricts.states);
          const selectedState = StateAndDistricts.states.find(
            (state) => state.state === res?.result?.state
          );
          setDistricts(selectedState ? selectedState.districts : []);
        }

        setAdmin(res?.result);
        formik.setValues({
          ...formik.initialValues,
          ...res.result,
        });
      }
    } catch (e) {
      toast.error(e);
    } finally {
      setLoading(false);
    }
  };

  // profile update api
  const handleProfileUpdate = async () => {
    try {
      const { values } = formik;
      try {
        await Promise.all(
          [
            "schoolName",
            "email",
            "principal",
            "username",
            "affiliationNo",
            "address",
            "schoolBoard",
            "country",
            "state",
            "district",
            "city",
            "pincode",
          ].map((field) =>
            Yup.reach(validationSchema, field).validate(values[field])
          )
        );
      } catch (e) {
        if (!toastDisplayed) {
          setToastDisplayed(true);
          toast.error(e.message);
          setTimeout(() => setToastDisplayed(false), 3000);
        }
        return;
      }

      setLoading(true);
      // Prepare request body for profile update
      const requestBody = {
        schoolName: values.schoolName,
        principal: values.principal,
        schoolBoard: values.schoolBoard,
        affiliationNo: values.affiliationNo,
        address: values.address,
        country: values.country,
        district: values.district,
        city: values.city,
        pincode: values.pincode,
        state: values.state,
        email: values.email,
        username: values.username,
        schoolNumber: values.schoolNumber || undefined,
      };

      const res = await axiosClient.put(
        EndPoints.ADMIN.PROFILE_UPDATE,
        requestBody
      );
      if (res?.statusCode === 200) {
        localStorage.setItem("schoolName", values.schoolName);
        toast.success(res.result);
        getadmin();
      }
    } catch (e) {
      toast.error(e);
    } finally {
      setLoading(false);
    }
  };

  // update soial details API
  const handleSocialProfileUpdate = async () => {
    try {
      await Yup.reach(validationSchema, "phone").validate(formik.values.phone);
      setLoading(true);

      const { values } = formik;
      const res = await axiosClient.put(EndPoints.ADMIN.SOCIAL_PROFILE_UPDATE, {
        phone: values.phone,
        website: values.website || undefined,
        facebook: values.facebook || undefined,
        instagram: values.instagram || undefined,
        linkedin: values.linkedin || undefined,
        twitter: values.twitter || undefined,
        whatsapp: values.whatsapp || undefined,
        youtube: values.youtube || undefined,
      });
      if (res?.statusCode === 200) {
        toast.success(res.result);
        getadmin();
      }
    } catch (e) {
      toast.error(e);
    } finally {
      setLoading(false);
    }
  };

  // Handle country selection
  const handleCountryChange = (e) => {
    const country = e.target.value;
    setSelectedCountry(country);

    // Reset fields when changing the country
    formik.setFieldValue("state", "");
    formik.setFieldValue("district", "");
    formik.setFieldValue("pincode", "");
    formik.setFieldValue("city", "");
    formik.setFieldValue("address", "");

    formik.setFieldValue("country", country);
    if (country === "India") {
      // Accessing the states array inside the StateAndDistricts object
      setStates(StateAndDistricts.states);
      setDistricts([]); // Reset districts
    } else {
      setStates([]);
      setDistricts([]);
    }
  };

  // Handle state selection
  const handleStateChange = (e) => {
    const selectedState = StateAndDistricts.states.find(
      (state) => state.state === e.target.value
    );

    // Reset fields when changing the state
    formik.setFieldValue("city", "");
    formik.setFieldValue("pincode", "");
    formik.setFieldValue("address", "");
    formik.setFieldValue("district", "");

    formik.setFieldValue("state", e.target.value);
    if (selectedState) {
      setDistricts(selectedState.districts);
    } else {
      setDistricts([]);
    }
  };

  useEffect(() => {
    getadmin();
  }, []);

  return (
    <form
      onSubmit={formik.handleSubmit}
      className="flex flex-col items-center bg-[#93a3b6]/25 p-6"
    >
      {loading && (
        <div className="fixed inset-0 flex items-center justify-center bg-[#fafafa] bg-opacity-50 z-30">
          <Spinner />
        </div>
      )}
      {/* Account Setting */}
      <div className="flex flex-col p-10 w-full rounded-2xl bg-[#fafafa] max-md:px-5 max-md:m-10 max-md:max-w-full">
        <Toaster position="top-center" reverseOrder={false} />
        <Breadcrumbs />
        <div className="text-2xl font-bold tracking-tight leading-8 text-neutral-800">
          {t("adminProfile.accountSettings")}
        </div>

        <div className="flex flex-wrap gap-5 mt-5 w-full">
          {/* School Name */}
          <div className="flex flex-row w-full space-x-5">
            <div className="w-full md:w-4/5">
              <label className="text-sm font-semibold leading-5 text-neutral-800">
                {t("adminProfile.schoolName")}
                <span className="text-red-500">*</span>
              </label>
              <input
                name="schoolName"
                placeholder={t("placeholders.schoolName")}
                value={formik.values.schoolName}
                onChange={formik.handleChange}
                onBlur={formik.handleBlur}
                data-testid="schoolName"
                className={`p-2 mt-1 w-full text-base leading-6 ${
                  formik.errors.schoolName && formik.touched.schoolName
                    ? "border-red-500"
                    : "border-gray-200"
                } text-black bg-white border`}
              />
              {formik.errors.schoolName && formik.touched.schoolName && (
                <div className="text-red-500 text-sm mt-1">
                  {formik.errors.schoolName}
                </div>
              )}
            </div>
            {/* Email */}
            <div className="w-full md:w-4/5">
              <label className="text-sm font-semibold leading-5 text-neutral-800">
                {t("adminProfile.Email")}
                <span className="text-red-500">*</span>
              </label>
              <input
                name="email"
                placeholder={t("placeholders.emailAddress")}
                value={formik.values.email}
                onChange={formik.handleChange}
                onBlur={formik.handleBlur}
                data-testid="email"
                className={`p-2 mt-1 w-full text-base leading-6 ${
                  formik.errors.email && formik.touched.email
                    ? "border-red-500"
                    : "border-gray-200"
                } text-black bg-white border`}
              />
              {formik.errors.email && formik.touched.email && (
                <div className="text-red-500 text-sm mt-1">
                  {formik.errors.email}
                </div>
              )}
            </div>
          </div>

          {/* Principal */}
          <div className="flex flex-row w-full space-x-5">
            <div className="w-full md:w-4/5">
              <label className="text-sm font-semibold leading-5 text-neutral-800">
                {t("adminProfile.principal")}
                <span className="text-red-500">*</span>
              </label>
              <input
                name="principal"
                placeholder={t("placeholders.principal")}
                value={formik.values.principal}
                onChange={formik.handleChange}
                onBlur={formik.handleBlur}
                data-testid="principal"
                className={`p-2 mt-1 w-full text-base leading-6 ${
                  formik.errors.principal && formik.touched.principal
                    ? "border-red-500"
                    : "border-gray-200"
                } text-black bg-white border`}
              />
              {formik.errors.principal && formik.touched.principal && (
                <div className="text-red-500 text-sm mt-1">
                  {formik.errors.principal}
                </div>
              )}
            </div>
            {/* Admin name */}
            <div className="w-full md:w-4/5">
              <label className="text-sm font-semibold leading-5 text-neutral-800">
                {t("adminProfile.adminName")}
                <span className="text-red-500">*</span>
              </label>
              <input
                name="username"
                placeholder={t("placeholders.adminName")}
                value={formik.values.username}
                onChange={formik.handleChange}
                onBlur={formik.handleBlur}
                data-testid="username"
                className={`p-2 mt-1 w-full text-base leading-6 ${
                  formik.errors.username && formik.touched.username
                    ? "border-red-500"
                    : "border-gray-200"
                } text-black bg-white border`}
              />
              {formik.errors.username && formik.touched.username && (
                <div className="text-red-500 text-sm mt-1">
                  {formik.errors.username}
                </div>
              )}
            </div>
          </div>

          {/* Affiliation No */}
          <div className="flex flex-row w-full space-x-5">
            <div className="w-full md:w-4/5">
              <label className="text-sm font-semibold leading-5 text-neutral-800">
                {t("adminProfile.affiliationNumber")}
                <span className="text-red-500">*</span>
              </label>
              <input
                name="affiliationNo"
                placeholder={t("placeholders.affiliationNumber")}
                value={formik.values.affiliationNo}
                onChange={formik.handleChange}
                onBlur={formik.handleBlur}
                data-testid="affiliationNo"
                className={`p-2 mt-1 w-full text-base leading-6 ${
                  formik.errors.affiliationNo && formik.touched.affiliationNo
                    ? "border-red-500"
                    : "border-gray-200"
                } text-black bg-white border`}
              />
              {formik.errors.affiliationNo && formik.touched.affiliationNo && (
                <div className="text-red-500 text-sm mt-1">
                  {formik.errors.affiliationNo}
                </div>
              )}
            </div>
            {/* School No */}
            <div className="w-full md:w-4/5">
              <label className="text-sm font-semibold leading-5 text-neutral-800">
                {t("adminProfile.schoolNumber")}
              </label>
              <input
                name="schoolNumber"
                placeholder={t("placeholders.schoolNumber")}
                value={formik.values.schoolNumber}
                onChange={formik.handleChange}
                onBlur={formik.handleBlur}
                data-testid="schoolNumber"
                className={`p-2 mt-1 w-full text-base leading-6 ${
                  formik.errors.schoolNumber && formik.touched.schoolNumber
                    ? "border-red-500"
                    : "border-gray-200"
                } text-black bg-white border`}
              />
              {formik.errors.schoolNumber && formik.touched.schoolNumber && (
                <div className="text-red-500 text-sm mt-1">
                  {formik.errors.schoolNumber}
                </div>
              )}
            </div>
          </div>

          {/* Address */}
          <div className="flex flex-row w-full space-x-5">
            <div className="w-full md:w-4/5">
              <label className="text-sm font-semibold leading-5 text-neutral-800">
                {t("adminProfile.schoolAddress")}
                <span className="text-red-500">*</span>
              </label>
              <input
                name="address"
                placeholder={t("placeholders.schoolAdress")}
                value={formik.values.address}
                onChange={formik.handleChange}
                onBlur={formik.handleBlur}
                data-testid="address"
                className={`p-2 mt-1 w-full text-base leading-6 ${
                  formik.errors.address && formik.touched.address
                    ? "border-red-500"
                    : "border-gray-200"
                } text-black bg-white border`}
              />
              {formik.errors.address && formik.touched.address && (
                <div className="text-red-500 text-sm mt-1">
                  {formik.errors.address}
                </div>
              )}
            </div>
            {/* School Board */}
            <div className="w-full md:w-4/5">
              <label className="text-sm font-semibold leading-5 text-neutral-800">
                {t("adminProfile.schoolBoard")}
                <span className="text-red-500">*</span>
              </label>
              <FormControl
                fullWidth
                variant="outlined"
                error={formik.errors.schoolBoard && formik.touched.schoolBoard}
              >
                <Select
                  name="schoolBoard"
                  value={formik.values.schoolBoard}
                  onChange={formik.handleChange}
                  onBlur={formik.handleBlur}
                  data-testid="schoolBoard"
                  displayEmpty
                  renderValue={(selected) => {
                    if (!selected) {
                      return (
                        <span style={{ color: "gray" }}>
                          {t("adminProfile.selectSchoolBoard")}
                        </span>
                      );
                    }
                    return selected;
                  }}
                  sx={{
                    mt: 0.5,
                    width: "100%",
                    fontSize: "1rem",
                    color: formik.values.schoolBoard ? "black" : "gray",
                    backgroundColor: "white",
                    border:
                      formik.errors.schoolBoard && formik.touched.schoolBoard
                        ? "1px solid red"
                        : "1px solid #E5E7EB",
                    borderRadius: "0.5rem",
                    "& .MuiSelect-select": {
                      fontSize: "1rem",
                      lineHeight: "1.5rem",
                      p: 1,
                    },
                  }}
                >
                  <MenuItem value="" disabled>
                    {t("adminProfile.selectSchoolBoard")}
                  </MenuItem>
                  <MenuItem value="CBSE">CBSE</MenuItem>
                  <MenuItem value="ICSE">ICSE</MenuItem>
                  <MenuItem value="StateBoard">State Board</MenuItem>
                  <MenuItem value="IB">IB</MenuItem>
                  <MenuItem value="Other">{t("options.other")}</MenuItem>
                </Select>
              </FormControl>

              {formik.errors.schoolBoard && formik.touched.schoolBoard && (
                <div
                  className="text-red-500 text-sm mt-1"
                  data-testid="schoolBoardError"
                >
                  {formik.errors.schoolBoard}
                </div>
              )}
            </div>
          </div>

          {/* Country, State, and District */}
          <Box
            sx={{
              display: "flex",
              flexDirection: "row",
              width: "100%",
              gap: 2,
            }}
          >
            {/* Country Dropdown */}
            <FormControl
              fullWidth
              sx={{ width: { xs: "100%", md: "33%" } }}
              error={formik.errors.country && formik.touched.country}
            >
              <label className="text-sm font-semibold leading-5 text-neutral-800">
                {t("adminProfile.country")}
                <span className="text-red-500">*</span>
              </label>
              <Select
                labelId="country-label"
                name="country"
                value={formik.values.country}
                onChange={handleCountryChange}
                onBlur={formik.handleBlur}
                data-testid="country"
                displayEmpty
                sx={{
                  mt: 1,
                  backgroundColor: "white",
                  border: (theme) =>
                    formik.errors.country && formik.touched.country
                      ? "1px solid red"
                      : "1px solid #E5E7EB",
                  color: "black",
                  "& .MuiSelect-select": {
                    fontSize: "1rem",
                    lineHeight: "1.5rem",
                    p: 1,
                  },
                }}
              >
                <MenuItem value="" disabled>
                  {t("placeholders.selectCountry")}
                </MenuItem>
                {Countries.map((country) => (
                  <MenuItem key={country.code} value={country.name}>
                    {country.name}
                  </MenuItem>
                ))}
              </Select>
              {formik.errors.country && formik.touched.country && (
                <div className="text-red-500 text-sm mt-1">
                  {formik.errors.country}
                </div>
              )}
            </FormControl>

            {/* State Dropdown */}
            <FormControl
              fullWidth
              sx={{ width: { xs: "100%", md: "33%" } }}
              error={formik.errors.state && formik.touched.state}
            >
              <label className="text-sm font-semibold leading-5 text-neutral-800">
                {t("adminProfile.state")}
                <span className="text-red-500">*</span>
              </label>
              <Select
                labelId="state-label"
                name="state"
                value={formik.values.state}
                onChange={handleStateChange}
                onBlur={formik.handleBlur}
                data-testid="state-select"
                displayEmpty
                sx={{
                  mt: 1,
                  backgroundColor: "white",
                  border: (theme) =>
                    formik.errors.state && formik.touched.state
                      ? "1px solid red"
                      : "1px solid #E5E7EB",
                  color: "black",
                  "& .MuiSelect-select": {
                    fontSize: "1rem",
                    lineHeight: "1.5rem",
                    p: 1,
                  },
                }}
              >
                <MenuItem value="" disabled>
                  {t("placeholders.selectState")}
                </MenuItem>
                {states.map((state) => (
                  <MenuItem key={state.state} value={state.state}>
                    {state.state}
                  </MenuItem>
                ))}
              </Select>
              {formik.errors.state && formik.touched.state && (
                <div className="text-red-500 text-sm mt-1">
                  {formik.errors.state}
                </div>
              )}
            </FormControl>

            {/* District Dropdown */}
            <FormControl
              fullWidth
              sx={{ width: { xs: "100%", md: "33%" } }}
              error={formik.errors.district && formik.touched.district}
            >
              <label className="text-sm font-semibold leading-5 text-neutral-800">
                {t("adminProfile.district")}
                <span className="text-red-500">*</span>
              </label>
              <Select
                labelId="district-label"
                name="district"
                value={formik.values.district}
                onChange={formik.handleChange}
                onBlur={formik.handleBlur}
                data-testid="district-select"
                displayEmpty
                sx={{
                  mt: 1,
                  backgroundColor: "white",
                  border: (theme) =>
                    formik.errors.district && formik.touched.district
                      ? "1px solid red"
                      : "1px solid #E5E7EB",
                  color: "black",
                  "& .MuiSelect-select": {
                    fontSize: "1rem",
                    lineHeight: "1.5rem",
                    p: 1,
                  },
                }}
              >
                <MenuItem value="" disabled>
                  {t("placeholders.selectDistrict")}
                </MenuItem>
                {districts.map((district) => (
                  <MenuItem key={district} value={district}>
                    {district}
                  </MenuItem>
                ))}
              </Select>
              {formik.errors.district && formik.touched.district && (
                <div className="text-red-500 text-sm mt-1">
                  {formik.errors.district}
                </div>
              )}
            </FormControl>
          </Box>

          <div className="flex flex-row w-full space-x-5">
            {/* city */}
            <div className="w-full md:w-4/5">
              <label className="text-sm font-semibold leading-5 text-neutral-800">
                {t("adminProfile.city")}
                <span className="text-red-500">*</span>
              </label>
              <input
                name="city"
                placeholder={t("placeholders.city")}
                value={formik.values.city}
                onChange={formik.handleChange}
                onBlur={formik.handleBlur}
                data-testid="city"
                className={`p-2 mt-1 w-full text-base leading-6 ${
                  formik.errors.city && formik.touched.city
                    ? "border-red-500"
                    : "border-gray-200"
                } text-black bg-white border`}
              />
              {formik.errors.city && formik.touched.city && (
                <div className="text-red-500 text-sm mt-1">
                  {formik.errors.city}
                </div>
              )}
            </div>
            {/* pincode */}
            <div className="w-full md:w-4/5">
              <label className="text-sm font-semibold leading-5 text-neutral-800">
                {t("adminProfile.pincode")}
                <span className="text-red-500">*</span>
              </label>
              <input
                name="pincode"
                placeholder={t("placeholders.pincode")}
                value={formik.values.pincode}
                onChange={formik.handleChange}
                onBlur={formik.handleBlur}
                data-testid="pincode"
                maxLength={6}
                className={`p-2 mt-1 w-full text-base leading-6 ${
                  formik.errors.pincode && formik.touched.pincode
                    ? "border-red-500"
                    : "border-gray-200"
                } text-black bg-white border`}
              />
              {formik.errors.pincode && formik.touched.pincode && (
                <div className="text-red-500 text-sm mt-1">
                  {formik.errors.pincode}
                </div>
              )}
            </div>
          </div>
          {/* save button */}
          <div className="flex gap-5 mt-7">
            <button
              onClick={handleProfileUpdate}
              type="button"
              data-testid="account-submit"
              className="px-6 py-2 text-white bg-[#0F4189] rounded-lg"
            >
              {t("buttons.saveChanges")}
            </button>
          </div>
        </div>
      </div>

      {/* Social Profile */}
      <div className="flex flex-col p-10 mx-10 mt-6 rounded-2xl w-full bg-white max-w-[1320px] max-md:px-5">
        <div className="text-4xl font-bold tracking-tight leading-6 text-neutral-800">
          {t("adminProfile.socialProfile")}
        </div>
        {/* phone */}
        <div className="mt-7 w-full">
          <div className="text-sm font-semibold leading-6 text-neutral-800">
            {t("adminProfile.phoneNumber")}
            <span className="text-red-500">*</span>
          </div>
          <div
            className={`flex gap-5 px-5 py-2 mt-1 bg-white border ${
              formik.errors.phone && formik.touched.phone
                ? "border-red-500"
                : "border-gray-200"
            }`}
          >
            <div className="flex items-center gap-1.5 font-medium text-[#0F4189]">
              <div>+91</div>
              <img
                loading="lazy"
                src="https://cdn.builder.io/api/v1/image/assets/TEMP/16ca314b6e5de1ff873da6c3d07ade79f8cd3b3ad3f24ffbb3eae32553811ebf?"
                className="w-3 aspect-square"
              />
            </div>
            <input
              name="phone"
              placeholder={t("adminProfile.phoneNumberPlaceholder")}
              value={formik.values.phone}
              onChange={formik.handleChange}
              onBlur={formik.handleBlur}
              data-testid="phone"
              maxLength={10}
              className="flex-auto text-black bg-transparent outline-none"
            />
            {formik.errors.phone && formik.touched.phone && (
              <div
                className="text-red-500 text-sm mt-1"
                data-testid={"phone-error"}
              >
                {formik.errors.phone}
              </div>
            )}
          </div>
        </div>
        {/* website */}
        <div className="mt-7 w-full">
          <div className="text-sm font-semibold leading-5 text-neutral-800">
            {t("adminProfile.personalWebsite")}
          </div>
          <div className="flex gap-3 px-5 py-2 mt-1 w-full text-base leading-6 text-gray-400 bg-white border border-gray-200">
            <img loading="lazy" src={Globe} className="w-5 h-5 aspect-square" />
            <input
              name="website"
              placeholder={t("adminProfile.personalWebsitePlaceholder")}
              value={formik.values.website}
              onChange={formik.handleChange}
              onBlur={formik.handleBlur}
              data-testid="website"
              className="flex-auto bg-transparent text-black outline-none"
            />
            {formik.errors.website && formik.touched.website && (
              <div className="text-red-500 text-sm mt-1">
                {formik.errors.website}
              </div>
            )}
          </div>
        </div>
        {/* facebook */}
        <div className="flex flex-col md:flex-row gap-5">
          <div className="mt-7 w-full">
            <div className="text-sm font-semibold leading-5 text-neutral-800">
              {t("adminProfile.facebook")}
            </div>
            <div className="flex gap-3 px-5 py-2 mt-1 w-full text-base leading-6 text-gray-400 bg-white border border-gray-200">
              <img
                loading="lazy"
                src={facebook}
                className="w-5 h-5 aspect-square"
              />
              <input
                name="facebook"
                placeholder={t("adminProfile.facebook")}
                value={formik.values.facebook}
                onChange={formik.handleChange}
                onBlur={formik.handleBlur}
                data-testid="facebook"
                className="flex-auto bg-transparent text-black outline-none"
              />
              {formik.errors.facebook && formik.touched.facebook && (
                <div className="text-red-500 text-sm mt-1">
                  {formik.errors.facebook}
                </div>
              )}
            </div>
          </div>
          {/* instagram */}
          <div className="mt-7 w-full">
            <div className="text-sm font-semibold leading-5 text-neutral-800">
              {t("adminProfile.instagram")}
            </div>
            <div className="flex gap-3 px-5 py-2 mt-1 w-full text-base leading-6 text-gray-400 bg-white border border-gray-200">
              <img
                loading="lazy"
                src={instagram}
                className="w-5 h-5 aspect-square"
              />
              <input
                name="instagram"
                placeholder={t("adminProfile.userName")}
                value={formik.values.instagram}
                onChange={formik.handleChange}
                onBlur={formik.handleBlur}
                data-testid="instagram"
                className="flex-auto bg-transparent text-black outline-none"
              />
              {formik.errors.instagram && formik.touched.instagram && (
                <div className="text-red-500 text-sm mt-1">
                  {formik.errors.instagram}
                </div>
              )}
            </div>
          </div>
          {/* linkedin */}
          <div className="mt-7 w-full">
            <div className="text-sm font-semibold leading-5 text-neutral-800">
              {t("adminProfile.linkedin")}
            </div>
            <div className="flex gap-3 px-5 py-2 mt-1 w-full text-base leading-6 text-gray-400 bg-white border border-gray-200">
              <img
                loading="lazy"
                src={linkedin}
                className="w-5 h-5 aspect-square"
              />
              <input
                name="linkedin"
                placeholder={t("adminProfile.linkedin")}
                value={formik.values.linkedin}
                onChange={formik.handleChange}
                onBlur={formik.handleBlur}
                data-testid="linkedin"
                className="flex-auto bg-transparent text-black outline-none"
              />
              {formik.errors.linkedin && formik.touched.linkedin && (
                <div className="text-red-500 text-sm mt-1">
                  {formik.errors.linkedin}
                </div>
              )}
            </div>
          </div>
        </div>
        {/* twitter */}
        <div className="flex flex-col md:flex-row gap-5">
          <div className="mt-7 w-full">
            <div className="text-sm font-semibold leading-5 text-neutral-800">
              {t("adminProfile.twitter")}
            </div>
            <div className="flex gap-3 px-5 py-2 mt-1 w-full text-base leading-6 text-gray-400 bg-white border border-gray-200">
              <img
                loading="lazy"
                src={twitter}
                className="w-5 h-5 aspect-square"
              />
              <input
                name="twitter"
                placeholder={t("adminProfile.twitter")}
                value={formik.values.twitter}
                onChange={formik.handleChange}
                onBlur={formik.handleBlur}
                data-testid="twitter"
                className="flex-auto bg-transparent text-black outline-none"
              />
              {formik.errors.twitter && formik.touched.twitter && (
                <div className="text-red-500 text-sm mt-1">
                  {formik.errors.twitter}
                </div>
              )}
            </div>
          </div>
          {/* whatsapp */}
          <div className="mt-7 w-full">
            <div className="text-sm font-semibold leading-5 text-neutral-800">
              {t("adminProfile.whatsapp")}
            </div>
            <div className="flex gap-3 px-5 py-2 mt-1 w-full text-base leading-6 text-gray-400 bg-white border border-gray-200">
              <img
                loading="lazy"
                src={whatsapp}
                className="w-5 h-5 aspect-square"
              />
              <input
                name="whatsapp"
                placeholder={t("adminProfile.whatsapp")}
                value={formik.values.whatsapp}
                onChange={formik.handleChange}
                onBlur={formik.handleBlur}
                data-testid="whatsapp"
                className="flex-auto bg-transparent text-black outline-none"
              />
              {formik.errors.whatsapp && formik.touched.whatsapp && (
                <div className="text-red-500 text-sm mt-1">
                  {formik.errors.whatsapp}
                </div>
              )}
            </div>
          </div>
          {/* youtube */}
          <div className="mt-7 w-full">
            <div className="text-sm font-semibold leading-5 text-neutral-800">
              {t("adminProfile.youtube")}
            </div>
            <div className="flex gap-3 px-5 py-2 mt-1 w-full text-base leading-6 text-gray-400 bg-white border border-gray-200">
              <img
                loading="lazy"
                src={youtube}
                className="w-5 h-5 aspect-square"
              />
              <input
                name="youtube"
                placeholder={t("adminProfile.youtube")}
                value={formik.values.youtube}
                onChange={formik.handleChange}
                onBlur={formik.handleBlur}
                data-testid="youtube"
                className="flex-auto bg-transparent text-black outline-none"
              />
              {formik.errors.youtube && formik.touched.youtube && (
                <div className="text-red-500 text-sm mt-1">
                  {formik.errors.youtube}
                </div>
              )}
            </div>
          </div>
        </div>
        {/* save button */}
        <div className="flex gap-5 mt-10">
          <button
            onClick={handleSocialProfileUpdate}
            type="button"
            data-testid="social-submit"
            className="px-6 py-2 text-white bg-[#0F4189] rounded-lg"
          >
            {t("buttons.saveChanges")}
          </button>
        </div>
      </div>
    </form>
  );
}
