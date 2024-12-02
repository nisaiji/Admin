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
import Countries from "../../utils/Countries.json";
import StateAndDistricts from "../../utils/StatesAndDistricts.json";

export default function AdminProfile() {
  const [admin, setAdmin] = useState([]);
  const [loading, setLoading] = useState(false);
  const [filteredCities, setFilteredCities] = useState([]);
  const [selectedCountry, setSelectedCountry] = useState("");
  const [states, setStates] = useState([]);
  const [districts, setDistricts] = useState([]);
  const { t } = useTranslation();

  // vaidation schema
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

  // formik for handeling form
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

  // get admin api
  const getadmin = async () => {
    try {
      setLoading(true);
      const res = await axiosClient.get(EndPoints.ADMIN.GET_ADMIN);
      if (res?.statusCode === 200) {
        const initialState = res.result.state || "";
        const state = statesAndCity.states.find((s) => s.name === initialState);
        setFilteredCities(state ? state.cities : []);
        setAdmin(res?.result);
        formik.setValues({
          ...formik.initialValues,
          ...res.result,
          state: initialState,
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
        toast.error(e.message);
        return;
      }

      setLoading(true);

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

  // soial details update api
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
    formik.setFieldValue("country", country);

    // Reset fields when changing the country
    formik.setFieldValue("state", "");
    formik.setFieldValue("district", "");

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
      className="flex flex-col items-center bg-[#F4F5F6] p-6"
    >
      {loading && (
        <div className="fixed inset-0 flex items-center justify-center bg-white bg-opacity-50 z-30">
          <Spinner />
        </div>
      )}
      {/* Account Setting */}
      <div className="flex flex-col p-10 w-full rounded-2xl bg-white max-md:px-5 max-md:m-10 max-md:max-w-full">
        <Toaster position="top-center" reverseOrder={false} />
        <div className="text-4xl font-bold tracking-tight leading-8 text-neutral-800">
          {t("adminProfile.accountSettings")}
        </div>

        <div className="flex flex-wrap gap-5 mt-5 w-full">
          {/* School Name and Email */}
          <div className="flex flex-row w-full space-x-5">
            <div className="w-full md:w-4/5">
              <label className="text-sm font-semibold leading-5 text-neutral-800">
                {t("adminProfile.schoolName")}{" "}
                <span className="text-red-500">*</span>
              </label>
              <input
                name="schoolName"
                placeholder={t("adminProfile.schoolName")}
                value={formik.values.schoolName}
                onChange={formik.handleChange}
                onBlur={formik.handleBlur}
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

            <div className="w-full md:w-4/5">
              <label className="text-sm font-semibold leading-5 text-neutral-800">
                {t("adminProfile.Email")}{" "}
                <span className="text-red-500">*</span>
              </label>
              <input
                name="email"
                placeholder={t("adminProfile.Email")}
                value={formik.values.email}
                onChange={formik.handleChange}
                onBlur={formik.handleBlur}
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

          {/* Principal and Admin */}
          <div className="flex flex-row w-full space-x-5">
            <div className="w-full md:w-4/5">
              <label className="text-sm font-semibold leading-5 text-neutral-800">
                {t("adminProfile.principal")}{" "}
                <span className="text-red-500">*</span>
              </label>
              <input
                name="principal"
                placeholder={t("adminProfile.principal")}
                value={formik.values.principal}
                onChange={formik.handleChange}
                onBlur={formik.handleBlur}
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

            <div className="w-full md:w-4/5">
              <label className="text-sm font-semibold leading-5 text-neutral-800">
                {t("adminProfile.adminName")}{" "}
                <span className="text-red-500">*</span>
              </label>
              <input
                name="username"
                placeholder={t("adminProfile.adminName")}
                value={formik.values.username}
                onChange={formik.handleChange}
                onBlur={formik.handleBlur}
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

          {/* Affiliation No and School No */}
          <div className="flex flex-row w-full space-x-5">
            <div className="w-full md:w-4/5">
              <label className="text-sm font-semibold leading-5 text-neutral-800">
                {t("adminProfile.affiliationNumber")}{" "}
                <span className="text-red-500">*</span>
              </label>
              <input
                name="affiliationNo"
                placeholder={t("adminProfile.affiliationNumber")}
                value={formik.values.affiliationNo}
                onChange={formik.handleChange}
                onBlur={formik.handleBlur}
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

            <div className="w-full md:w-4/5">
              <label className="text-sm font-semibold leading-5 text-neutral-800">
                {t("adminProfile.schoolNumber")}
              </label>
              <input
                name="schoolNumber"
                placeholder={t("adminProfile.schoolNumber")}
                value={formik.values.schoolNumber}
                onChange={formik.handleChange}
                onBlur={formik.handleBlur}
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

          {/* Address and School Board */}
          <div className="flex flex-row w-full space-x-5">
            <div className="w-full md:w-4/5">
              <label className="text-sm font-semibold leading-5 text-neutral-800">
                {t("adminProfile.schoolAddress")}{" "}
                <span className="text-red-500">*</span>
              </label>
              <input
                name="address"
                placeholder={t("adminProfile.schoolAddress")}
                value={formik.values.address}
                onChange={formik.handleChange}
                onBlur={formik.handleBlur}
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

            <div className="w-full md:w-4/5">
              <label className="text-sm font-semibold leading-5 text-neutral-800">
                {t("adminProfile.schoolBoard")}{" "}
                <span className="text-red-500">*</span>
              </label>
              <select
                name="schoolBoard"
                value={formik.values.schoolBoard}
                onChange={formik.handleChange}
                onBlur={formik.handleBlur}
                className={`p-2 mt-1 w-full text-base leading-6 ${
                  formik.errors.schoolBoard && formik.touched.schoolBoard
                    ? "border-red-500"
                    : "border-gray-200"
                } text-black bg-white border`}
              >
                <option value="">{t("adminProfile.selectSchoolBoard")}</option>
                <option value="CBSE">CBSE</option>
                <option value="ICSE">ICSE</option>
                <option value="StateBoard">State Board</option>
                <option value="IB">IB</option>
                <option value="Other">{t("options.other")}</option>
              </select>
              {formik.errors.schoolBoard && formik.touched.schoolBoard && (
                <div className="text-red-500 text-sm mt-1">
                  {formik.errors.schoolBoard}
                </div>
              )}
            </div>
          </div>

          {/* Country, State, and District */}
          <div className="flex flex-row w-full space-x-5">
            {/* country */}
            <div className="w-full md:w-1/3">
              <label className="text-sm font-semibold leading-5 text-neutral-800">
                {t("adminProfile.country")}{" "}
                <span className="text-red-500">*</span>
              </label>
              <select
                className={`p-2 mt-1 w-full text-base leading-6 ${
                  formik.errors.country && formik.touched.country
                    ? "border-red-500"
                    : "border-gray-200"
                } text-black bg-white border`}
                name="country"
                value={formik.values.country}
                onChange={handleCountryChange}
                onBlur={formik.handleBlur}
              >
                <option value="" label={t("placeholders.selectCountry")} />
                {Countries.map((country) => (
                  <option key={country.code} value={country.name}>
                    {country.name}
                  </option>
                ))}
              </select>

              {formik.errors.country && formik.touched.country && (
                <div className="text-red-500 text-sm mt-1">
                  {formik.errors.country}
                </div>
              )}
            </div>
            {/* state */}
            <div className="w-full md:w-1/3">
              <label className="text-sm font-semibold leading-5 text-neutral-800">
                {t("adminProfile.state")}{" "}
                <span className="text-red-500">*</span>
              </label>
              {selectedCountry === "India" ? (
                <select
                  onBlur={formik.handleBlur}
                  className={`p-2 mt-1 w-full text-base leading-6 ${
                    formik.errors.state && formik.touched.state
                      ? "border-red-500"
                      : "border-gray-200"
                  } text-black bg-white border`}
                  name="state"
                  value={formik.values.state}
                  onChange={handleStateChange}
                >
                  <option value="" label={t("placeholders.selectState")} />
                  {states.map((state) => (
                    <option key={state.state} value={state.state}>
                      {state.state}
                    </option>
                  ))}
                </select>
              ) : (
                <input
                  className={`p-2 mt-1 w-full text-base leading-6 ${
                    formik.errors.schoolBoard && formik.touched.schoolBoard
                      ? "border-red-500"
                      : "border-gray-200"
                  } text-black bg-white border`}
                  type="text"
                  name="state"
                  placeholder={t("placeholders.state")}
                  onChange={formik.handleChange}
                  value={formik.values.state}
                  onBlur={formik.handleBlur}
                />
              )}
              {formik.errors.state && formik.touched.state && (
                <div className="text-red-500 text-sm mt-1">
                  {formik.errors.state}
                </div>
              )}
            </div>
            {/* district */}
            <div className="w-full md:w-1/3">
              <label className="text-sm font-semibold leading-5 text-neutral-800">
                {t("adminProfile.district")}{" "}
                <span className="text-red-500">*</span>
              </label>
              {selectedCountry === "India" ? (
                <select
                  className={`p-2 mt-1 w-full text-base leading-6 ${
                    formik.errors.state && formik.touched.state
                      ? "border-red-500"
                      : "border-gray-200"
                  } text-black bg-white border`}
                  name="district"
                  value={formik.values.district}
                  onChange={formik.handleChange}
                  onBlur={formik.handleBlur}
                >
                  <option value="" label={t("placeholders.selectDistrict")} />
                  {districts.map((district) => (
                    <option key={district} value={district}>
                      {district}
                    </option>
                  ))}
                </select>
              ) : (
                <input
                  type="text"
                  name="district"
                  placeholder={t("placeholders.district")}
                  onChange={formik.handleChange}
                  value={formik.values.district}
                  onBlur={formik.handleBlur}
                  className={`p-2 mt-1 w-full text-base leading-6 ${
                    formik.errors.schoolBoard && formik.touched.schoolBoard
                      ? "border-red-500"
                      : "border-gray-200"
                  } text-black bg-white border`}
                />
              )}
              {formik.errors.district && formik.touched.district && (
                <div className="text-red-500 text-sm mt-1">
                  {formik.errors.district}
                </div>
              )}
            </div>
          </div>

          {/* city and Pincode */}
          <div className="flex flex-row w-full space-x-5">
            <div className="w-full md:w-4/5">
              <label className="text-sm font-semibold leading-5 text-neutral-800">
                {t("adminProfile.city")} <span className="text-red-500">*</span>
              </label>
              <input
                name="city"
                placeholder={t("adminProfile.city")}
                value={formik.values.city}
                onChange={formik.handleChange}
                onBlur={formik.handleBlur}
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

            <div className="w-full md:w-4/5">
              <label className="text-sm font-semibold leading-5 text-neutral-800">
                {t("adminProfile.pincode")}{" "}
                <span className="text-red-500">*</span>
              </label>
              <input
                name="pincode"
                placeholder={t("adminProfile.pincode")}
                value={formik.values.pincode}
                onChange={formik.handleChange}
                onBlur={formik.handleBlur}
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
              // disabled={formik.isSubmitting || !formik.isValid}
              className="px-6 py-2 text-white bg-[#4834D4] rounded-lg"
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
            <div className="flex items-center gap-1.5 font-medium text-[#4834D4]">
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
              className="flex-auto text-black bg-transparent outline-none"
            />
            {formik.errors.phone && formik.touched.phone && (
              <div className="text-red-500 text-sm mt-1">
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
                placeholder={t("adminProfile.userName")}
                value={formik.values.facebook}
                onChange={formik.handleChange}
                onBlur={formik.handleBlur}
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
                placeholder={t("adminProfile.userName")}
                value={formik.values.linkedin}
                onChange={formik.handleChange}
                onBlur={formik.handleBlur}
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
                placeholder={t("adminProfile.userName")}
                value={formik.values.twitter}
                onChange={formik.handleChange}
                onBlur={formik.handleBlur}
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
                placeholder={t("adminProfile.Phone")}
                value={formik.values.whatsapp}
                onChange={formik.handleChange}
                onBlur={formik.handleBlur}
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
                placeholder={t("adminProfile.userName")}
                value={formik.values.youtube}
                onChange={formik.handleChange}
                onBlur={formik.handleBlur}
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
            disabled={formik.isSubmitting || !formik.isValid}
            className="px-6 py-2 text-white bg-[#4834D4] rounded-lg"
          >
            {t("buttons.saveChanges")}
          </button>
        </div>
      </div>
    </form>
  );
}
