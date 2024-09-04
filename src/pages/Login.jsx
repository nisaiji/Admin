import { useEffect, useState } from "react";
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

const validationSchema = Yup.object({
  username: Yup.string().when("isAdmin", {
    is: false,
    then: Yup.string().required("Username is required"),
  }),
  email: Yup.string().when("isAdmin", {
    is: true,
    then: Yup.string()
      .email("Invalid email address")
      .required("Email is required"),
  }),
  password: Yup.string().required("Password is required"),
});

function Login() {
  const [isAdmin, setIsAdmin] = useState(true);
  const navigate = useNavigate();
  const [ishide, setIsHide] = useState(true);
  const [loading, setLoading] = useState(false);
  const [t] = useTranslation();
  const formik = useFormik({
    initialValues: {
      username: "",
      email: "",
      password: "",
    },
    validationSchema,
    validate: (values) => {
      const errors = {};
      return errors;
    },
    onSubmit: async (values, { setSubmitting, resetForm }) => {
      try {
        let response;
        setLoading(true);
        if (isAdmin) {
          response = await axiosClient.post(EndPoints.ADMIN.ADMIN_LOGIN, {
            email: values.email,
            password: values.password,
          });
          if (response?.statusCode === 200) {
            setItem(response?.result?.accessToken);
            setUsername(response?.result?.username);
          }
        } else {
          response = await axiosClient.post(EndPoints.TEACHER.TEACHER_LOGIN, {
            user: values.username,
            password: values.password,
          });
          // console.log(response);

          if (response?.statusCode === 200) {
            setItem(response?.result?.accessToken);
            setFirstname(response?.result?.firstname);
          }
        }
        // toast.success(<b>{t("login.success")}</b>);
        toast.success("login successful");
        resetForm();
        // navigate("/");
        window.location.replace("/");
      } catch (e) {
        console.log(e);
        toast.error(e);
      } finally {
        setLoading(false);
        setSubmitting(false);
      }
    },
  });

  return (
    <div
      className="min-h-screen py-20"
      style={{ background: "#05022B", position: "relative" }}
    >
      {/* Video Background */}
      <video
        style={{
          opacity: "25%",
          position: "fixed",
          top: "0",
          left: "0",
          objectFit: "cover",
          height: "800px",
          width: "700px",
          zIndex: "1",
        }}
        autoPlay
        loop
        muted
        src={LoginVideo}
        type="video/mp4"
      />

      {/* Text Above Video */}
      <div
        style={{
          position: "absolute",
          width: "595px",
          height: "218px",
          top: "130px",
          left: "92px",
          gap: "25px",
          zIndex: "1",
          display: "flex",
          flexDirection: "column",
          alignItems: "flex-start",
        }}
      >
        <h1
          style={{
            color: "#EEEEEE",
            fontSize: "50px",
            fontWeight: "300", // Less bold
            lineHeight: "75px",
            textAlign: "left",
            marginTop: "-30px",
          }}
        >
          {t("login.welcome")} <br />
          <span style={{ fontWeight: "600" }}>{t("login.managementHub")}</span>
        </h1>

        <p
          style={{
            fontFamily: "Poppins",
            fontSize: "20px",
            fontWeight: "500",
            lineHeight: "36px",
            textAlign: "left",
            color: "#EEEEEE",
            marginTop: "-20px", // Adjusted to move the text up
          }}
        >
          {t("login.simplify")}
        </p>
      </div>

      {/* Login Form */}
      <div
        style={{
          display: "flex",
          flexDirection: "column",
          alignItems: "flex-start",
          gap: "24px",
          position: "absolute",
          right: "0%",
          top: "50%",
          left: "52%",
          transform: "translateY(-50%)",
          zIndex: "1",
          color: "white",
          width: "420px",
          height: "520px",
          radius: "16px",
          background: "#FFFFFF33",
          borderRadius: "24px",
          backdropFilter: "blur(10.67187px)",
          textAlign: "left",
        }}
        className="flex flex-col lg:flex-row w-8/12 sm:w-6/12 lg:w-4/12 rounded-xl mx-auto shadow-lg overflow-hidden"
      >
        <form
          onSubmit={formik.handleSubmit}
          style={{ width: "100%", height: "100%" }}
        >
          {/* Login Form Content */}
          {loading && (
            <div className="absolute inset-0 flex items-center justify-center bg-black bg-opacity-50 z-30">
              <Spinner />
            </div>
          )}
          <div style={{ color: "white" }} className="w-full py-8 px-12">
            <h2 style={{ display: "flex" }} className="text-3xl mb-4">
              <Link to="/">
                <div
                  style={{
                    background: "#05022B",
                    width: "30px",
                    height: "30px",
                    borderRadius: "8px",
                    display: "flex",
                    justifyContent: "center",
                    alignItems: "center",
                  }}
                >
                  <span
                    style={{
                      color: "white",
                    }}
                    className="text-blue-700 font-bold text-xl"
                  >
                    {t("login.A")}
                  </span>
                </div>
              </Link>
              <span className="font-bold text-xl ml-2 text-white">
                {" "}
                {t("login.LOGO")}
              </span>
            </h2>
            <h2
              style={{
                fontWeight: "800",
                fontSize: 48,
                // marginTop: "-0%",
                // margindown: "-80%",
              }}
            >
              {t("login.login")}
            </h2>
            <p style={{ font: "poppins", color: "#FFFFFFB3" }}>
              {t("login.enterDetails")}
            </p>

            {/* Conditional Input Fields */}
            {isAdmin ? (
              <>
                <div
                  className="mt-5"
                  style={{ width: "100%", borderBottom: "1px solid #FFFFFF66" }}
                >
                  <input
                    style={{
                      color: "#FFFFFF80",
                      background: "transparent",
                      border: "none",
                      outline: "none",
                      // borderBottom: "1px solid #FFFFFF66",
                      width: "100%",
                      marginBottom: "2px",
                    }}
                    type="text"
                    name="email"
                    placeholder="Email"
                    className="py-1 px-2 w-full"
                    onChange={formik.handleChange}
                    onBlur={formik.handleBlur}
                    value={formik.values.email}
                  />
                </div>
                {formik.touched.email && formik.errors.email ? (
                  <div style={{ color: "red", fontSize: "12px" }}>
                    {formik.errors.email}
                  </div>
                ) : null}
              </>
            ) : (
              <>
                <div
                  className="mt-5"
                  style={{ width: "100%", borderBottom: "1px solid #FFFFFF66" }}
                >
                  <input
                    style={{
                      color: "#FFFFFF80",
                      background: "transparent",
                      border: "none",
                      outline: "none",
                      // borderBottom: "1px solid #FFFFFF66",
                      width: "100%",
                      marginBottom: "2px",
                    }}
                    type="text"
                    name="username"
                    placeholder={t("login.placeholders.username")}
                    className="py-1 px-2 w-full"
                    onChange={formik.handleChange}
                    onBlur={formik.handleBlur}
                    value={formik.values.username}
                  />
                </div>
                {formik.touched.username && formik.errors.username ? (
                  <div style={{ color: "red", fontSize: "12px" }}>
                    {formik.errors.username}
                  </div>
                ) : null}
              </>
            )}

            {/* Password Input */}
            <div
              className="mt-5"
              style={{
                width: "100%",
                position: "relative",
                borderBottom: "1px solid #FFFFFF66",
              }}
            >
              <input
                style={{
                  color: "#FFFFFF80",
                  background: "transparent",
                  border: "none",
                  outline: "none",
                  paddingRight: "40px", // Adding right padding to accommodate the icon
                }}
                type={ishide ? "password" : "text"}
                name="password"
                placeholder={t("login.placeholders.password")}
                className="py-1 px-2 w-full"
                onChange={formik.handleChange}
                value={formik.values.password}
              />
              <img
                src={ishide ? hide : show}
                onClick={() => setIsHide(!ishide)}
                alt={ishide ? "Show Password" : "Hide Password"}
                style={{
                  position: "absolute",
                  right: "10px", // Positioning the icon on the right
                  top: "50%",
                  transform: "translateY(-50%)",
                  cursor: "pointer",
                  width: "24px",
                  height: "24px",
                }}
              />
            </div>
            {formik.touched.password && formik.errors.password ? (
              <div style={{ color: "red", fontSize: "12px" }}>
                {formik.errors.password}
              </div>
            ) : null}

            {/* Forgot Password Link */}
            <div
              style={{
                color: "#FFFFFFB2",
                fontSize: "14px",
                alignSelf: "flex-start",
                marginTop: "1rem",
                display: "flex",
                justifyContent: "flex-end",
              }}
            >
              <Link to="/forgot-password" style={{ color: "#FFFFFFB2" }}>
                {t("login.forgotPassword")}
              </Link>
            </div>

            {/* Login Button */}
            <div className="mt-5">
              <button
                style={{
                  color: "#05022B",
                  fontFamily: "Poppins",
                  fontSize: "16px",
                  fontStyle: "normal",
                  fontWeight: "700",
                  lineHeight: "normal",
                  borderRadius: "12px",
                  background: "#FFFF",
                  width: "100%",
                  marginRight: "100%",
                }}
                type="submit"
                className="w-full bg-blue-900 py-1.5 text-center text-white"
                disabled={formik.isSubmitting}
              >
                {t("login.login")}
              </button>
            </div>

            {/* Toggle Admin/Teacher */}
            <div className="mt-5">
              <button
                type="button"
                onClick={() => setIsAdmin(!isAdmin)}
                className="py-1 px-4 rounded-lg text-white"
                style={{
                  border: "2px solid #FFFFFF",
                  fontFamily: "Poppins",
                  fontSize: "16px",
                  fontStyle: "normal",
                  fontWeight: "700",
                  lineHeight: "normal",
                  borderRadius: "12px",
                  width: "100%",
                }}
              >
                {t("login.toggleButton")} {isAdmin ? "Teacher" : "Admin"}
              </button>
            </div>
            {isAdmin && (
              <div
                style={{
                  color: "#FFFFFFB2",
                  fontSize: "12px",
                  alignSelf: "flex-start",
                  marginTop: "1rem",
                  display: "flex",
                  justifyContent: "center",
                }}
              >
                <div className="text-[#FFFFFFB3] pr-1">
                  {t("login.notHaveAccount")}
                </div>
                <Link to="/signup" style={{ color: "#FFFFFF" }}>
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
