import { useFormik } from "formik";
import { Link, useNavigate } from "react-router-dom";
import { Toaster, toast } from "react-hot-toast";
import { axiosClient } from "../services/axiosClient";
import hide from "../assets/images/hide.png";
import show from "../assets/images/show.png";
import { useState, useMemo } from "react";
import * as Yup from "yup";
import EndPoints from "../services/EndPoints";
import { useTranslation } from "react-i18next";
import REGEX from "../utils/regix";
import Background from "../assets/images/Background.png";

function Signup() {
  const [ishide, setIsHide] = useState(true);
  const [loading, setLoading] = useState(false);
  const navigate = useNavigate();
  const [t] = useTranslation();

  // Memoized validation schema using Yup to validate form fields
  const validationSchema = useMemo(
    () =>
      Yup.object({
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
            (value) => (value ? REGEX.PHONE_TEST.test(value) : false)
          ),
        username: Yup.string().required(t("validationError.username")),
        password: Yup.string()
          .min(8, t("validationError.passwordLength"))
          .required(t("validationError.password")),
      }),
    [t]
  );

  // Setup formik for handling form submission, validation, and field management
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
    validationSchema, // Validation schema to validate form inputs
    validateOnChange: false,
    validateOnBlur: true,
    onSubmit: async (values, { resetForm }) => {
      if (!formik.isValid || !formik.dirty) return;

      setLoading(true);
      try {
        // Send a POST request to register a new admin
        const response = await axiosClient.post(
          EndPoints.ADMIN.ADMIN_REGISTER,
          values
        );
        // If registration is successful
        if ([200, 201].includes(response?.statusCode)) {
          toast.success(response.result);
          resetForm();
          navigate("/login");
        }
      } catch (e) {
        toast.error(e);
      } finally {
        setLoading(false);
      }
    },
  });

  // Reusable function to render input fields for form
  const renderInput = (name, type = "text", placeholder) => (
    <div className="mt-5">
      <input
        type={type}
        name={name}
        placeholder={placeholder}
        className="border border-gray-400 py-1 px-2 w-full"
        onChange={formik.handleChange}
        onBlur={formik.handleBlur}
        value={formik.values[name]}
      />
      {formik.touched[name] && formik.errors[name] && (
        <div className="text-red-600 text-sm">{formik.errors[name]}</div>
      )}
    </div>
  );

  return (
    <div
      className="min-h-screen py-20"
      style={{
        backgroundImage:
          "linear-gradient(115deg, #000428, #00F0FF, #004E92, #065DA8)",
      }}
    >
      {/* Toast notification container */}
      <Toaster position="top-center" reverseOrder={false} />
      <div className="container mx-auto">
        <div className="flex flex-col lg:flex-row w-10/12 lg:w-9/12 bg-white rounded-xl mx-auto shadow-lg overflow-hidden">
          {/* Left section with background image and welcoming text */}
          <div
            className="w-full lg:w-2/5 flex flex-col items-center justify-center p-4 bg-no-repeat bg-cover bg-center"
            style={{ backgroundImage: `url(${Background})` }}
          >
            <h1 className="text-white text-3xl mb-3 text-center">
              {t("register.welcome")}
            </h1>
            <p className="text-white text-center">
              {t("register.description")}
            </p>
          </div>
          {/* Right section with the signup form */}
          <div className="w-full lg:w-3/5 py-16 px-12">
            <h2 className="text-3xl mb-4 text-center">
              {t("register.adminRegister")}
            </h2>
            <form onSubmit={formik.handleSubmit}>
              {renderInput("schoolName", "text", t("placeholders.schoolName"))}
              {renderInput(
                "affiliationNo",
                "text",
                t("placeholders.affiliationNo")
              )}
              {renderInput("address", "text", t("placeholders.address"))}
              {renderInput("email", "email", t("placeholders.emailAddress"))}
              {renderInput("phone", "text", t("placeholders.phone"))}
              {renderInput("username", "text", t("placeholders.adminName"))}

              {/* Password input with visibility toggle */}
              <div className="mt-5 border border-gray-400 flex items-center">
                <input
                  type={ishide ? "password" : "text"}
                  name="password"
                  placeholder={t("placeholders.password")}
                  className="py-1 px-2 w-full border-none focus:outline-none"
                  onChange={formik.handleChange}
                  onBlur={formik.handleBlur}
                  value={formik.values.password}
                />
                <img
                  src={ishide ? show : hide}
                  onClick={() => setIsHide(!ishide)}
                  alt="toggle password visibility"
                  className="size-5 relative right-3 cursor-pointer"
                  style={{
                    filter:
                      "invert(41%) sepia(0%) saturate(0%) hue-rotate(180deg) brightness(90%) contrast(85%)",
                  }}
                />
              </div>
              {/* Show password validation error if present */}
              {formik.touched.password && formik.errors.password && (
                <div className="text-red-600 text-sm">
                  {formik.errors.password}
                </div>
              )}

              {/* Submit button for form */}
              <button
                type="submit"
                className="w-full bg-blue-900 py-3 text-white mt-5"
                disabled={loading}
              >
                {loading ? t("register.submitting") : t("register.registerNow")}
              </button>
            </form>

            {/* Link to login page for existing users */}
            <div className="text-right mt-2 text-sm">
              {t("register.haveAccount")}
              <Link to="/login" className="text-blue-950 font-semibold">
                {t("login.login")}
              </Link>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

export default Signup;
