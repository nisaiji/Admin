import React, { useState } from "react";
import { useFormik } from "formik";
import { useLocation, useNavigate } from "react-router-dom";
import DatePicker from "react-datepicker";
import "react-datepicker/dist/react-datepicker.css";
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
import moment from "moment";

const capitalize = (str) =>
  str.charAt(0).toUpperCase() + str.slice(1).toLowerCase();

export default function StudentUpdate() {
  const navigate = useNavigate();
  const student = useLocation().state;
  const [t] = useTranslation();
  const [loading, setLoading] = useState(false);

  // validation schema
  const validationSchema = Yup.object({
    firstname: Yup.string().required(t("validationError.firstName")),
    lastname: Yup.string().required(t("validationError.lastName")),
    gender: Yup.string().required(t("validationError.gender")),
    bloodGroup: Yup.string().required(t("validationError.bloodGroup")),
    dob: Yup.date().required(t("validationError.dob")),
    dob: Yup.date()
      .nullable()
      .required(t("validationError.dob"))
      .transform((value, originalValue) =>
        moment(originalValue, "DD/MM/YYYY").isValid()
          ? moment(originalValue, "DD/MM/YYYY").toDate()
          : null
      ),
    address: Yup.string().required(t("validationError.address")),
    parentName: Yup.string().required(t("validationError.parentName")),
    parentGender: Yup.string().required(t("validationError.gender")),
    parentAge: Yup.string(t("validationError.age")).required(),
    parentEmail: Yup.string()
      .email(t("validationError.emailAddress"))
      .required(t("validationError.email")),
    phone: Yup.string()
      .required()
      .matches(REGEX.PHONE, t("validationError.phoneNumber"))
      .test(
        "starts-with-1-to-5",
        t("validationError.phoneStart"),
        (value) => value && REGEX.PHONE_TEST.test(value)
      ),
    parentQualification: Yup.string().required(
      t("validationError.qualification")
    ),
    parentOccupation: Yup.string().required(t("validationError.occupation")),
    parentAddress: Yup.string().required(t("validationError.address")),
  });

  const formik = useFormik({
    initialValues: {
      firstname: student?.firstname || "",
      lastname: student?.lastname || "",
      gender: student?.gender || "",
      bloodGroup: student?.bloodGroup || "",
      dob: student?.dob || "",
      address: student?.address || "",
      parentName: student?.parentDetails?.fullname || "",
      parentGender: student.parentDetails?.gender || "",
      parentAge: student?.parentDetails?.age || "",
      parentEmail: student?.parentDetails?.email || "",
      phone: student?.parentDetails?.phone || "",
      parentQualification: student?.parentDetails?.qualification || "",
      parentOccupation: student?.parentDetails?.occupation || "",
      parentAddress: student?.parentDetails?.address || "",
    },
    validationSchema,
    // update student api
    onSubmit: async (values) => {
      try {
        setLoading(true);

        const response = await axiosClient.put(
          `${EndPoints.ADMIN.STUDENT_UPDATE}/${student._id}`,
          {
            ...values,
            firstname: capitalize(values.firstname),
            lastname: capitalize(values.lastname),
            address: capitalize(values.address),
            parentName: capitalize(values.parentName),
            parentEmail: values.parentEmail.toLowerCase(),
            parentQualification: capitalize(values.parentQualification),
            parentOccupation: capitalize(values.parentOccupation),
            parentAddress: capitalize(values.parentAddress),
          }
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
      placeholder: t("placeholders.dob"),
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
      icon: { src: mail, width: 40, height: 40, top: 0 },
    },
    {
      label: t("labels.phoneNumber"),
      name: "phone",
      type: "text",
      placeholder: t("placeholders.phoneNumber"),
      icon: { src: India, width: 35, height: 25, top: 7 },
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
      icon: { src: location, width: 30, height: 30, top: 5 },
    },
  ];

  // logic for input fields to reduce repetative code
  const renderFields = (fields) => (
    <div className="grid grid-cols-2 gap-4">
      {fields.map(({ label, name, type, placeholder, options, icon }) => (
        <div key={name} className="flex flex-col mx-4 mt-3">
          <label className="text-xl font-semibold">{label}</label>
          <div className="relative mt-2">
            {type === "select" ? (
              <select
                name={name}
                onChange={formik.handleChange}
                value={formik.values[name]}
                className="border-2 border-[#d1d1e3] rounded px-2 py-1.5 w-full"
              >
                <option value="" label={label} />
                {options.map((option) => (
                  <option key={option} value={option} label={option} />
                ))}
              </select>
            ) : type === "date" ? (
              <DatePicker
                selected={
                  formik.values.dob
                    ? moment(formik.values.dob, "DD/MM/YYYY").toDate()
                    : ""
                }
                onChange={(date) =>
                  formik.setFieldValue("dob", moment(date).format("DD/MM/YYYY"))
                }
                dateFormat="dd/MM/yyyy"
                placeholderText={placeholder}
                className="border-2 border-[#d1d1e3] rounded px-2 py-1.5 w-full"
                wrapperClassName="w-full"
                maxDate={new Date()}
                onKeyDown={(e) => e.preventDefault()}
                showMonthDropdown
                showYearDropdown
                dropdownMode="select"
              />
            ) : (
              <input
                type={type}
                name={name}
                placeholder={placeholder}
                onChange={formik.handleChange}
                value={formik.values[name]}
                className="border-2 border-[#d1d1e3] rounded px-2 py-1.5 w-full"
              />
            )}
            {icon && (
              <img
                src={icon.src}
                className="absolute right-2"
                style={{
                  top: icon.top,
                  width: icon.width,
                  height: icon.height,
                }}
                alt=""
              />
            )}
            {formik.touched[name] && formik.errors[name] && (
              <div className="text-red-500 text-sm">{formik.errors[name]}</div>
            )}
          </div>
        </div>
      ))}
      ;
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
              {renderFields(studentFields)}
            </form>
          </div>

          <h2 className="text-2xl font-poppins-bold text-left ml-5">
            {t("titles.guardianDetails")}
          </h2>
          <div className="bg-[rgba(70,69,144,0.05)] w-full p-5 box-border flex flex-col items-center my-5">
            <form onSubmit={formik.handleSubmit} className="w-full">
              {renderFields(guardianFields)}
              {/* save and cancel buttons */}
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
