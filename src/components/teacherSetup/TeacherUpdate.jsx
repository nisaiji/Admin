import React, { useState } from "react";
import { useFormik } from "formik";
import { useLocation, useNavigate } from "react-router-dom";
// import DatePicker from "react-datepicker";
// import "react-datepicker/dist/react-datepicker.css";
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
import { FormControl, Select, MenuItem, TextField } from "@mui/material";
import { DatePicker, LocalizationProvider } from "@mui/x-date-pickers";
import { AdapterMoment } from "@mui/x-date-pickers/AdapterMoment";
/**
 * Capitalizes the first letter of a string and converts the rest to lowercase.
 * @param {string} string - Input string to capitalize.
 * @returns {string} - Capitalized string.
 */
const capitalize = (str) =>
  str.charAt(0).toUpperCase() + str.slice(1).toLowerCase();

// Utility function to filter out empty values from an object
const filterEmptyValues = (data) =>
  Object.fromEntries(Object.entries(data).filter(([_, value]) => value !== ""));

const TeacherUpdate = () => {
  const navigate = useNavigate();
  const teacher = useLocation().state;
  const [loading, setLoading] = useState(false);
  const { t } = useTranslation();

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
      dob: teacher?.dob || "",
      phone: teacher?.phone || "",
      degree: teacher?.degree || "",
    },
    validationSchema,
    // update teacher api
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

  return (
    <div className="flex justify-center items-center w-full h-full bg-[#93a3b6]/25 pt-[25px]">
      {loading && (
        <div className="fixed inset-0 flex items-center justify-center bg-[#fafafa] bg-opacity-50 z-30">
          <Spinner />
        </div>
      )}
      <Toaster position="top-center" reverseOrder={false} />
      <div className="bg-[#fafafa] rounded-2xl w-full mx-6 flex flex-col items-start py-3 px-10 box-border">
        <Breadcrumbs />
        <h1 className="text-2xl font-poppins-bold mt-3">
          {t("titles.teacherDetails")}
        </h1>
        <h2 className="text-l font-poppins-regular mt-2 text-left">
          {t("titles.teacherPersonalDetails")}
        </h2>
        <div className="bg-[#E9EEF2]/50 w-full p-5 box-border flex flex-col items-center my-5">
          <form onSubmit={formik.handleSubmit} className="w-full">
            <div className="grid grid-cols-2 gap-4">
              {fields.map(
                ({ name, label, placeholder, type, options, icon }) => (
                  <div key={name} className="flex flex-col mx-4 mt-3">
                    <div className="text-l font-semibold">{label}</div>
                    <div className="relative mt-2">
                      {type === "select" ? (
                        <FormControl
                          fullWidth
                          variant="outlined"
                          sx={{ mb: 2 }}
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
                              border: "2px solid rgba(5, 2, 43, 0.1)",
                              borderRadius: "0.5rem",
                              height: "40px",
                              backgroundColor: "white",
                              color:
                                formik.values[name] === "" ? "gray" : "black",
                              "& .MuiOutlinedInput-notchedOutline": {
                                border: "none",
                              },
                            }}
                          >
                            <MenuItem value="" disabled>
                              {label}
                            </MenuItem>
                            {options.map((option) => (
                              <MenuItem key={option} value={option}>
                                {option}
                              </MenuItem>
                            ))}
                          </Select>
                        </FormControl>
                      ) : type === "date" ? (
                        // <DatePicker
                        <LocalizationProvider dateAdapter={AdapterMoment}>
                          <DatePicker
                            views={["day", "month", "year"]}
                            value={
                              formik.values.dob
                                ? moment(formik.values.dob, "DD/MM/YYYY")
                                : null
                            }
                            onChange={(date) => {
                              if (date) {
                                formik.setFieldValue(
                                  "dob",
                                  moment(date).format("DD/MM/YYYY")
                                );
                              }
                            }}
                            className="bg-white w-full"
                            renderInput={(params) => (
                              <TextField
                                {...params}
                                placeholder={t("calendar.gotoDatePlaceholder")}
                                variant="outlined"
                              />
                            )}
                            sx={{
                              width: "100%",
                              height: "40px",
                              "& .MuiOutlinedInput-root": {
                                padding: 1,
                                fontSize: "16px",
                                minHeight: "40px",
                              },
                              "& .MuiInputBase-input": {
                                fontSize: "16px",
                                padding: 1,
                                height: "100%",
                              },
                            }}
                          />
                        </LocalizationProvider>
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
                          className="border-2 border-[#05022B]/10 rounded-lg pl-2 pr-10 py-1.5 w-full"
                        />
                      )}
                      {formik.touched[name] && formik.errors[name] && (
                        <div className="text-red-600 text-sm mt-1">
                          {formik.errors[name]}
                        </div>
                      )}
                      {icon && (
                        <img
                          src={icon}
                          className="absolute right-2"
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
            <div className="flex justify-end gap-4 mt-10 w-full">
              <button
                type="button"
                onClick={() => navigate(-1)}
                className="border-2 border-[#686868]/75 text-[#040320] py-2 px-4 rounded-xl w-36 transition-all duration-200 ease-in-out active:scale-90"
              >
                {t("buttons.cancel")}
              </button>
              <button
                type="submit"
                className="bg-[#0F4189] text-white py-2 px-4 rounded-xl w-36 transition-all duration-200 ease-in-out active:scale-90"
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
