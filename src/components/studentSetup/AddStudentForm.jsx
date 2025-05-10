import React, { useState } from "react";
import { useFormik } from "formik";
import { useNavigate } from "react-router-dom";
import toast, { Toaster } from "react-hot-toast";
import { axiosClient } from "../../services/axiosClient";
import Spinner from "../Spinner";
import EndPoints from "../../services/EndPoints";
import * as Yup from "yup";
import { useTranslation } from "react-i18next";
import { useSelector } from "react-redux";
import { TextField, FormControl, MenuItem, Select } from "@mui/material";
import Breadcrumbs from "../BreadCrumbs";

const AddStudent = () => {
  const navigate = useNavigate();
  const [loading, setLoading] = useState(false);
  const { t } = useTranslation();
  const isDarkMode = useSelector((state) => state.appConfig.isDarkMode);

  const validationSchema = Yup.object({
    firstname: Yup.string().required("First name is required"),
    lastname: Yup.string().required("Last name is required"),
    gender: Yup.string().required("Gender is required"),
    parentname: Yup.string().required("Parent name is required"),
    phone: Yup.string()
      .required("Phone number is required")
      .matches(/^[6-9]\d{9}$/, "Invalid Indian phone number"),
    class: Yup.string().required("Class is required"),
    section: Yup.string().required("Section is required"),
  });

  const formik = useFormik({
    initialValues: {
      firstname: "",
      lastname: "",
      gender: "",
      parentname: "",
      phone: "",
      class: "",
      section: "",
    },
    validationSchema,
    onSubmit: async (values) => {
      try {
        setLoading(true);
        const response = await axiosClient.post(
          EndPoints.ADMIN.ADD_STUDENT,
          values
        );
        if (response?.statusCode === 201) {
          toast.success("Student added successfully");
          navigate(-1);
        }
      } catch (error) {
        toast.error("Failed to add student");
      } finally {
        setLoading(false);
      }
    },
  });

  const fields = [
    { name: "firstname", label: "First Name", type: "text" },
    { name: "lastname", label: "Last Name", type: "text" },
    {
      name: "gender",
      label: "Gender",
      type: "select",
      options: ["Male", "Female", "Other"],
    },
    { name: "parentname", label: "Parent Name", type: "text" },
    { name: "phone", label: "Phone Number", type: "text" },
    { name: "class", label: "Class", type: "text" },
    { name: "section", label: "Section", type: "text" },
  ];

  return (
    <div
      className={`flex justify-center items-center w-full h-full pt-[25px] ${
        isDarkMode ? "bg-background2" : "bg-whiteBackground2"
      }`}
    >
      {loading && (
        <div className="fixed inset-0 flex items-center justify-center bg-opacity-50 bg-white z-30">
          <Spinner />
        </div>
      )}
      <Toaster position="top-center" />
      <div
        className={`${
          isDarkMode
            ? "bg-gradient-to-r from-fromColor1 to-toColor1"
            : "bg-white"
        } rounded-2xl w-full mx-6 flex flex-col items-start py-3 px-10`}
      >
        <Breadcrumbs />
        <h1
          className={`text-2xl font-poppins-bold mt-3 ${
            isDarkMode ? "text-white" : "text-black"
          }`}
        >
          Add Student
        </h1>

        <form onSubmit={formik.handleSubmit} className="w-full mt-5">
          <div className="grid grid-cols-2 gap-4">
            {fields.map(({ name, label, type, options }) => (
              <div key={name} className="flex flex-col mx-4 mt-3">
                <label
                  className={`font-semibold mb-2 ${
                    isDarkMode ? "text-white" : "text-black"
                  }`}
                >
                  {label}
                </label>
                {type === "select" ? (
                  <FormControl fullWidth>
                    <Select
                      value={formik.values[name]}
                      name={name}
                      onChange={formik.handleChange}
                      displayEmpty
                      sx={{
                        backgroundColor: isDarkMode ? "#1a1a1a" : "white",
                        borderRadius: 1,
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
                ) : (
                  <TextField
                    fullWidth
                    name={name}
                    type={type}
                    value={formik.values[name]}
                    onChange={formik.handleChange}
                    placeholder={label}
                  />
                )}
                {formik.touched[name] && formik.errors[name] && (
                  <div className="text-red-600 text-sm mt-1">
                    {formik.errors[name]}
                  </div>
                )}
              </div>
            ))}
          </div>
          <div className="flex justify-end gap-4 mt-10 w-full">
            <button
              type="button"
              onClick={() => navigate(-1)}
              className={`border-2 px-4 py-2 rounded-xl ${
                isDarkMode
                  ? "text-white border-white"
                  : "text-black border-gray-400"
              }`}
            >
              Cancel
            </button>
            <button
              type="submit"
              className="bg-blue-600 text-white px-4 py-2 rounded-xl"
            >
              Save
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default AddStudent;
