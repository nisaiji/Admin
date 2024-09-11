import { useFormik } from "formik";
import { Link, useNavigate } from "react-router-dom";
import { Toaster, toast } from "react-hot-toast";
import { axiosClient } from "../services/axiosClient";
import hide from "../assets/images/hide.png";
import show from "../assets/images/show.png";
import { useState } from "react";
import * as Yup from "yup";
import EndPoints from "../services/EndPoints";
import { useTranslation } from "react-i18next";
import REGEX from "../utils/regix";
import Background from "../assets/images/Background.png";

function Signup() {
  const [ishide, setIsHide] = useState(true);
  const [loading, setLoading] = useState(true);
  const navigate = useNavigate();
  const [t] = useTranslation();

  const formik = useFormik({
    initialValues: {
      schoolName: "",
      affiliationNo: "",
      address: "",
      email: "",
      phone: "",
      username: "",
      password: "",
    },
    validationSchema: Yup.object({
      schoolName: Yup.string().required(t("validationError.schoolName")),
      affiliationNo: Yup.string().required(
        t("validationError.affiliationNumber")
      ),
      address: Yup.string().required(t("validationError.address")),
      email: Yup.string()
        .email(t("validationError.emailAddress"))
        .required(t("validationError.email")),
      phone: Yup.string()
        .required(t("validationError.phone"))
        .matches(REGEX.PHONE, t("validationError.phoneNumber"))
        .test(
          "starts-with-1-to-5",
          t("validationError.phoneStart"),
          (value) => {
            return value && REGEX.PHONE_TEST.test(value);
          }
        ),
      username: Yup.string().required(t("validationError.username")),
      password: Yup.string()
        .min(8, t("validationError.passwordLength"))
        .required(t("validationError.password")),
    }),
    onSubmit: async (values, { setSubmitting, resetForm }) => {
      try {
        if (!formik.isValid || !formik.dirty) {
          setSubmitting(false);
          return;
        }
        setLoading(true);
        const response = await axiosClient.post(
          EndPoints.ADMIN.ADMIN_REGISTER,
          values
        );
        if (response?.statusCode === 200 || response?.statusCode === 201) {
          toast.success(t("message.admin.registerSuccess"));
          resetForm();
          navigate("/login");
        }
      } catch (e) {
        toast.error(e);
      } finally {
        setSubmitting(false);
        setLoading(false);
      }
    },
  });

  return (
    <div
      className="min-h-screen py-20"
      style={{
        backgroundImage:
          "linear-gradient(115deg, #000428, #00F0FF, #004E92, #065DA8)",
      }}
    >
      <Toaster position="top-center" reverseOrder={false} />
      <div className="container mx-auto">
        <div className="flex flex-col lg:flex-row w-10/12 lg:w-9/12 bg-white rounded-xl mx-auto shadow-lg overflow-hidden">
          <div
            className="w-full lg:w-2/5 flex flex-col items-center justify-center p-4 bg-no-repeat bg-cover bg-center"
            style={{
              backgroundImage: `url(${Background})`,
            }}
          >
            <h1 className="text-white text-3xl mb-3 text-center">
              {t("register.welcome")}
            </h1>
            <div className=" w-full">
              <p className="text-white text-center">
                {t("register.description")}
              </p>
            </div>
          </div>
          <div className="w-full lg:w-3/5 py-16 px-12">
            <h2 className="text-3xl mb-4 text-center">
              {t("register.adminRegister")}
            </h2>
            <form onSubmit={formik.handleSubmit}>
              <div className="mt-5">
                <input
                  type="text"
                  name="schoolName"
                  placeholder="school-Name"
                  className="border border-gray-400 py-1 px-2 w-full"
                  onChange={formik.handleChange}
                  onBlur={formik.handleBlur}
                  value={formik.values.schoolName}
                />
                {formik.touched.schoolName && formik.errors.schoolName ? (
                  <div className="text-red-600 text-sm">
                    {formik.errors.schoolName}
                  </div>
                ) : null}
              </div>
              <div className="mt-5">
                <input
                  type="text"
                  name="affiliationNo"
                  placeholder="Affiliation-No."
                  className="border border-gray-400 py-1 px-2 w-full"
                  onChange={formik.handleChange}
                  onBlur={formik.handleBlur}
                  value={formik.values.affiliationNo}
                />
                {formik.touched.affiliationNo && formik.errors.affiliationNo ? (
                  <div className="text-red-600 text-sm">
                    {formik.errors.affiliationNo}
                  </div>
                ) : null}
              </div>
              <div className="mt-5">
                <input
                  type="text"
                  name="address"
                  placeholder="Address"
                  className="border border-gray-400 py-1 px-2 w-full"
                  onChange={formik.handleChange}
                  onBlur={formik.handleBlur}
                  value={formik.values.address}
                />
                {formik.touched.address && formik.errors.address ? (
                  <div className="text-red-600 text-sm">
                    {formik.errors.address}
                  </div>
                ) : null}
              </div>
              <div className="mt-5">
                <input
                  type="email"
                  name="email"
                  placeholder="Email"
                  className="border border-gray-400 py-1 px-2 w-full"
                  onChange={formik.handleChange}
                  onBlur={formik.handleBlur}
                  value={formik.values.email}
                />
                {formik.touched.email && formik.errors.email ? (
                  <div className="text-red-600 text-sm">
                    {formik.errors.email}
                  </div>
                ) : null}
              </div>
              <div className="mt-5">
                <input
                  type="text"
                  name="phone"
                  placeholder="Enter phone number"
                  className="border border-gray-400 py-1 px-2 w-full"
                  onChange={formik.handleChange}
                  onBlur={formik.handleBlur}
                  value={formik.values.phone}
                />
                {formik.touched.phone && formik.errors.phone ? (
                  <div className="text-red-600 text-sm">
                    {formik.errors.phone}
                  </div>
                ) : null}
              </div>
              <div className="mt-5">
                <input
                  type="text"
                  name="username"
                  placeholder="user-Name"
                  className="border border-gray-400 py-1 px-2 w-full"
                  onChange={formik.handleChange}
                  onBlur={formik.handleBlur}
                  value={formik.values.username}
                />
                {formik.touched.username && formik.errors.username ? (
                  <div className="text-red-600 text-sm">
                    {formik.errors.username}
                  </div>
                ) : null}
              </div>
              <div className="mt-5 border border-gray-400 flex justify-center items-center focus-within:border-black focus-within:border-2 focus-within:rounded-md">
                <input
                  type={ishide ? "password" : "text"}
                  name="password"
                  placeholder="Password"
                  className="py-1 px-2 w-full border-none focus:outline-none"
                  onChange={formik.handleChange}
                  onBlur={formik.handleBlur}
                  value={formik.values.password}
                />
                {ishide ? (
                  <img
                    src={show}
                    onClick={() => setIsHide(!ishide)}
                    alt=""
                    className="size-5 relative right-3"
                    style={{
                      filter:
                        "invert(41%) sepia(0%) saturate(0%) hue-rotate(180deg) brightness(90%) contrast(85%)",
                    }}
                  />
                ) : (
                  <img
                    src={hide}
                    onClick={() => setIsHide(!ishide)}
                    alt=""
                    className="size-5 relative right-3"
                    style={{
                      filter:
                        "invert(41%) sepia(0%) saturate(0%) hue-rotate(180deg) brightness(90%) contrast(85%)",
                    }}
                  />
                )}
              </div>
              {formik.touched.password && formik.errors.password ? (
                <div className="text-red-600 text-sm">
                  {formik.errors.password}
                </div>
              ) : null}
              <div className="mt-5">
                <button
                  type="submit"
                  className="w-full bg-blue-900 py-3 text-center text-white"
                  disabled={formik.isSubmitting}
                >
                  {formik.isSubmitting
                    ? t("register.submitting")
                    : t("register.registerNow")}
                </button>
              </div>
            </form>
            <div className="text-right mt-2 text-sm">
              {t("register.haveAccount")}
              <Link to="/login">
                <span className="text-blue-950 font-semibold">
                  {t("login.login")}
                </span>
              </Link>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

export default Signup;
