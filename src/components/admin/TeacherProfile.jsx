import React, { useEffect, useState } from "react";
import { useFormik } from "formik";
import * as Yup from "yup";
import { axiosClient } from "../../services/axiosClient";
import EndPoints from "../../services/EndPoints";
import toast, { Toaster } from "react-hot-toast";
import Spinner from "../Spinner";
import { useTranslation } from "react-i18next";
import moment from "moment";
import DatePicker from "react-datepicker";
import Breadcrumbs from "../BreadCrumbs";
import { useSelector } from "react-redux";
import { FormControl, MenuItem, Select } from "@mui/material";

export default function TeacherProfile() {
  const [teacher, setTeacher] = useState([]);
  const [loading, setLoading] = useState(false);
  const { t } = useTranslation();
  const isDarkMode = useSelector((state) => state.appConfig.isDarkMode);

  // Validation schema using Yup to enforce validation rules on form fields
  const validationSchema = Yup.object({
    firstname: Yup.string().trim().required(t("validationError.firstName")),
    lastname: Yup.string().trim().required(t("validationError.lastName")),
    dob: Yup.date().required(t("validationError.dob")),
    gender: Yup.string().required(t("validationError.gender")),
    bloodGroup: Yup.string().required(t("validationError.bloodGroup")),
    university: Yup.string().trim().required(t("validationError.university")),
    degree: Yup.string().trim().required(t("validationError.qualification")),
    phone: Yup.string().trim().length(10).required(t("validationError.phone")),
  });

  // Formik configuration for managing form state, validation, and submission
  const formik = useFormik({
    initialValues: {
      firstname: "",
      lastname: "",
      dob: "",
      gender: "",
      bloodGroup: "",
      university: "",
      degree: "",
      phone: "",
    },
    validationSchema,
    onSubmit: async (values) => {
      try {
        setLoading(true);
        const res = await axiosClient.put(
          EndPoints.TEACHER.PROFILE_UPDATE,
          values
        );
        if (res?.statusCode === 200) {
          toast.success(res.result);
          getTeacher();
        }
      } catch (e) {
        toast.error(e);
      } finally {
        setLoading(false);
      }
    },
  });

  // Function to fetch teacher details from the server
  const getTeacher = async () => {
    try {
      setLoading(true);
      const res = await axiosClient.get(EndPoints.TEACHER.GET_TEACHER);
      if (res?.statusCode === 200) {
        setTeacher(res?.result);
        formik.setValues({
          firstname: res?.result?.firstname || "",
          lastname: res?.result?.lastname || "",
          dob: res?.result?.dob || "",
          gender: res?.result?.gender || "",
          bloodGroup: res?.result?.bloodGroup || "",
          university: res?.result?.university || "",
          degree: res?.result?.degree || "",
          phone: res?.result?.phone || "",
        });
      }
    } catch (e) {
      toast.error(e);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    getTeacher();
  }, []);

  return (
    <form
      onSubmit={formik.handleSubmit}
      className={`flex flex-col items-center ${
        isDarkMode ? "bg-background2" : "bg-whiteBackground2"
      }  p-6`}
    >
      {loading && (
        <div
          className={`fixed inset-0 flex items-center justify-center bg-[#fafafa] bg-opacity-50 z-30`}
        >
          <Spinner />
        </div>
      )}
      {/* Account Setting */}
      <div
        className={`flex flex-col p-10 w-full rounded-2xl max-md:px-5 max-md:m-10 max-md:max-w-full  ${
          isDarkMode ? "bg-background1" : "bg-whiteBackground"
        }`}
      >
        <Toaster position="top-center" reverseOrder={false} />
        <Breadcrumbs />
        <div
          className={`text-2xl font-bold tracking-tight leading-8  ${
            isDarkMode ? "text-textPrimary" : "text-textBlack"
          }`}
        >
          {t("adminProfile.accountSettings")}
        </div>

        <div className={`flex flex-wrap gap-5 mt-5 w-full`}>
          {/* firstName */}
          <div className={`flex flex-row w-full space-x-5`}>
            <div className={`w-full md:w-4/5`}>
              <label
                className={`text-sm font-semibold leading-5  ${
                  isDarkMode ? "text-textPrimary" : "text-textBlack"
                }`}
              >
                {t("labels.firstName")}
                <span className={`text-textRed`}>*</span>
              </label>
              <input
                name="firstname"
                placeholder={t("placeholders.firstName")}
                value={formik.values.firstname}
                onChange={(e) => {
                  e.target.value = e.target.value.replace(/[^a-zA-Z]/g, "");
                  formik.handleChange(e);
                }}
                onBlur={formik.handleBlur}
                data-testid="firstname"
                maxLength={15}
                className={`p-2 mt-1 w-full text-base leading-6 ${
                  formik.errors.firstname && formik.touched.firstname
                    ? "border-borderRed"
                    : "border-borderLine2"
                } ${
                  isDarkMode ? "text-textPrimary" : "text-textBlack"
                } bg-transparent border`}
              />
              {formik.errors.firstname && formik.touched.firstname && (
                <div className={`text-textRed text-sm mt-1`}>
                  {formik.errors.firstname}
                </div>
              )}
            </div>
            {/* lastname */}
            <div className={`w-full md:w-4/5`}>
              <label
                className={`text-sm font-semibold leading-5  ${
                  isDarkMode ? "text-textPrimary" : "text-textBlack"
                }`}
              >
                {t("labels.lastName")} <span className={`text-textRed`}>*</span>
              </label>
              <input
                name="lastname"
                placeholder={t("placeholders.lastName")}
                value={formik.values.lastname}
                onChange={(e) => {
                  e.target.value = e.target.value.replace(/[^a-zA-Z]/g, "");
                  formik.handleChange(e);
                }}
                onBlur={formik.handleBlur}
                data-testid="lastname"
                maxLength={15}
                className={`p-2 mt-1 w-full text-base leading-6 ${
                  formik.errors.lastname && formik.touched.lastname
                    ? "border-borderRed"
                    : "border-borderLine2"
                } ${
                  isDarkMode ? "text-textPrimary" : "text-textBlack"
                } bg-transparent border`}
              />
              {formik.errors.lastname && formik.touched.lastname && (
                <div className={`text-textRed text-sm mt-1`}>
                  {formik.errors.lastname}
                </div>
              )}
            </div>
          </div>

          <div className="flex flex-row w-full space-x-5">
            {/* DOB */}
            <div className="w-full md:w-4/5">
              <label
                className={`text-sm font-semibold leading-5 ${
                  isDarkMode ? "text-textPrimary" : "text-textBlack"
                }`}
              >
                {t("labels.dob")} <span className="text-textRed">*</span>
              </label>
              <DatePicker
                selected={
                  formik.values.dob
                    ? moment(formik.values.dob, "DD/MM/YYYY").toDate()
                    : null
                }
                onChange={(date) =>
                  formik.setFieldValue("dob", moment(date).format("DD/MM/YYYY"))
                }
                dateFormat="dd/MM/yyyy"
                placeholderText={t("placeholders.dob")}
                className={`p-2 mt-1 w-full text-base leading-6 rounded-md ${
                  formik.errors.dob && formik.touched.dob
                    ? "border border-borderRed"
                    : "border border-borderLine2"
                } ${
                  isDarkMode
                    ? "bg-[#1a1a1a] text-textPrimary"
                    : "bg-white text-textBlack"
                } focus:outline-none`}
                wrapperClassName="w-full"
                maxDate={new Date()}
                onKeyDown={(e) => e.preventDefault()}
                showMonthDropdown
                showYearDropdown
                scrollableYearDropdown
                dropdownMode="scroll"
              />
              {formik.errors.dob && formik.touched.dob && (
                <div className={`text-textRed text-sm mt-1`}>
                  {formik.errors.dob}
                </div>
              )}
            </div>
            {/* gender dropdown */}
            <div className="w-full md:w-4/5">
              <label
                className={`text-sm font-semibold leading-5 ${
                  isDarkMode ? "text-textPrimary" : "text-textBlack"
                }`}
              >
                {t("labels.gender")} <span className="text-textRed">*</span>
              </label>
              <FormControl
                fullWidth
                variant="outlined"
                error={formik.errors.gender && formik.touched.gender}
                sx={{
                  backgroundColor: isDarkMode ? "" : "white",
                  "& .MuiOutlinedInput-notchedOutline": {
                    border: "none",
                  },
                  "& .MuiInputBase-root, & .MuiSvgIcon-root": {
                    color: isDarkMode ? "#E3E8F3" : "black",
                  },
                }}
              >
                <Select
                  name="gender"
                  value={formik.values.gender}
                  onChange={formik.handleChange}
                  onBlur={formik.handleBlur}
                  data-testid="gender"
                  displayEmpty
                  renderValue={(selected) => {
                    if (!selected) {
                      return <span>{t("placeholders.selectGender")}</span>;
                    }
                    return selected;
                  }}
                  sx={{
                    mt: 0.5,
                    width: "100%",
                    fontSize: "1rem",
                    color: formik.values.gender
                      ? isDarkMode
                        ? "#E3E8F3"
                        : "black"
                      : "gray",
                    backgroundColor: isDarkMode ? "" : "white",
                    border:
                      formik.errors.gender && formik.touched.gender
                        ? "1px solid red"
                        : "1px solid #2b2e4a40",
                    "& .MuiSelect-select": {
                      fontSize: "1rem",
                      lineHeight: "1.5rem",
                      p: 1,
                    },
                  }}
                  MenuProps={{
                    PaperProps: {
                      sx: {
                        backgroundColor: isDarkMode ? "#1a1a1a" : "white",
                        color: isDarkMode ? "#E3E8F3" : "black",
                        borderRadius: "0.5rem",
                      },
                    },
                  }}
                >
                  <MenuItem value="" disabled>
                    {t("placeholders.selectGender")}
                  </MenuItem>
                  {["Male", "Female", "Other"].map((val, i) => (
                    <MenuItem
                      key={i}
                      value={val}
                      sx={{
                        backgroundColor: isDarkMode ? "#1a1a1a" : "white",
                        color: isDarkMode ? "#E3E8F3" : "black",
                        borderRadius: "0.5rem",
                        "&:hover": {
                          backgroundColor: isDarkMode ? "#2a2a2a" : "#E9EEF2",
                        },
                      }}
                    >
                      {val}
                    </MenuItem>
                  ))}
                </Select>
              </FormControl>
              {formik.errors.gender && formik.touched.gender && (
                <div className="text-textRed text-sm mt-1">
                  {formik.errors.gender}
                </div>
              )}
            </div>
          </div>

          <div className={`flex flex-row w-full space-x-5`}>
            {/* BloodGroup dropdown */}
            <div className="w-full md:w-4/5">
              <label
                className={`text-sm font-semibold leading-5 ${
                  isDarkMode ? "text-textPrimary" : "text-textBlack"
                }`}
              >
                {t("labels.bloodGroup")} <span className="text-textRed">*</span>
              </label>
              <FormControl
                fullWidth
                variant="outlined"
                error={formik.errors.bloodGroup && formik.touched.bloodGroup}
                sx={{
                  backgroundColor: isDarkMode ? "" : "white",
                  "& .MuiOutlinedInput-notchedOutline": {
                    border: "none",
                  },
                  "& .MuiInputBase-root, & .MuiSvgIcon-root": {
                    color: isDarkMode ? "#E3E8F3" : "black",
                  },
                }}
              >
                <Select
                  name="bloodGroup"
                  value={formik.values.bloodGroup}
                  onChange={formik.handleChange}
                  onBlur={formik.handleBlur}
                  data-testid="bloodGroup"
                  displayEmpty
                  renderValue={(selected) => {
                    if (!selected) {
                      return <span>{t("placeholders.bloodGroup")}</span>;
                    }
                    return selected;
                  }}
                  sx={{
                    mt: 0.5,
                    width: "100%",
                    fontSize: "1rem",
                    color: formik.values.bloodGroup
                      ? isDarkMode
                        ? "#E3E8F3"
                        : "black"
                      : "gray",
                    backgroundColor: isDarkMode ? "" : "white",
                    border:
                      formik.errors.bloodGroup && formik.touched.bloodGroup
                        ? "1px solid red"
                        : "1px solid #2b2e4a40",
                    "& .MuiSelect-select": {
                      fontSize: "1rem",
                      lineHeight: "1.5rem",
                      p: 1,
                    },
                  }}
                  MenuProps={{
                    PaperProps: {
                      sx: {
                        backgroundColor: isDarkMode ? "#1a1a1a" : "white",
                        color: isDarkMode ? "#E3E8F3" : "black",
                        borderRadius: "0.5rem",
                      },
                    },
                  }}
                >
                  <MenuItem value="" disabled>
                    {t("placeholders.bloodGroup")}
                  </MenuItem>
                  {["A+", "A-", "B+", "B-", "AB+", "AB-", "O+", "O-"].map(
                    (val, i) => (
                      <MenuItem
                        key={i}
                        value={val}
                        sx={{
                          backgroundColor: isDarkMode ? "#1a1a1a" : "white",
                          color: isDarkMode ? "#E3E8F3" : "black",
                          borderRadius: "0.5rem",
                          "&:hover": {
                            backgroundColor: isDarkMode ? "#2a2a2a" : "#E9EEF2",
                          },
                        }}
                      >
                        {val}
                      </MenuItem>
                    )
                  )}
                </Select>
              </FormControl>
              {formik.errors.bloodGroup && formik.touched.bloodGroup && (
                <div className="text-textRed text-sm mt-1">
                  {formik.errors.bloodGroup}
                </div>
              )}
            </div>

            {/* phone */}
            <div className={`w-full md:w-4/5`}>
              <label
                className={`text-sm font-semibold leading-5  ${
                  isDarkMode ? "text-textPrimary" : "text-textBlack"
                }`}
              >
                {t("labels.phone")} <span className={`text-textRed`}>*</span>
              </label>
              <input
                name="phone"
                placeholder={t("placeholders.phone")}
                value={formik.values.phone}
                onChange={formik.handleChange}
                onBlur={formik.handleBlur}
                data-testid="phone"
                className={`p-2 mt-1 w-full text-base leading-6 ${
                  formik.errors.phone && formik.touched.phone
                    ? "border-borderRed"
                    : "border-borderLine2"
                } ${
                  isDarkMode ? "text-textPrimary" : "text-textBlack"
                } bg-transparent border`}
              />
              {formik.errors.phone && formik.touched.phone && (
                <div className={`text-textRed text-sm mt-1`}>
                  {formik.errors.phone}
                </div>
              )}
            </div>
          </div>

          <div className={`flex flex-row w-full space-x-5`}>
            {/* university */}
            <div className={`w-full md:w-4/5`}>
              <label
                className={`text-sm font-semibold leading-5  ${
                  isDarkMode ? "text-textPrimary" : "text-textBlack"
                }`}
              >
                {t("labels.university")}{" "}
                <span className={`text-textRed`}>*</span>
              </label>
              <input
                name="university"
                placeholder={t("labels.university")}
                value={formik.values.university}
                onChange={formik.handleChange}
                onBlur={formik.handleBlur}
                data-testid="university"
                className={`p-2 mt-1 w-full text-base leading-6 ${
                  formik.errors.university && formik.touched.university
                    ? "border-borderRed"
                    : "border-borderLine2"
                } ${
                  isDarkMode ? "text-textPrimary" : "text-textBlack"
                } bg-transparent border`}
              />
              {formik.errors.university && formik.touched.university && (
                <div className={`text-textRed text-sm mt-1`}>
                  {formik.errors.university}
                </div>
              )}
            </div>
            {/* Qualification */}
            <div className={`w-full md:w-4/5`}>
              <label
                className={`text-sm font-semibold leading-5  ${
                  isDarkMode ? "text-textPrimary" : "text-textBlack"
                }`}
              >
                {t("labels.qualification")}{" "}
                <span className={`text-textRed`}>*</span>
              </label>
              <input
                name="degree"
                placeholder={t("labels.qualification")}
                value={formik.values.degree}
                onChange={formik.handleChange}
                onBlur={formik.handleBlur}
                data-testid="degree"
                className={`p-2 mt-1 w-full text-base leading-6 ${
                  formik.errors.degree && formik.touched.degree
                    ? "border-borderRed"
                    : "border-borderLine2"
                } ${
                  isDarkMode ? "text-textPrimary" : "text-textBlack"
                } bg-transparent border`}
              />

              {formik.errors.degree && formik.touched.degree && (
                <div className={`text-textRed text-sm mt-1`}>
                  {formik.errors.degree}
                </div>
              )}
            </div>
          </div>

          {/* save button */}
          <div className={`flex gap-5 mt-7`}>
            <button
              type="submit"
              data-testid="submit"
              className={`px-6 py-2 text-textPrimary bg-backgroundBlue rounded-lg`}
            >
              {t("buttons.saveChanges")}
            </button>
          </div>
        </div>
      </div>
    </form>
  );
}
