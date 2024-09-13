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
import REGEX from "../../utils/regix";

const capitalize = (str) => {
  return str.charAt(0).toUpperCase() + str.slice(1).toLowerCase();
};

export default function StudentUpdate() {
  const navigate = useNavigate();
  const student = useLocation().state;
  const { t } = useTranslation();
  const [loading, setLoading] = useState(false);

  const validationSchema = Yup.object({
    firstname: Yup.string().required(t("validationError.firstName")),
    lastname: Yup.string().required(t("validationError.lastName")),
    gender: Yup.string().required(t("validationError.gender")),
    bloodGroup: Yup.string().required(t("validationError.bloodGroup")),
    dob: Yup.date().required(t("validationError.dob")),
    address: Yup.string().required(t("validationError.address")),
    parentFullname: Yup.string().required(t("validationError.fullName")),
    parentGender: Yup.string().required(t("validationError.gender")),
    parentAge: Yup.string(t("validationError.age")).required(),
    parentEmail: Yup.string()
      .email(t("validationError.emailAddress"))
      .required(t("validationError.email")),
    parentPhone: Yup.string()
      .required()
      .matches(REGEX.PHONE, t("validationError.phoneNumber"))
      .test("starts-with-1-to-5", t("validationError.phoneStart"), (value) => {
        return value && REGEX.PHONE_TEST.test(value);
      }),
    parentQualification: Yup.string().required(
      t("validationError.qualification")
    ),
    parentOccupation: Yup.string().required(t("validationError.occupation")),
    parentAddress: Yup.string().required(t("validationError.address")),
  });

  const formik = useFormik({
    initialValues: {
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
      try {
        setLoading(true);
        const response = await axiosClient.put(
          `${EndPoints.ADMIN.STUDENT_UPDATE}/${student._id}`,
          {
            firstname: capitalize(values.firstname) || "",
            lastname: capitalize(values.lastname) || "",
            gender: values.gender || "",
            bloodGroup: values.bloodGroup || "",
            dob: values.dob || "",
            address: capitalize(values.address) || "",
            parentFullname: capitalize(values.parentFullname) || "",
            parentGender: values.parentGender || "",
            parentAge: values.parentAge.toString() || "",
            parentEmail: values.parentEmail.toLowerCase() || "",
            parentPhone: values.parentPhone || "",
            parentQualification: capitalize(values.parentQualification) || "",
            parentOccupation: capitalize(values.parentOccupation) || "",
            parentAddress: capitalize(values.parentAddress) || "",
          }
        );
        if (response?.statusCode === 200) {
          toast.success(t("messages.student.updateSuccess"));
          navigate(-1);
        }
      } catch (e) {
        toast.error(e);
      } finally {
        setLoading(false);
      }
    },
  });

  const renderStudentFormFields = () => (
    <div className="grid grid-cols-2 gap-4">
      {[
        {
          label: t("labels.gender"),
          name: "gender",
          type: "select",
          options: [t("options.male"), t("options.female"), t("options.other")],
        },
        {
          label: t("labels.firstName"),
          name: "firstname",
          placeholder: t("placeholders.firstName"),
          type: "text",
        },
        {
          label: t("labels.bloodGroup"),
          name: "bloodGroup",
          type: "select",
          options: ["A+", "A-", "B+", "B-", "O+", "O-", "AB+", "AB-"],
        },
        {
          label: t("labels.lastName"),
          name: "lastname",
          placeholder: t("placeholders.lastName"),
          type: "text",
        },
        {
          label: t("labels.dob"),
          name: "dob",
          placeholder: t("placeholders.dob"),
          type: "date",
        },
        {
          label: t("labels.address"),
          name: "address",
          placeholder: t("placeholders.address"),
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
                placeholderText={t("placeholders.date")}
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
            {field?.icon && (
              <img
                src={field.icon.src}
                className="absolute right-2"
                style={{
                  top: field?.icon?.top,
                  width: field?.icon?.width,
                  height: field?.icon?.height,
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
          label: t("labels.fullName"),
          name: "parentFullname",
          placeholder: t("placeholders.fullName"),
          type: "text",
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
          placeholder: t("placeholders.age"),
          type: "text",
        },
        {
          label: t("labels.emailAddress"),
          name: "parentEmail",
          icon: { src: mail, width: 40, height: 40, top: 0 },
          placeholder: t("placeholders.emailAddress"),
          type: "email",
        },
        {
          label: t("labels.phoneNumber"),
          name: "parentPhone",
          icon: { src: India, width: 35, height: 25, top: 7 },
          placeholder: t("placeholders.phoneNumber"),
          type: "Number",
        },
        {
          label: t("labels.qualification"),
          name: "parentQualification",
          placeholder: t("placeholders.qualification"),
          type: "text",
        },
        {
          label: t("labels.occupation"),
          name: "parentOccupation",
          placeholder: t("placeholders.occupation"),
          type: "text",
        },
        {
          label: t("labels.address"),
          name: "parentAddress",
          icon: { src: location, width: 30, height: 30, top: 5 },
          placeholder: t("placeholders.address"),
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
          {t("titles.studentDetails")}
        </h1>
        <div className="w-full">
          <h2 className="text-2xl font-poppins-regular mt-6 text-left">
            {t("titles.personalDetails")}
          </h2>
          <div className="bg-[rgba(70,69,144,0.05)] w-full p-5 box-border flex flex-col items-center my-5">
            <form onSubmit={formik.handleSubmit} className="w-full">
              {renderStudentFormFields()}
            </form>
          </div>

          <h2 className="text-2xl font-poppins-bold text-left ml-5">
            {t("titles.guardianDetails")}
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
                  {t("buttons.cancel")}
                </button>
                <button
                  type="submit"
                  className="bg-[#464590] text-white py-2 px-4 rounded w-36"
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
