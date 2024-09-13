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

export default function TeacherUpdate() {
  const navigate = useNavigate();
  const teacher = useLocation().state;
  const [loading, setLoading] = useState(false);
  const { t } = useTranslation();

  const validationSchema = Yup.object({
    firstname: Yup.string().required(t("validationError.firstName")),
    lastname: Yup.string().required(t("validationError.lastName")),
    phone: Yup.string()
      .required(t("validationError.phone"))
      .matches(REGEX.PHONE, t("validationError.phoneNumber"))
      .test("starts-with-1-to-5", t("validationError.phoneStart"), (value) => {
        return value && REGEX.PHONE_TEST.test(value);
      }),
  });

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
      try {
        setLoading(true);
        const teacherData = {
          firstname: values.firstname ? capitalize(values.firstname) : "",
          lastname: values.lastname ? capitalize(values.lastname) : "",
          email: values.email ? values.email.toLowerCase() : "",
          address: values.address ? capitalize(values.address) : "",
          university: values.university ? capitalize(values.university) : "",
          gender: values.gender || "",
          bloodGroup: values.bloodGroup || "",
          dob: values.dob || "",
          phone: values.phone || "",
          degree: values.degree ? capitalize(values.degree) : "",
        };
        const filteredTeacherData = Object.fromEntries(
          Object.entries(teacherData).filter(([_, value]) => value !== "")
        );

        const response = await axiosClient.put(
          `${EndPoints.ADMIN.UPDATE_TEACHER}/${teacher._id}`,
          filteredTeacherData
        );
        if (response?.statusCode === 200) {
          toast.success(t("messages.teacher.updateSuccess"));
          navigate(-1);
        }
      } catch (e) {
        toast.error(e);
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
          {t("titles.teacherDetails")}
        </h1>
        <h2 className="text-2xl font-poppins-regular mt-6 text-left">
          {t("titles.teacherPersonalDetails")}
        </h2>
        <div className="bg-[rgba(70,69,144,0.05)] w-full p-5 box-border flex flex-col items-center my-5">
          <form onSubmit={formik.handleSubmit} className="w-full">
            <div className="grid grid-cols-2 gap-4">
              {[
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
                  options: [
                    t("options.Male"),
                    t("options.Female"),
                    t("options.other"),
                  ],
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
                  icon: { src: mail, width: 40, height: 40, top: 0 },
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
                  icon: { src: location, width: 30, height: 30, top: 5 },
                },
                {
                  name: "phone",
                  label: t("labels.phoneNumber"),
                  placeholder: t("placeholders.phoneNumber"),
                  type: "text",
                  icon: { src: India, width: 35, height: 25, top: 7 },
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
  );
}
