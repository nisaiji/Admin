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
  // rollNumber: Yup.string().required("Roll Number is required"),
  firstname: Yup.string().required("First Name is required"),
  lastname: Yup.string().required("Last Name is required"),
  gender: Yup.string().required("Gender is required"),
  bloodGroup: Yup.string().required("Blood Group is required"),
  dob: Yup.date().required("Date of Birth is required"),
  address: Yup.string().required("Address is required"),
  parentFullname: Yup.string().required("Parent's Full Name is required"),
  parentGender: Yup.string().required("Parent's Gender is required"),
  parentAge: Yup.number()
    .required("Parent's Age is required")
    .positive()
    .integer(),
  parentEmail: Yup.string()
    .email("Invalid email address")
    .required("Parent's Email is required"),
  parentPhone: Yup.string()
    .required("Parent's Phone Number is required")
    .matches(/^\d{10}$/, "Phone number should be 10 digits")
    .test(
      "starts-with-1-to-5",
      "Phone number must start with a digit between 1 to 5",
      (value) => {
        return value && /^[1-5]/.test(value);
      }
    ),
  parentQualification: Yup.string().required(
    "Parent's Qualification is required"
  ),
  parentOccupation: Yup.string().required("Parent's Occupation is required"),
  parentAddress: Yup.string().required("Parent's Address is required"),
});

export default function StudentUpdate() {
  const navigate = useNavigate();
  const student = useLocation().state;
  const { t } = useTranslation();
  const [loading, setLoading] = useState(false);
  // console.log(student);

  const formik = useFormik({
    initialValues: {
      rollNumber: student.rollNumber || "",
      firstname: student.firstname || "",
      lastname: student.lastname || "",
      gender: student.gender || "",
      bloodGroup: student.bloodGroup || "",
      dob: student.dob || "",
      address: student.address || "",
      parentFullname: student.parent.fullname || "",
      parentGender: student.parent.gender || "",
      parentAge: student.parent.age || "",
      parentEmail: student.parent.email || "",
      parentPhone: student.parent.phone || "",
      parentQualification: student.parent.qualification || "",
      parentOccupation: student.parent.occupation || "",
      parentAddress: student.parent.address || "",
    },
    validationSchema,
    onSubmit: async (values) => {
      // console.log("val", values);
      try {
        setLoading(true);
        const response = await axiosClient.put(
          `${EndPoints.ADMIN.STUDENT_UPDATE}/${student._id}`,
          {
            rollNumber: capitalize(values.rollNumber) || "",
            firstname: capitalize(values.firstname) || "",
            lastname: capitalize(values.lastname) || "",
            gender: values.gender || "",
            bloodGroup: values.bloodGroup || "",
            dob: values.dob || "",
            address: capitalize(values.address) || "",
            parentFullname: capitalize(values.parentFullname) || "",
            parentGender: values.parentGender || "",
            parentAge: values.parentAge || "",
            parentEmail: values.parentEmail.toLowerCase() || "",
            parentPhone: values.parentPhone || "",
            parentQualification: capitalize(values.parentQualification) || "",
            parentOccupation: capitalize(values.parentOccupation) || "",
            parentAddress: capitalize(values.parentAddress) || "",
          }
        );
        if (response?.statusCode === 200) {
          toast.success(t("studentList.studentUpdateMsg"));
          navigate(-1);
        }
      } catch (error) {
        toast.error(<b>{error}</b>);
      } finally {
        setLoading(false);
      }
    },
  });

  const renderStudentFormFields = () => (
    <div className="grid grid-cols-2 gap-4">
      {[
        // {
        //   label: "Roll Number",
        //   name: "rollNumber",
        //   placeholder: t("studentDetails.placeholders.rollNumber"),
        //   type: "text",
        // },
        {
          label: "Gender",
          name: "gender",
          type: "select",
          options: ["male", "female", "other"],
        },
        {
          label: "First Name",
          name: "firstname",
          placeholder: t("studentDetails.placeholders.firstName"),
          type: "text",
        },
        {
          label: "Blood Group",
          name: "bloodGroup",
          type: "select",
          options: ["A+", "A-", "B+", "B-", "O+", "O-", "AB+", "AB-"],
        },
        {
          label: "Last Name",
          name: "lastname",
          placeholder: t("studentDetails.placeholders.lastName"),
          type: "text",
        },
        {
          label: "Date of Birth",
          name: "dob",
          placeholder: t("studentDetails.placeholders.dob"),
          type: "date",
        },
        {
          label: "Address",
          name: "address",
          placeholder: t("studentDetails.placeholders.address"),
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
                  formik.setFieldValue("dob", format(date, "MM/dd/yyyy"))
                }
                dateFormat="MM/dd/yyyy"
                placeholderText="MM/DD/YYYY"
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
            {formik.touched[field.name] && formik.errors[field.name] && (
              <div className="text-red-500 text-sm">
                {formik.errors[field.name]}
              </div>
            )}
          </div>
        </div>
      ))}
    </div>
  );

  const renderGuardianFormFields = () => (
    <div className="grid grid-cols-2 gap-4">
      {[
        {
          label: "Full Name",
          name: "parentFullname",
          placeholder: t("studentDetails.placeholders.fullName"),
          type: "text",
        },
        {
          label: "Gender",
          name: "parentGender",
          type: "select",
          options: ["male", "female", "other"],
        },
        {
          label: "Age",
          name: "parentAge",
          placeholder: t("studentDetails.placeholders.age"),
          type: "Number",
        },
        {
          label: "Email Address",
          name: "parentEmail",
          icon: { src: mail, width: 40, height: 40, top: 0 },
          placeholder: t("studentDetails.placeholders.emailAddress"),
          type: "email",
        },
        {
          label: "Phone Number",
          name: "parentPhone",
          icon: { src: India, width: 35, height: 25, top: 7 },
          placeholder: t("studentDetails.placeholders.phoneNumber"),
          type: "Number",
        },
        {
          label: "Qualification",
          name: "parentQualification",
          placeholder: t("studentDetails.placeholders.qualification"),
          type: "text",
        },
        {
          label: "Occupation",
          name: "parentOccupation",
          placeholder: t("studentDetails.placeholders.Occupation"),
          type: "text",
        },
        {
          label: "Address",
          name: "parentAddress",
          icon: { src: location, width: 30, height: 30, top: 5 },
          placeholder: t("studentDetails.placeholders.address"),
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
            {formik.touched[field.name] && formik.errors[field.name] && (
              <div className="text-red-500 text-sm">
                {formik.errors[field.name]}
              </div>
            )}
          </div>
        </div>
      ))}
    </div>
  );

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
          {t("studentDetails.title")}
        </h1>
        <div className="w-full">
          <h2 className="text-2xl font-poppins-regular mt-6 text-left">
            {t("studentDetails.personalDetails")}
          </h2>
          <div className="bg-[rgba(70,69,144,0.05)] w-full p-5 box-border flex flex-col items-center my-5">
            <form onSubmit={formik.handleSubmit} className="w-full">
              {renderStudentFormFields()}
            </form>
          </div>

          <h2 className="text-2xl font-poppins-bold text-left ml-5">
            {t("studentDetails.guardianDetails")}
          </h2>
          <div className="bg-[rgba(70,69,144,0.05)] w-full p-5 box-border flex flex-col items-center my-5">
            <form onSubmit={formik.handleSubmit} className="w-full">
              {renderGuardianFormFields()}
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
                  {t("save")}
                </button>
              </div>
            </form>
          </div>
        </div>
      </div>
    </div>
  );
}
