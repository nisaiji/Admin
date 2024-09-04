import React, { useState } from "react";
import { useFormik } from "formik";
import { useLocation, useNavigate } from "react-router-dom";
import mail from "../../assets/images/mail.png";
import India from "../../assets/images/India.png";
import location from "../../assets/images/location.png";
import DatePicker from "react-datepicker";
import "react-datepicker/dist/react-datepicker.css";
import { format } from "date-fns";
import toast, { Toaster } from "react-hot-toast";
import { axiosClient } from "../../services/axiosClient";
import Spinner from "../Spinner";
import EndPoints from "../../services/EndPoints";
import * as Yup from "yup";
import { useTranslation } from "react-i18next";

const capitalize = (str) => {
  return str.charAt(0).toUpperCase() + str.slice(1).toLowerCase();
};

const validationSchema = Yup.object({
  firstname: Yup.string().required("First name is required"),
  lastname: Yup.string().required("Last name is required"),
  // email: Yup.string()
  //   .email("Invalid email address")
  //   .required("Email is required"),
  // address: Yup.string().required("Address is required"),
  // university: Yup.string().required("University is required"),
  // gender: Yup.string().required("Gender is required"),
  // bloodGroup: Yup.string().required("Blood group is required"),
  // dob: Yup.date().required("Date of birth is required"),
  phone: Yup.string()
    .required("Phone number is required")
    .matches(/^\d{10}$/, "Phone number should be 10 digits")
    .test(
      "starts-with-1-to-5",
      "Phone number must start with a digit between 1 to 5",
      (value) => {
        return value && /^[1-5]/.test(value);
      }
    ),
  // degree: Yup.string().required("Degree is required"),
});

export default function TeacherUpdate() {
  const navigate = useNavigate();
  const teacher = useLocation().state;
  const [loading, setLoading] = useState(false);
  const { t } = useTranslation();
  const formik = useFormik({
    initialValues: {
      firstname: teacher.firstname || "",
      lastname: teacher.lastname || "",
      email: teacher.email || "",
      address: teacher.address || "",
      university: teacher.university || "",
      gender: teacher.gender || "",
      bloodGroup: teacher.bloodGroup || "",
      dob: teacher.dob || "",
      phone: teacher.phone || "",
      degree: teacher.degree || "",
    },
    validationSchema: validationSchema,
    onSubmit: async (values) => {
      // console.log(values);
      try {
        setLoading(true);
        const response = await axiosClient.put(
          `${EndPoints.ADMIN.UPDATE_TEACHER}/${teacher._id}`,
          {
            firstname: capitalize(values.firstname) || "",
            lastname: capitalize(values.lastname) || "",
            email: values.email.toLowerCase() || "",
            address: capitalize(values.address) || "",
            university: capitalize(values.university) || "",
            gender: values.gender || "",
            bloodGroup: values.bloodGroup || "",
            dob: values.dob || "",
            phone: values.phone || "",
            degree: capitalize(values.degree) || "",
          }
        );
        if (response?.statusCode === 200) {
          toast.success("Teacher updated successfully!");
          navigate(-1);
        }
      } catch (error) {
        toast.error(<b>{error}</b>);
      } finally {
        setLoading(false);
      }
    },
  });

  return (
    <div className="flex justify-center items-center w-full h-full bg-[#8A89FA1A] pt-10">
      {loading && (
        <div className="fixed inset-0 flex items-center justify-center bg-white bg-opacity-50 z-30">
          <Spinner />
        </div>
      )}
      <Toaster position="top-center" reverseOrder={false} />
      <div className="bg-white rounded-2xl w-full mx-10 flex flex-col items-start py-3 px-10 box-border">
        <h1 className="text-4xl font-poppins-bold mt-6">
          {t("TeacherDetails")}
        </h1>
        <h2 className="text-2xl font-poppins-regular mt-6 text-left">
          {t("TeacherPersonalDetails")}
        </h2>
        <div className="bg-[rgba(70,69,144,0.05)] w-full p-5 box-border flex flex-col items-center my-5">
          <form onSubmit={formik.handleSubmit} className="w-full">
            <div className="grid grid-cols-2 gap-4">
              {[
                {
                  name: "firstname",
                  label: "First Name",
                  placeholder: "Enter First Name",
                  type: "text",
                },
                {
                  name: "gender",
                  label: "Gender",
                  type: "select",
                  options: ["Male", "Female", "Other"],
                },
                {
                  name: "lastname",
                  label: "Last Name",
                  placeholder: "Enter Last Name",
                  type: "text",
                },
                {
                  name: "bloodGroup",
                  label: "Blood Group",
                  type: "select",
                  options: ["A+", "A-", "B+", "B-", "O+", "O-", "AB+", "AB-"],
                },
                {
                  name: "email",
                  label: "Email Address",
                  placeholder: "Enter Email",
                  type: "email",
                  icon: { src: mail, width: 40, height: 40, top: 0 },
                },
                {
                  name: "dob",
                  label: "Date of Birth",
                  placeholder: "DD/MM/YYYY",
                  type: "date",
                },
                {
                  name: "address",
                  label: "Address",
                  placeholder: "Enter Address",
                  type: "text",
                  icon: { src: location, width: 30, height: 30, top: 5 },
                },
                {
                  name: "phone",
                  label: "Phone Number",
                  placeholder: "Enter Phone Number",
                  type: "text",
                  icon: { src: India, width: 35, height: 25, top: 7 },
                },
                {
                  name: "university",
                  label: "University",
                  placeholder: "Enter University",
                  type: "text",
                },
                {
                  name: "degree",
                  label: "Degree",
                  placeholder: "Enter Degree",
                  type: "text",
                },
              ].map((field) => (
                <div key={field.name} className="flex flex-col mx-4 mt-3">
                  <div className="text-xl font-semibold">{field.label}</div>
                  <div className="relative mt-2">
                    {field.type === "select" ? (
                      <select
                        name={field.name}
                        onChange={formik.handleChange}
                        value={formik.values[field.name]}
                        className="border-2 border-[#d1d1e3] rounded px-2 py-1.5 w-full"
                      >
                        <option value="" label={field.label} />
                        {field.options.map((option) => (
                          <option key={option} value={option} label={option} />
                        ))}
                      </select>
                    ) : field.name === "dob" ? (
                      <DatePicker
                        selected={formik.values.dob}
                        onChange={(date) =>
                          formik.setFieldValue(
                            "dob",
                            format(date, "MM/dd/yyyy")
                          )
                        }
                        dateFormat="MM/dd/yyyy"
                        placeholderText="DD/MM/YYYY"
                        className="border-2 border-[#d1d1e3] rounded px-2 py-1.5 w-full"
                        wrapperClassName="w-full"
                      />
                    ) : (
                      <input
                        type={field.type}
                        name={field.name}
                        placeholder={field.placeholder}
                        onChange={formik.handleChange}
                        value={formik.values[field.name]}
                        className="border-2 border-[#d1d1e3] rounded px-2 py-1.5 w-full"
                      />
                    )}
                    {formik.touched[field.name] &&
                      formik.errors[field.name] && (
                        <div className="text-red-600 text-sm mt-1">
                          {formik.errors[field.name]}
                        </div>
                      )}
                    {field.icon && (
                      <img
                        src={field.icon.src}
                        className="absolute right-2"
                        style={{
                          top: field.icon.top,
                          width: field.icon.width,
                          height: field.icon.height,
                        }}
                        alt=""
                      />
                    )}
                  </div>
                </div>
              ))}
            </div>
            <div className="flex justify-end gap-4 mt-10 w-full">
              <button
                type="button"
                onClick={() => navigate(-1)}
                className="border-2 border-[#a3a2c7] text-[#464590] py-2 px-4 rounded w-36"
              >
                {t("cancel")}
              </button>
              <button
                type="submit"
                className="bg-[#464590] text-white py-2 px-4 rounded w-36"
              >
                {t("Save")}
              </button>
            </div>
          </form>
        </div>
      </div>
    </div>
  );
}
