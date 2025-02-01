// Import necessary dependencies and assets
import React, { useState, useMemo } from "react";
import { useFormik } from "formik";
import { jwtDecode } from "jwt-decode";
import { Link, useNavigate } from "react-router-dom";
import { Toaster, toast } from "react-hot-toast";
import { axiosClient } from "../services/axiosClient";
import LoginVideo from "../assets/videos/LoginVideo.mp4";
import hide from "../assets/images/hide.png";
import show from "../assets/images/show.png";
import logo from "../assets/images/deer logo.png";
import EndPoints from "../services/EndPoints";
import Spinner from "../components/Spinner";
import * as Yup from "yup";
import { useTranslation } from "react-i18next";
import { useDispatch } from "react-redux";
import { setAuthData } from "../store/AppAuthSlice";

/**
 * Login Component
 *
 * This component renders the login page, allowing users to authenticate as either
 * Admin or Teacher. It includes:
 * - Form validation with Yup.
 * - Form management with Formik.
 * - API integration with axios for login requests.
 * - UI toggles for password visibility and role switching.
 * - A video background for aesthetic appeal.
 */
function Login() {
  // Redux hook to dispatch actions
  const dispatch = useDispatch();

  // State to toggle between Admin and Teacher login
  const [isAdmin, setIsAdmin] = useState(true);

  // React Router hook for navigation
  const navigate = useNavigate();

  // State for managing password visibility
  const [ishide, setIsHide] = useState(true);

  // State for managing loading spinner visibility
  const [loading, setLoading] = useState(false);

  // Translation hook for multilingual support
  const [t] = useTranslation();

  /**
   * Memoized Yup validation schema
   * Dynamically adjusts based on the login role (Admin/Teacher).
   */
  const validationSchema = useMemo(
    () =>
      Yup.object({
        userInput: Yup.string()
          .required(
            isAdmin ? t("validationError.email") : t("validationError.username")
          )
          .test(
            "userInput",
            isAdmin ? t("validationError.emailAddress") : null,
            (value) =>
              isAdmin ? Yup.string().email().isValidSync(value) : true
          ),
        password: Yup.string().required(t("validationError.password")),
      }),
    [isAdmin, t]
  );

  /**
   * Formik setup for managing form submission, validation, and field state.
   */
  const formik = useFormik({
    initialValues: {
      userInput: "",
      password: "",
    },
    validationSchema, // Validation schema for form fields
    onSubmit: async (values, { setSubmitting, resetForm }) => {
      try {
        setLoading(true); // Show loading spinner

        // Define API endpoint and payload based on login role
        const endpoint = isAdmin
          ? EndPoints.ADMIN.ADMIN_LOGIN
          : EndPoints.TEACHER.TEACHER_LOGIN;
        const payload = isAdmin
          ? { email: values.userInput, password: values.password }
          : {
              user: values.userInput,
              password: values.password,
              platform: "web",
            };

        // Make API request for login
        const res = await axiosClient.post(endpoint, payload);

        if (res?.statusCode === 200) {
          const decodedToken = jwtDecode(res?.result?.accessToken);
          if (decodedToken.role === "admin") {
            // console.log(decodedToken);
            if (decodedToken?.active) {
              localStorage.setItem("access_token", res?.result?.accessToken);
              localStorage.setItem("refresh_token", res?.result?.refreshToken);
              localStorage.removeItem("temp_access_token");
              dispatch(setAuthData(res?.result?.accessToken));
              toast.success(t("messages.login.success"));
              resetForm();
              navigate("/");
            } else {
              localStorage.setItem(
                "temp_access_token",
                res?.result?.accessToken
              );
              let page;
              if (!decodedToken?.pincode) {
                page = 2;
              } else if (!decodedToken?.username) {
                page = 3;
              } else {
                page = 4;
              }
              navigate("/signup");
              localStorage.setItem("page", page);
            }
          } else {
            localStorage.setItem("access_token", res?.result?.accessToken);
            localStorage.setItem("refresh_token", res?.result?.refreshToken);
            dispatch(setAuthData(res?.result?.accessToken));
            toast.success(t("messages.login.success"));
            resetForm();
            navigate("/");
          }
        }
      } catch (e) {
        toast.error(e); // Show error message
      } finally {
        setLoading(false); // Hide loading spinner
        setSubmitting(false); // Reset form submission state
      }
    },
  });

  return (
    <div className="min-h-screen py-20 bg-[#fafafa] relative">
      {/* Background video */}
      <video
        className="fixed top-0 left-0 h-full w-[55%] bg-[#fafafa] bg-blend-multiply object-cover"
        autoPlay
        loop
        muted
        src={LoginVideo}
        type="video/mp4"
      />

      {/* Form container */}
      <div className="flex flex-col lg:flex-row mx-auto overflow-hidden absolute top-1/2 left-[52%] transform -translate-y-1/2 right-0 z-10 w-[420px] h-[460px] bg-[#93a3b6]/15 backdrop-filter: blur(25px) rounded-3xl">
        <form onSubmit={formik.handleSubmit} className="w-full h-full">
          {loading && (
            <div className="absolute inset-0 flex items-center justify-center bg-[#93a3b6]/10 bg-opacity-50 z-30">
              <Spinner />
            </div>
          )}

          {/* Logo and header */}
          <div className="text-[#0F4189] w-full px-[42px] py-4 justify-center">
            <h2 className="flex text-3xl mb-4 justify-center">
              <Link to="/" className="flex items-center">
                <img src={logo} alt="logo" className="size-12" />
              </Link>
            </h2>
            <h2 className="font-bold text-[24px]">{t("login.login")}</h2>

            {/* Email/username input */}
            <div className="mt-6 border-b border-[#686868]/60 w-full">
              <input
                className="py-1 px-2 w-full bg-transparent text-[#040320] placeholder-[#686868]/50 focus:outline-none"
                type="text"
                name="userInput"
                placeholder={
                  isAdmin
                    ? t("login.placeholders.email")
                    : t("login.placeholders.username")
                }
                onChange={formik.handleChange}
                onBlur={formik.handleBlur}
                value={formik.values.userInput}
              />
            </div>
            {formik.touched.userInput && formik.errors.userInput && (
              <div className="text-red-500 text-xs">
                {formik.errors.userInput}
              </div>
            )}

            {/* Password input with visibility toggle */}
            <div className="mt-6 relative border-b border-[#686868]/60 w-full">
              <input
                className="py-1 px-2 w-full bg-transparent text-[#040320] placeholder-[#686868]/50 focus:outline-none"
                type={ishide ? "password" : "text"}
                name="password"
                placeholder={t("login.placeholders.password")}
                onChange={formik.handleChange}
                value={formik.values.password}
              />
              <img
                src={ishide ? hide : show}
                onClick={() => setIsHide(!ishide)}
                alt={ishide ? "Show Password" : "Hide Password"}
                className="absolute right-2 top-1/2 transform -translate-y-1/2 w-6 h-6 cursor-pointer"
                style={{
                  filter:
                    "invert(41%) sepia(0%) saturate(0%) hue-rotate(180deg) brightness(90%) contrast(85%)",
                }}
              />
              {formik.touched.password && formik.errors.password && (
                <div className="text-red-500 text-xs">
                  {formik.errors.password}
                </div>
              )}
            </div>

            {/* Forgot password link */}
            <div className="text-white text-end text-sm mt-6">
              <Link to="/forgot-password" className="text-[#040320]/70">
                {t("login.forgotPassword")}
              </Link>
            </div>

            {/* Submit button */}
            <div className="mt-6">
              <button
                name="submit"
                className="w-full py-1.5 text-center bg-[#0F4189] text-white font-poppins-bold rounded-lg disabled:opacity-50"
                type="submit"
                disabled={formik.isSubmitting}
              >
                {t("login.loginButton")}
              </button>
            </div>

            {/* Toggle between Admin and Teacher */}
            <div className="mt-3">
              <button
                type="button"
                onClick={() => setIsAdmin(!isAdmin)}
                className="w-full py-1 border border-[#0F4189] text-[#0F4189] rounded-lg font-bold"
              >
                {t("login.toggleButton")} {isAdmin ? "Teacher" : "Admin"}
              </button>
            </div>

            {isAdmin && (
              <div className="flex justify-center text-white text-xs mt-6">
                <div className="text-[#040320]/70 pr-1">
                  {t("login.notHaveAccount")}
                </div>
                <Link to="/signup" className="text-[#0F4189] font-bold">
                  {t("login.register")}
                </Link>
              </div>
            )}
          </div>
        </form>
      </div>
      <Toaster />
    </div>
  );
}

export default Login;
