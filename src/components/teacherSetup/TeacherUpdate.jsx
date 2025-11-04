/**
 * TeacherUpdate.jsx
 *
 * This component provides a form for updating teacher details.
 * It uses Formik for form state management and validation, Yup for schema validation,
 * and Material UI for styled form controls. The form includes fields for personal and professional details,
 * such as name, gender, blood group, email, date of birth, address, phone, university, and degree.
 * The component handles API integration for updating teacher data, displays loading and toast notifications,
 * and supports dark mode styling.
 * Uses React hooks for state, Redux for config state, and i18next for translations.
 */
import React, { useState } from "react";
import { useFormik } from "formik";
import { useLocation, useNavigate } from "react-router-dom";
import { format, parse } from "date-fns";
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
import moment from "moment/moment";
import Breadcrumbs from "../BreadCrumbs";
import {
  FormControl,
  Select,
  MenuItem,
  TextField,
  createTheme,
  ThemeProvider,
} from "@mui/material";
import { DatePicker, LocalizationProvider } from "@mui/x-date-pickers";
import { AdapterMoment } from "@mui/x-date-pickers/AdapterMoment";
import { useSelector } from "react-redux";
/**
 * Capitalizes the first letter of a string and converts the rest to lowercase.
 * @param {string} string - Input string to capitalize.
 * @returns {string} - Capitalized string.
 */
const capitalize = (str) =>
  str.charAt(0).toUpperCase() + str.slice(1).toLowerCase();

/**
 * Utility function to filter out empty values from an object.
 * @param {object} data - The object to filter.
 * @returns {object} - Object with empty values removed.
 */
const filterEmptyValues = (data) =>
  Object.fromEntries(Object.entries(data).filter(([_, value]) => value !== ""));

const TeacherUpdate = () => {
  const navigate = useNavigate();
  const teacher = useLocation().state;
  const [loading, setLoading] = useState(false);
  const { t } = useTranslation();
  const isDarkMode = useSelector((state) => state.appConfig.isDarkMode);

  // Validation schema using Yup
  const validationSchema = Yup.object({
    firstname: Yup.string().trim().required(t("validationError.firstName")),
    lastname: Yup.string().trim().required(t("validationError.lastName")),
    phone: Yup.string()
      .trim()
      .required(t("validationError.phone"))
      .matches(REGEX.PHONE, t("validationError.phoneNumber"))
      .test(
        "starts-with-1-to-5",
        t("validationError.phoneStart"),
        (value) => value && REGEX.PHONE_TEST.test(value)
      ),
  });
  // Setup formik for handling form submission, validation, and field management
  const formik = useFormik({
    initialValues: {
      firstname: teacher?.firstname || "",
      lastname: teacher?.lastname || "",
      email: teacher?.email || "",
      address: teacher?.address || "",
      university: teacher?.university || "",
      gender: teacher?.gender || "",
      bloodGroup: teacher?.bloodGroup || "",
      dob: teacher?.dob ? moment(teacher?.dob).format("DD/MM/YYYY") : "",
      phone: teacher?.phone || "",
      degree: teacher?.degree || "",
    },
    validationSchema,
    /**
     * Handles form submission, prepares data, calls update API, and navigates back on success.
     * @param {object} values - Form values.
     */
    onSubmit: async (values) => {
      try {
        setLoading(true);
        const teacherData = Object.entries(values).reduce(
          (acc, [key, value]) => {
            acc[key] =
              key === "email" ? value.toLowerCase() : capitalize(value);
            return value ? acc : acc;
          },
          {}
        );
        const filteredTeacherData = filterEmptyValues(teacherData);

        // Make API request to update teacher details
        const response = await axiosClient.put(
          `${EndPoints.ADMIN.UPDATE_TEACHER}/${teacher._id}`,
          filteredTeacherData
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

  // form fields
  const fields = [
    {
      name: "firstname",
      label: t("labels.firstName"),
      placeholder: t("placeholders.firstName"),
      type: "text",
    },
    {
      name: "gender",
      label: t("labels.gender"),
      type: "select",
      options: [t("options.male"), t("options.female"), t("options.other")],
    },
    {
      name: "lastname",
      label: t("labels.lastName"),
      placeholder: t("placeholders.lastName"),
      type: "text",
    },
    {
      name: "bloodGroup",
      label: t("labels.bloodGroup"),
      type: "select",
      options: ["A+", "A-", "B+", "B-", "O+", "O-", "AB+", "AB-"],
    },
    {
      name: "email",
      label: t("labels.email"),
      placeholder: t("placeholders.emailAddress"),
      type: "email",
      icon: mail,
    },
    {
      name: "dob",
      label: t("labels.dob"),
      placeholder: t("placeholders.date"),
      type: "date",
    },
    {
      name: "address",
      label: t("labels.address"),
      placeholder: t("placeholders.address"),
      type: "text",
      icon: location,
    },
    {
      name: "phone",
      label: t("labels.phoneNumber"),
      placeholder: t("placeholders.phoneNumber"),
      type: "text",
      icon: India,
    },
    {
      name: "university",
      label: t("labels.university"),
      placeholder: t("placeholders.university"),
      type: "text",
    },
    {
      name: "degree",
      label: t("labels.degree"),
      placeholder: t("placeholders.degree"),
      type: "text",
    },
  ];

  // Theme configuration for Material UI components
  const theme = (isDarkMode) =>
    createTheme({
      palette: {
        mode: isDarkMode ? "dark" : "light",
        ...(isDarkMode
          ? {
              background: { default: "#121212", paper: "#1e1e1e" },
              text: { primary: "#fff", secondary: "#aaa" },
            }
          : {
              background: { default: "#f5f5f5", paper: "#fff" },
              text: { primary: "#000", secondary: "#666" },
            }),
      },
      components: {
        MuiOutlinedInput: {
          styleOverrides: {
            root: {
              borderRadius: 8,
              minHeight: 40,
              fontSize: "14px",
              backgroundColor: isDarkMode ? "#1e1e1e" : "#fff",
              border: `1px solid ${isDarkMode ? "#2b2e4a80" : "#ccc"}`,
              "& fieldset": { border: "none" },
              "&:hover fieldset": { border: "none" },
              "&.Mui-focused fieldset": { border: "2px solid #1976d2" },
            },
            input: {
              color: isDarkMode ? "#fff" : "#000",
              fontSize: "14px",
              padding: "10px 12px",
            },
            inputAdornedEnd: {
              color: isDarkMode ? "#fff" : "#000",
            },
          },
        },
        MuiInputLabel: {
          styleOverrides: {
            root: {
              color: isDarkMode ? "#aaa" : "#666",
            },
          },
        },
        MuiSvgIcon: {
          styleOverrides: {
            root: {
              color: isDarkMode ? "#E3E8F3" : "black",
            },
          },
        },
      },
    });

  return (
    <div
      className={`flex justify-center items-center w-full h-full pt-[25px] ${
        isDarkMode ? "bg-background2" : "bg-whiteBackground2"
      }`}
    >
      {loading && (
        <div
          className={`fixed inset-0 flex items-center justify-center bg-opacity-50 bg-whiteBackground1 z-30`}
        >
          <Spinner />
        </div>
      )}
      <Toaster position="top-center" reverseOrder={false} />
      <div
        className={`${
          isDarkMode
            ? "bg-gradient-to-r from-fromColor1 to-toColor1"
            : "bg-whiteBackground"
        } rounded-2xl w-full mx-6 flex flex-col items-start py-3 px-10 box-border`}
      >
        <Breadcrumbs />
        <h1
          className={`text-2xl font-poppins-bold mt-3 ${
            isDarkMode ? "text-textPrimary" : "text-textBlack"
          }`}
        >
          {t("titles.teacherDetails")}
        </h1>
        <h2
          className={`text-l font-poppins-regular mt-2 text-left ${
            isDarkMode ? "text-textPrimary" : "text-textBlack"
          }`}
        >
          {t("titles.teacherPersonalDetails")}
        </h2>
        <div
          className={`w-full p-5 box-border flex flex-col items-center my-5`}
        >
          <form onSubmit={formik.handleSubmit} className={`w-full`}>
            <div className={`grid grid-cols-2 gap-4`}>
              {fields.map(
                ({ name, label, placeholder, type, options, icon }) => (
                  <div key={name} className={`flex flex-col mx-4 mt-3`}>
                    <div
                      className={`text-l font-semibold ${
                        isDarkMode ? "text-textPrimary" : "text-textBlack"
                      }`}
                    >
                      {label}
                    </div>
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
                              borderColor: isDarkMode ? "#2b2e4a80" : "black",
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
                                  backgroundColor: isDarkMode
                                    ? "#1a1a1a"
                                    : "white",
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
                                  backgroundColor: isDarkMode
                                    ? "#1a1a1a"
                                    : "white",
                                  color: isDarkMode ? "#E3E8F3" : "black",
                                  "&:hover": {
                                    backgroundColor: isDarkMode
                                      ? "#2a2a2a"
                                      : "#E9EEF2",
                                  },
                                }}
                              >
                                {option}
                              </MenuItem>
                            ))}
                          </Select>
                        </FormControl>
                      ) : type === "date" ? (
                        // <DatePicker
                        <ThemeProvider theme={theme}>
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
                              slotProps={{
                                textField: {
                                  fullWidth: true,
                                  size: "small",
                                  placeholder: t("placeholders.date"),
                                },
                              }}
                            />
                          </LocalizationProvider>
                        </ThemeProvider>
                      ) : (
                        <input
                          type={type}
                          name={name}
                          placeholder={placeholder}
                          onChange={(e) => {
                            if (["firstname", "lastname"].includes(name)) {
                              e.target.value = e.target.value.replace(
                                /[^a-zA-Z]/g,
                                ""
                              );
                            }
                            formik.handleChange(e);
                          }}
                          onKeyDown={(e) => {
                            if (
                              ["firstname", "lastname"]
                                .includes(name)
                                .trimStart() &&
                              /[^a-zA-Z\s]/.test(e.key)
                            ) {
                              e.preventDefault();
                            }
                          }}
                          value={formik.values[name]}
                          maxLength={
                            name === "phone"
                              ? 10
                              : name === "firstname" || name == "lastname"
                              ? 15
                              : ""
                          }
                          className={`border-2 border-borderLine bg-transparent rounded-lg pl-2 pr-10 py-1.5 w-full ${
                            isDarkMode ? "text-textPrimary" : "text-textBlack"
                          }`}
                        />
                      )}
                      {formik.touched[name] && formik.errors[name] && (
                        <div className={`text-red-600 text-sm mt-1`}>
                          {formik.errors[name]}
                        </div>
                      )}
                      {icon && (
                        <img
                          src={icon}
                          className={`absolute right-2`}
                          style={{ top: 10, width: 22, height: 20 }}
                          alt=""
                        />
                      )}
                    </div>
                  </div>
                )
              )}
            </div>
            {/* submit and cancel buttons */}
            <div className={`flex justify-end gap-4 mt-10 w-full`}>
              <button
                type="button"
                onClick={() => navigate(-1)}
                className={`border-2 border-borderGray ${
                  isDarkMode ? "text-textPrimary" : "text-textBlack"
                } py-2 px-4 rounded-xl w-36 transition-all duration-200 ease-in-out active:scale-90`}
              >
                {t("buttons.cancel")}
              </button>
              <button
                type="submit"
                className={`bg-backgroundDarkBlue text-textPrimary py-2 px-4 rounded-xl w-36 transition-all duration-200 ease-in-out active:scale-90`}
                data-testid="updateTeacherInfo"
              >
                {t("buttons.save")}
              </button>
            </div>
          </form>
        </div>
      </div>
    </div>
  );
};

export default TeacherUpdate;
