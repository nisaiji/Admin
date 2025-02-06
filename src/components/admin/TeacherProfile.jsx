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

export default function TeacherProfile() {
  const [teacher, setTeacher] = useState([]);
  const [loading, setLoading] = useState(false);
  const { t } = useTranslation();

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
      className="flex flex-col items-center bg-[#93a3b6]/25 p-6"
    >
      {loading && (
        <div className="fixed inset-0 flex items-center justify-center bg-[#fafafa] bg-opacity-50 z-30">
          <Spinner />
        </div>
      )}
      {/* Account Setting */}
      <div className="flex flex-col p-10 w-full rounded-2xl bg-[#fafafa] max-md:px-5 max-md:m-10 max-md:max-w-full">
        <Toaster position="top-center" reverseOrder={false} />
        <div className="text-2xl font-bold tracking-tight leading-8 text-neutral-800">
          {t("adminProfile.accountSettings")}
        </div>

        <div className="flex flex-wrap gap-5 mt-5 w-full">
          {/* firstName */}
          <div className="flex flex-row w-full space-x-5">
            <div className="w-full md:w-4/5">
              <label className="text-sm font-semibold leading-5 text-neutral-800">
                {t("labels.firstName")}
                <span className="text-red-500">*</span>
              </label>
              <input
                name="firstname"
                placeholder={t("placeholders.firstName")}
                value={formik.values.firstname}
                onChange={formik.handleChange}
                onBlur={formik.handleBlur}
                data-testid="firstname"
                className={`p-2 mt-1 w-full text-base leading-6 ${
                  formik.errors.firstname && formik.touched.firstname
                    ? "border-red-500"
                    : "border-gray-200"
                } text-black bg-white border`}
              />
              {formik.errors.firstname && formik.touched.firstname && (
                <div className="text-red-500 text-sm mt-1">
                  {formik.errors.firstname}
                </div>
              )}
            </div>
            {/* lastname */}
            <div className="w-full md:w-4/5">
              <label className="text-sm font-semibold leading-5 text-neutral-800">
                {t("labels.lastName")} <span className="text-red-500">*</span>
              </label>
              <input
                name="lastname"
                placeholder={t("placeholders.lastName")}
                value={formik.values.lastname}
                onChange={formik.handleChange}
                onBlur={formik.handleBlur}
                data-testid="lastname"
                className={`p-2 mt-1 w-full text-base leading-6 ${
                  formik.errors.lastname && formik.touched.lastname
                    ? "border-red-500"
                    : "border-gray-200"
                } text-black bg-white border`}
              />
              {formik.errors.lastname && formik.touched.lastname && (
                <div className="text-red-500 text-sm mt-1">
                  {formik.errors.lastname}
                </div>
              )}
            </div>
          </div>

          <div className="flex flex-row w-full space-x-5">
            {/* DOB */}
            <div className="w-full md:w-4/5">
              <label className="text-sm font-semibold leading-5 text-neutral-800">
                {t("labels.dob")} <span className="text-red-500">*</span>
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
                className={`p-2 mt-1 w-full text-base leading-6 ${
                  formik.errors.dob && formik.touched.dob
                    ? "border-red-500"
                    : "border-gray-200"
                } text-black bg-white border`}
                wrapperClassName="w-full"
                maxDate={new Date()}
                onKeyDown={(e) => e.preventDefault()}
                showMonthDropdown
                showYearDropdown
                dropdownMode="select"
              />
              {formik.errors.dob && formik.touched.dob && (
                <div className="text-red-500 text-sm mt-1">
                  {formik.errors.dob}
                </div>
              )}
            </div>
            {/* gender dropdown */}
            <div className="w-full md:w-4/5">
              <label className="text-sm font-semibold leading-5 text-neutral-800">
                {t("labels.gender")} <span className="text-red-500">*</span>
              </label>
              <select
                name="gender"
                value={formik.values.gender}
                onChange={formik.handleChange}
                onBlur={formik.handleBlur}
                data-testid="gender"
                className={`p-2 mt-1 w-full text-base leading-6 ${
                  formik.errors.gender && formik.touched.gender
                    ? "border-red-500"
                    : "border-gray-200"
                } text-black bg-white border`}
              >
                <option value="">{t("placeholders.selectGender")}</option>
                <option value="Male">{t("options.male")}</option>
                <option value="Female">{t("options.female")}</option>
                <option value="Other">{t("options.other")}</option>
              </select>
              {formik.errors.gender && formik.touched.gender && (
                <div className="text-red-500 text-sm mt-1">
                  {formik.errors.gender}
                </div>
              )}
            </div>
          </div>

          <div className="flex flex-row w-full space-x-5">
            {/* BloodGroup dropdown */}
            <div className="w-full md:w-4/5">
              <label className="text-sm font-semibold leading-5 text-neutral-800">
                {t("labels.bloodGroup")} <span className="text-red-500">*</span>
              </label>
              <select
                name="bloodGroup"
                value={formik.values.bloodGroup}
                onChange={formik.handleChange}
                onBlur={formik.handleBlur}
                data-testid="bloodGroup"
                className={`p-2 mt-1 w-full text-base leading-6 ${
                  formik.errors.bloodGroup && formik.touched.bloodGroup
                    ? "border-red-500"
                    : "border-gray-200"
                } text-black bg-white border`}
              >
                <option value="">{t("placeholders.bloodGroup")}</option>
                <option value="A+">A+</option>
                <option value="A-">A-</option>
                <option value="B+">B+</option>
                <option value="B-">B-</option>
                <option value="AB+">AB+</option>
                <option value="AB-">AB-</option>
                <option value="O+">O+</option>
                <option value="O-">O-</option>
              </select>
              {formik.errors.bloodGroup && formik.touched.bloodGroup && (
                <div className="text-red-500 text-sm mt-1">
                  {formik.errors.bloodGroup}
                </div>
              )}
            </div>
            {/* phone */}
            <div className="w-full md:w-4/5">
              <label className="text-sm font-semibold leading-5 text-neutral-800">
                {t("labels.phone")} <span className="text-red-500">*</span>
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
                    ? "border-red-500"
                    : "border-gray-200"
                } text-black bg-white border`}
              />
              {formik.errors.phone && formik.touched.phone && (
                <div className="text-red-500 text-sm mt-1">
                  {formik.errors.phone}
                </div>
              )}
            </div>
          </div>

          <div className="flex flex-row w-full space-x-5">
            {/* university */}
            <div className="w-full md:w-4/5">
              <label className="text-sm font-semibold leading-5 text-neutral-800">
                {t("labels.university")} <span className="text-red-500">*</span>
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
                    ? "border-red-500"
                    : "border-gray-200"
                } text-black bg-white border`}
              />
              {formik.errors.university && formik.touched.university && (
                <div className="text-red-500 text-sm mt-1">
                  {formik.errors.university}
                </div>
              )}
            </div>
            {/* Qualification */}
            <div className="w-full md:w-4/5">
              <label className="text-sm font-semibold leading-5 text-neutral-800">
                {t("labels.qualification")}{" "}
                <span className="text-red-500">*</span>
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
                    ? "border-red-500"
                    : "border-gray-200"
                } text-black bg-white border`}
              />

              {formik.errors.degree && formik.touched.degree && (
                <div className="text-red-500 text-sm mt-1">
                  {formik.errors.degree}
                </div>
              )}
            </div>
          </div>

          {/* save button */}
          <div className="flex gap-5 mt-7">
            <button
              type="submit"
              data-testid="submit"
              className="px-6 py-2 text-white bg-[#0F4189] rounded-lg"
            >
              {t("buttons.saveChanges")}
            </button>
          </div>
        </div>
      </div>
    </form>
  );
}
