import React, { useState } from "react";
import { useFormik } from "formik";
import { useLocation, useNavigate } from "react-router-dom";
import toast, { Toaster } from "react-hot-toast";
import { axiosClient } from "../../services/axiosClient";
import Spinner from "../Spinner";
import EndPoints from "../../services/EndPoints";
import * as Yup from "yup";
import { useTranslation } from "react-i18next";
import REGEX from "../../utils/regix";
import mail from "../../assets/images/mail.png";
import India from "../../assets/images/India.png";
import location from "../../assets/images/location.png";
import moment from "moment";
import Breadcrumbs from "../BreadCrumbs";
import { FormControl, MenuItem, Select, TextField } from "@mui/material";
import { DatePicker, LocalizationProvider } from "@mui/x-date-pickers";
import { AdapterMoment } from "@mui/x-date-pickers/AdapterMoment";
import { useSelector } from "react-redux";

/**
 * Capitalizes the first letter of a string and converts the rest to lowercase.
 * @param {string} str - The input string.
 * @returns {string} The capitalized string.
 */
const capitalize = (str) =>
  str.charAt(0).toUpperCase() + str.slice(1).toLowerCase();

export default function StudentUpdate() {
  const navigate = useNavigate();
  const student = useLocation().state;
  const [t] = useTranslation();
  const [loading, setLoading] = useState(false);
  const isDarkMode = useSelector((state) => state.appConfig.isDarkMode);

  /**
   * Validation schema for the student update form.
   * Defines required fields, types, and custom validation rules.
   */
  const validationSchema = Yup.object({
    firstname: Yup.string().required(t("validationError.firstName")),
    lastname: Yup.string().required(t("validationError.lastName")),
    gender: Yup.string().required(t("validationError.gender")),
    // bloodGroup: Yup.string().required(t("validationError.bloodGroup")),
    // dob: Yup.date()
    //   .nullable()
    //   .required(t("validationError.dob"))
    //   .transform((value, originalValue) =>
    //     moment(originalValue, "DD/MM/YYYY").isValid()
    //       ? moment(originalValue, "DD/MM/YYYY").toDate()
    //       : null
    //   ),
    // address: Yup.string().required(t("validationError.address")),
    parentName: Yup.string().required(t("validationError.parentName")),
    // parentGender: Yup.string().required(t("validationError.gender")),
    // parentAge: Yup.string().required(t("validationError.age")),
    // parentEmail: Yup.string()
    //   .email(t("validationError.emailAddress"))
    //   .required(t("validationError.email")),
    phone: Yup.string()
      .required(t("validationError.phone"))
      .matches(REGEX.PHONE, t("validationError.phoneNumber"))
      .test(
        "starts-with-1-to-5",
        t("validationError.phoneStart"),
        (value) => value && REGEX.PHONE_TEST.test(value)
      ),
    // parentQualification: Yup.string().required(
    //   t("validationError.qualification")
    // ),
    // parentOccupation: Yup.string().required(t("validationError.occupation")),
    // parentAddress: Yup.string().required(t("validationError.address")),
  });
  // console.log(student);

  /**
   * Formik initialization for managing form state and handling submission.
   * Handles input values, validation, and API calls for updating student data.
   */
  const formik = useFormik({
    initialValues: {
      firstname: student?.firstname || "",
      lastname: student?.lastname || "",
      gender: student?.gender || "",
      bloodGroup: student?.bloodGroup || "",
      dob: student?.dob ? moment(student?.dob).format("DD/MM/YYYY") : "",
      address: student?.address || "",
      parentName: student?.parentFullName || "",
      parentGender: student?.parentGender || "",
      parentAge: student?.parentAge || "",
      parentEmail: student?.parentEmail || "",
      phone: student?.parentPhone || "",
      parentQualification: student?.parentQualification || "",
      parentOccupation: student?.parentOccupation || "",
      parentAddress: student?.parentAddress || "",
    },
    validationSchema,
    // update student api
    onSubmit: async (values) => {
      try {
        setLoading(true);
        // Capitalize and clean fields
        const cleanedValues = {
          ...values,
          firstname: capitalize(values.firstname),
          lastname: capitalize(values.lastname),
          address: capitalize(values.address),
          parentName: capitalize(values.parentName),
          parentEmail: values.parentEmail?.toLowerCase(),
          parentQualification: capitalize(values.parentQualification),
          parentOccupation: capitalize(values.parentOccupation),
          parentAddress: capitalize(values.parentAddress),
        };
        // Remove keys with empty string values
        const filteredValues = Object.fromEntries(
          Object.entries(cleanedValues).filter(([_, value]) => value !== "")
        );
        const response = await axiosClient.put(
          `${EndPoints.ADMIN.STUDENT_UPDATE}/${student?.studentId}`,
          filteredValues
        );

        if (response?.statusCode === 200) {
          toast.success(response.result);
          navigate(-1);
        }
      } catch (e) {
        toast.error(e);
      } finally {
        setLoading(false);
      }
    },
  });

  // student form fields
  const studentFields = [
    {
      label: t("labels.firstName"),
      name: "firstname",
      type: "text",
      placeholder: t("placeholders.firstName"),
    },
    {
      label: t("labels.lastName"),
      name: "lastname",
      type: "text",
      placeholder: t("placeholders.lastName"),
    },
    {
      label: t("labels.gender"),
      name: "gender",
      type: "select",
      options: [t("options.male"), t("options.female"), t("options.other")],
    },
    {
      label: t("labels.bloodGroup"),
      name: "bloodGroup",
      type: "select",
      options: ["A+", "A-", "B+", "B-", "O+", "O-", "AB+", "AB-"],
    },
    {
      label: t("labels.dob"),
      name: "dob",
      type: "date",
      placeholder: t("placeholders.date"),
    },
    {
      label: t("labels.address"),
      name: "address",
      type: "text",
      placeholder: t("placeholders.address"),
    },
  ];

  // parent form fields
  const guardianFields = [
    {
      label: t("labels.fullName"),
      name: "parentName",
      type: "text",
      placeholder: t("placeholders.fullName"),
    },
    {
      label: t("labels.gender"),
      name: "parentGender",
      type: "select",
      options: [t("options.male"), t("options.female"), t("options.other")],
    },
    {
      label: t("labels.age"),
      name: "parentAge",
      type: "text",
      placeholder: t("placeholders.age"),
    },
    {
      label: t("labels.emailAddress"),
      name: "parentEmail",
      type: "email",
      placeholder: t("placeholders.emailAddress"),
      icon: { src: mail, width: 24, height: 24, top: 7 },
    },
    {
      label: t("labels.phoneNumber"),
      name: "phone",
      type: "text",
      placeholder: t("placeholders.phoneNumber"),
      icon: { src: India, width: 24, height: 20, top: 9 },
    },
    {
      label: t("labels.qualification"),
      name: "parentQualification",
      type: "text",
      placeholder: t("placeholders.qualification"),
    },
    {
      label: t("labels.occupation"),
      name: "parentOccupation",
      type: "text",
      placeholder: t("placeholders.occupation"),
    },
    {
      label: t("labels.address"),
      name: "parentAddress",
      type: "text",
      placeholder: t("placeholders.address"),
      icon: { src: location, width: 20, height: 20, top: 9 },
    },
  ];

  /**
   * Renders input fields dynamically based on the provided configuration.
   * @param {Array} fields - The fields to render.
   * @returns {JSX.Element} The rendered input fields.
   */
  const renderFields = (fields) => (
    <div className={`grid grid-cols-2 gap-4`}>
      {fields.map(({ label, name, type, placeholder, options, icon }) => (
        <div key={name} className={`flex flex-col mx-4 mt-3`}>
          <label
            className={`text-l font-semibold ${
              isDarkMode ? "text-textPrimary" : "text-textBlack"
            }`}
          >
            {label}
          </label>
          <div className={`relative mt-2`}>
            {type === "select" ? (
              <FormControl
                fullWidth
                variant="outlined"
                sx={{
                  border: "1px solid #2b2e4a80",
                  borderRadius: "8px",
                  backgroundColor: isDarkMode ? "" : "white",
                  "& .MuiOutlinedInput-notchedOutline": {
                    border: "none",
                  },
                  "& .Mui-focused .MuiOutlinedInput-notchedOutline": {
                    borderColor: isDarkMode ? "#E3E8F3" : "black",
                  },
                  "& .MuiInputBase-root": {
                    color: isDarkMode ? "#E3E8F3" : "black",
                  },
                  "& .MuiSvgIcon-root": {
                    color: isDarkMode ? "#E3E8F3" : "black",
                  },
                }}
              >
                <Select
                  labelId={`${name}-label`}
                  id={`${name}-select`}
                  name={name}
                  value={formik.values[name]}
                  label={label}
                  onChange={formik.handleChange}
                  displayEmpty
                  sx={{
                    border: "1px solid #2b2e4a80",
                    borderRadius: "0.5rem",
                    height: "40px",
                    backgroundColor: isDarkMode ? "" : "white",
                    color:
                      formik.values[name] === ""
                        ? "gray"
                        : isDarkMode
                        ? "#E3E8F3"
                        : "black",
                    "& .MuiOutlinedInput-notchedOutline": {
                      border: "none",
                    },
                  }}
                  MenuProps={{
                    PaperProps: {
                      sx: {
                        backgroundColor: isDarkMode ? "#1a1a1a" : "white",
                        color: isDarkMode ? "#E3E8F3" : "black",
                      },
                    },
                  }}
                >
                  <MenuItem value="" disabled>
                    {label}
                  </MenuItem>
                  {options.map((option) => (
                    <MenuItem
                      key={option}
                      value={option}
                      sx={{
                        backgroundColor: isDarkMode ? "#1a1a1a" : "white",
                        color: isDarkMode ? "#E3E8F3" : "black",
                        "&:hover": {
                          backgroundColor: isDarkMode ? "#2a2a2a" : "#E9EEF2",
                        },
                      }}
                    >
                      {option}
                    </MenuItem>
                  ))}
                </Select>
              </FormControl>
            ) : type === "date" ? (
              <LocalizationProvider dateAdapter={AdapterMoment}>
                <DatePicker
                  views={["day", "month", "year"]}
                  format="DD/MM/YYYY"
                  value={
                    formik.values.dob
                      ? moment(formik.values.dob, "DD/MM/YYYY")
                      : null
                  }
                  maxDate={moment().startOf("day")}
                  onChange={(date) => {
                    if (date) {
                      formik.setFieldValue(
                        "dob",
                        moment(date).format("DD/MM/YYYY")
                      );
                    }
                  }}
                  className={`w-full`}
                  renderInput={(params) => (
                    <TextField
                      {...params}
                      placeholder={t("placeholders.date")}
                      variant="outlined"
                    />
                  )}
                  sx={{
                    width: "100%",
                    height: "40px",
                    border: "2px solid #2b2e4a80",
                    borderRadius: "8px",
                    backgroundColor: isDarkMode ? "" : "white",
                    color: isDarkMode ? "#E3E8F3" : "black",
                    "& .MuiOutlinedInput-root": {
                      padding: 1,
                      fontSize: "16px",
                      minHeight: "40px",
                      color: isDarkMode ? "#E3E8F3" : "black",
                    },
                    "& .MuiInputBase-input": {
                      fontSize: "16px",
                      padding: 1,
                      height: "100%",
                      color: isDarkMode ? "#E3E8F3" : "black",
                    },
                    "& .MuiSvgIcon-root": {
                      color: isDarkMode ? "#E3E8F3" : "black",
                    },
                    "& .MuiOutlinedInput-notchedOutline": {
                      border: "none",
                    },
                  }}
                />
              </LocalizationProvider>
            ) : (
              <input
                type={type}
                name={name}
                placeholder={placeholder}
                onChange={formik.handleChange}
                onBlur={formik.handleBlur}
                maxLength={
                  name === "phone"
                    ? 10
                    : name === "firstname" || name == "lastname"
                    ? 15
                    : name == "parentName"
                    ? 20
                    : ""
                }
                value={formik.values[name]}
                className={` ${
                  isDarkMode ? "text-textPrimary" : "text-textBlack"
                } border-2 border-borderLine bg-transparent rounded-lg pl-2 pr-10 py-1.5 w-full`}
              />
            )}
            {icon && (
              <img
                src={icon.src}
                className={`absolute right-2`}
                style={{
                  top: icon.top,
                  width: icon.width,
                  height: icon.height,
                }}
                alt=""
              />
            )}
            {formik.touched[name] && formik.errors[name] && (
              <div className={`text-red-500 text-sm`}>
                {formik.errors[name]}
              </div>
            )}
          </div>
        </div>
      ))}
    </div>
  );

  return (
    <div
      className={`flex justify-center items-center w-full h-full pt-[25px] ${
        isDarkMode ? "bg-background2" : "bg-whiteBackground2"
      }`}
    >
      {loading && (
        <div
          className={`fixed inset-0 flex items-center justify-center bg-whiteBackground bg-opacity-50 z-30`}
        >
          <Spinner />
        </div>
      )}
      <Toaster position="top-center" reverseOrder={false} />
      <div
        className={`${
          isDarkMode ? "bg-background1" : "bg-whiteBackground"
        } rounded-2xl w-full mx-6 flex flex-col items-start py-3 px-10 box-border`}
      >
        <Breadcrumbs />
        <h1
          className={`text-2xl font-poppins-bold mt-3  ${
            isDarkMode ? "text-textPrimary" : "text-textBlack"
          }`}
        >
          {t("titles.studentDetails")}
        </h1>
        <div className={`w-full`}>
          <h2
            className={`text-lg font-poppins-regular mt-6 text-left  ${
              isDarkMode ? "text-textPrimary" : "text-textBlack"
            }`}
          >
            {t("titles.personalDetails")}
          </h2>
          {/* student input fields */}
          <div
            className={`${
              isDarkMode ? "" : "bg-[rgba(70,69,144,0.05)]"
            } w-full p-5 box-border flex flex-col items-center my-5`}
          >
            <form onSubmit={formik.handleSubmit} className={`w-full`}>
              {renderFields(studentFields)}
            </form>
          </div>

          <h2
            className={`text-xl font-poppins-regular mt-6 text-left  ${
              isDarkMode ? "text-textPrimary" : "text-textBlack"
            }`}
          >
            {t("titles.guardianDetails")}
          </h2>
          <div
            className={`${
              isDarkMode ? "" : "bg-[rgba(70,69,144,0.05)]"
            } w-full p-5 box-border flex flex-col items-center my-5`}
          >
            {/* Parent input fields */}
            <form onSubmit={formik.handleSubmit} className={`w-full`}>
              {renderFields(guardianFields)}
              {/* save and cancel buttons */}
              <div className={`flex justify-end gap-4 mt-10 w-full`}>
                <button
                  type="button"
                  onClick={() => navigate(-1)}
                  className={`border-2 border-borderGray ${
                    isDarkMode ? "text-textPrimary" : "text-textBlack"
                  } py-2 px-4 rounded-xl w-36`}
                >
                  {t("buttons.cancel")}
                </button>
                <button
                  type="submit"
                  className={`bg-backgroundDarkBlue text-textPrimary py-2 px-4 rounded-xl w-36`}
                >
                  {t("buttons.save")}
                </button>
              </div>
            </form>
          </div>
        </div>
      </div>
    </div>
  );
}
