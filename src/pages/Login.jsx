import { useState, useMemo } from "react";
import { useFormik } from "formik";
import { Link, useNavigate } from "react-router-dom";
import { Toaster, toast } from "react-hot-toast";
import { axiosClient } from "../services/axiosClient";
import {
  setItem,
  setUsername,
  setFirstname,
} from "../services/LocalStorageManager";
import LoginVideo from "../assets/videos/LoginVideo.mp4";
import hide from "../assets/images/hide.png";
import show from "../assets/images/show.png";
import EndPoints from "../services/EndPoints";
import Spinner from "../components/Spinner";
import * as Yup from "yup";
import { useTranslation } from "react-i18next";
import { useDispatch } from "react-redux";
import { setAuthData } from "../store/AppAuthSlice";

function Login() {
  const dispatch = useDispatch();
  const [isAdmin, setIsAdmin] = useState(true);
  const navigate = useNavigate();
  const [ishide, setIsHide] = useState(true);
  const [loading, setLoading] = useState(false);
  const [t] = useTranslation();

  // Memoized validation schema for login form to avoid recalculating on re-render
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

  // Setup formik for handling form submission, validation, and field management
  const formik = useFormik({
    initialValues: {
      userInput: "",
      password: "",
    },
    validationSchema, // Schema to validate the input
    onSubmit: async (values, { setSubmitting, resetForm }) => {
      try {
        setLoading(true);

        // Set API endpoint and payload based on Admin/Teacher toggle
        const endpoint = isAdmin
          ? EndPoints.ADMIN.ADMIN_LOGIN
          : EndPoints.TEACHER.TEACHER_LOGIN;
        const payload = isAdmin
          ? { email: values.userInput, password: values.password }
          : { user: values.userInput, password: values.password };

        // Submit login request
        const response = await axiosClient.post(endpoint, payload);
        const { result } = response;
        // If login is successful

        if (response?.statusCode === 200) {
          isAdmin
            ? setUsername(result?.username)
            : setFirstname(result?.firstname);
          setItem(result?.accessToken);
          dispatch(setAuthData(result?.accessToken));
          toast.success(t("messages.login.success"));
          resetForm();
          navigate("/");
        }
      } catch (e) {
        toast.error(e);
      } finally {
        setLoading(false);
        setSubmitting(false);
      }
    },
  });

  return (
    <div className="min-h-screen py-20 bg-[#05022B] relative">
      {/* Background video for the login page */}
      <video
        className="fixed top-0 left-0 h-[800px] w-[700px] object-cover opacity-25"
        autoPlay
        loop
        muted
        src={LoginVideo}
        type="video/mp4"
      />
      {/* Welcome text and description */}
      <div className="absolute top-[100px] left-[92px] z-10">
        <h1 className="text-white text-[48px] leading-[60px] font-poppins font-semibold w-[50%]">
          {t("login.welcome")}
        </h1>
      </div>
      {/* Form container */}
      <div className="flex flex-col lg:flex-row mx-auto shadow-lg overflow-hidden absolute top-1/2 left-[52%] transform -translate-y-1/2 right-0 z-10 w-[420px] h-[520px] bg-white bg-opacity-20 rounded-3xl backdrop-blur-lg">
        {/* Form starts here */}
        <form onSubmit={formik.handleSubmit} className="w-full h-full">
          {loading && (
            <div className="absolute inset-0 flex items-center justify-center bg-black bg-opacity-50 z-30">
              <Spinner />
            </div>
          )}
          {/* Logo section */}
          <div className="text-white w-full py-8 px-12">
            <h2 className="flex text-3xl mb-4">
              <Link to="/">
                <div className="bg-[#05022B] w-[30px] h-[30px] rounded-md flex justify-center items-center">
                  <span className="text-white font-bold text-xl">
                    {t("login.A")}
                  </span>
                </div>
              </Link>
              <span className="font-bold text-xl ml-2 text-white">
                {t("login.LOGO")}
              </span>
            </h2>
            <h2 className="font-bold text-[48px]">{t("login.login")}</h2>
            <p className="text-white opacity-70">{t("login.enterDetails")}</p>

            {/* Input field for email/username */}
            <div className="mt-5 border-b border-white/40 w-full">
              <input
                className="py-1 px-2 w-full bg-transparent text-white placeholder-white focus:outline-none"
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
            {/* Validation error for userInput */}
            {formik.touched.userInput && formik.errors.userInput && (
              <div className="text-red-500 text-xs">
                {formik.errors.userInput}
              </div>
            )}

            {/* Input field for password with toggle visibility feature */}
            <div className="mt-5 relative border-b border-white w-full">
              <input
                className="py-1 px-2 w-full bg-transparent text-white placeholder-white focus:outline-none"
                type={ishide ? "password" : "text"}
                name="password"
                placeholder={t("login.placeholders.password")}
                onChange={formik.handleChange}
                value={formik.values.password}
              />
              {/* Password visibility toggle */}
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
              {/* Validation error for password */}
              {formik.touched.password && formik.errors.password && (
                <div className="text-red-500 text-xs">
                  {formik.errors.password}
                </div>
              )}
            </div>

            {/* Forgot password link */}
            <div className="text-white text-end text-sm mt-2 opacity-70">
              <Link to="/forgot-password" className="text-white">
                {t("login.forgotPassword")}
              </Link>
            </div>

            {/* Submit button for login */}
            <div className="mt-5">
              <button
                className="w-full py-1.5 text-center bg-white text-[#05022B] font-semibold rounded-lg disabled:opacity-50"
                type="submit"
                disabled={formik.isSubmitting}
              >
                {t("login.login")}
              </button>
            </div>

            {/* Toggle button to switch between Admin and Teacher login */}
            <div className="mt-5">
              <button
                type="button"
                onClick={() => setIsAdmin(!isAdmin)}
                className="w-full py-1 border-2 border-white text-white rounded-lg font-poppins-regular"
              >
                {t("login.toggleButton")} {isAdmin ? "Teacher" : "Admin"}
              </button>
            </div>

            {isAdmin && (
              <div className="flex justify-center text-white text-xs opacity-70 mt-3">
                <div className="text-[#FFFFFFB3] pr-1">
                  {t("login.notHaveAccount")}
                </div>
                <Link to="/signup" className="text-white">
                  {t("login.register")}
                </Link>
              </div>
            )}
          </div>
        </form>
      </div>
      <Toaster position="top-center" reverseOrder={false} />
    </div>
  );
}

export default Login;
