import React, { useEffect, useState } from "react";
import Step1 from "../components/Step1";
import Step2 from "../components/Step2";
import Step3 from "../components/Step3";
import { Link, useLocation, useNavigate } from "react-router-dom";
import { useFormik } from "formik";
import * as Yup from "yup";
import Tick from "../assets/images/Tick.png";
import logo from "../assets/images/deer logo.png";
import { axiosClient } from "../services/axiosClient";
import EndPoints from "../services/EndPoints";
import toast, { Toaster } from "react-hot-toast";
import REGEX from "../utils/regix";
import { useTranslation } from "react-i18next";
import Step4 from "../components/Step4";
import Spinner from "../components/Spinner";

/**
 * SchoolDetailSignup Component
 *
 * A multi-step form for school registration that includes validation, API calls,
 * and progress tracking. The form consists of 4 steps:
 * 1. Basic Information (school name, email, phone, password)
 * 2. Address Details (country, state, city, district, pincode, address)
 * 3. Account Details (affiliation number, username)
 * 4. Completion (registration finalization)
 *
 * Dependencies:
 * - React, React Router, Formik, Yup for form management and validation
 * - react-hot-toast for notifications
 * - axiosClient for API requests
 * - i18next for translations
 */

function SchoolDetailSignup() {
  const navigate = useNavigate();
  const location = useLocation();
  const [progressChecking, setProgressChecking] = useState(false);
  const [loading, setLoading] = useState(false);
  const [currentStep, setCurrentStep] = useState(
    Number(localStorage.getItem("page")) || 1
  );
  const [t] = useTranslation();

  /**
   * Fetches admin data to verify registration progress.
   */
  const getadmin = async () => {
    try {
      setLoading(true);
      const res = await axiosClient.get(EndPoints.ADMIN.GET_ADMIN);

      if (res?.statusCode === 200) {
        const data = res?.result;

        if (progressChecking) {
          if (data?.isActive) {
            localStorage.setItem(
              "access_token",
              localStorage.getItem("temp_access_token")
            );
            localStorage.removeItem("temp_access_token");
            toast.success("Registration process completed.");
            localStorage.removeItem("page");
            setTimeout(() => {
              navigate("/");
            }, 1500);
          } else {
            toast.error(
              "Registerations already in progress - please wait for some time"
            );
          }
          setProgressChecking(false);
        }
      }
    } catch (e) {
      // console.error("Error fetching admin data:", e);
    } finally {
      setLoading(false);
    }
  };

  /**
   * Returns validation schema based on the current step of the form.
   */
  const validationSchema = () => {
    switch (currentStep) {
      case 1: // Validation for Step 1 (Basic Info)
        return Yup.object().shape({
          schoolName: Yup.string()
            .trim()
            .min(8, t("validationError.schoolNameLength"))
            .required(t("validationError.schoolName")),
          phone: Yup.string()
            .required(t("validationError.phone"))
            .trim()
            .matches(REGEX.PHONE, t("validationError.phoneNumber"))
            .test(
              "starts-with-1-to-5",
              t("validationError.phoneStart"),
              (value) => (value ? REGEX.PHONE_TEST.test(value) : false)
            ),
          email: Yup.string()
            .trim()
            .email(t("validationError.emailAddress"))
            .required(t("validationError.email")),
          password: Yup.string()
            .trim()
            .min(8, t("validationError.passwordLength"))
            .required(t("validationError.password")),
          confirmPassword: Yup.string()
            .trim()
            .oneOf(
              [Yup.ref("password"), null],
              t("validationError.passwordMatch")
            )
            .required(t("validationError.confirmPassword")),
        });
      case 2: // Validation for Step 2 (Address Info)
        return Yup.object().shape({
          country: Yup.string().trim().required(t("validationError.country")),
          state: Yup.string().trim().required(t("validationError.state")),
          city: Yup.string().trim().required(t("validationError.city")),
          district: Yup.string().trim().required(t("validationError.district")),
          pincode: Yup.string()
            .trim()
            .matches(REGEX.PINCODE, t("validationError.pincodeDigit"))
            .required(t("validationError.pincode")),
          address: Yup.string().trim().required(t("validationError.address")),
        });
      case 3: // Validation for Step 3 (Account Details)
        return Yup.object().shape({
          affiliationNo: Yup.string()
            .trim()
            .min(8, t("validationError.affiliationNumberLength"))
            .required(t("validationError.affiliationNumber")),
          username: Yup.string()
            .trim()
            .min(5, t("validationError.usernameLength"))
            .required(t("validationError.username")),
        });
      default:
        return Yup.object();
    }
  };

  /**
   * Capitalizes the first letter of a given string.
   *
   * @param {string} string - The input string.
   * @returns {string} - The capitalized string.
   */
  const capitalizeFirstLetter = (string) => {
    if (!string) return string;
    return string.charAt(0).toUpperCase() + string.slice(1).toLowerCase();
  };

  // Formik instance
  const formik = useFormik({
    initialValues: {
      schoolName: "",
      affiliationNo: "",
      email: "",
      phone: "",
      username: "",
      country: "",
      state: "",
      city: "",
      district: "",
      pincode: "",
      address: "",
      password: "",
      confirmPassword: "",
    },
    validationSchema,
    onSubmit: async (values) => {
      try {
        setLoading(true);
        if (currentStep === 1) {
          const data = {
            schoolName: capitalizeFirstLetter(values.schoolName).trim(),
            email: values.email.toLowerCase().trim(),
            phone: values.phone.trim(),
            password: values.password.trim(),
          };
          const res = await axiosClient.post(
            EndPoints.ADMIN.ADMIN_REGISTER,
            data
          );
          if ([200, 201].includes(res?.statusCode)) {
            localStorage.setItem("refresh_token", res?.result?.refreshToken);
            localStorage.setItem("temp_access_token", res?.result?.accessToken);
            toast.success(res?.result?.msg);
            setCurrentStep((prev) => prev + 1);
            localStorage.setItem("page", 2);
          }
        } else if (currentStep === 2) {
          const data = {
            country: capitalizeFirstLetter(values.country).trim(),
            state: capitalizeFirstLetter(values.state).trim(),
            city: capitalizeFirstLetter(values.city).trim(),
            district: capitalizeFirstLetter(values.district).trim(),
            pincode: values.pincode.trim(),
            address: capitalizeFirstLetter(values.address).trim(),
          };
          const res = await axiosClient.put(
            EndPoints.ADMIN.ADMIN_UPDATE_ADDRESS,
            data
          );
          // console.log({res});

          if (res?.statusCode === 200) {
            toast.success(res?.result);
            setCurrentStep((prev) => prev + 1);
            localStorage.setItem("page", 3);
          }
        } else if (currentStep === 3) {
          const data = {
            affiliationNo: values.affiliationNo.trim(),
            username: capitalizeFirstLetter(values.username).trim(),
          };
          const res = await axiosClient.put(
            EndPoints.ADMIN.ADMIN_UPDATE_DETAILS,
            data
          );
          if (res?.statusCode === 200) {
            toast.success(res?.result);
            setCurrentStep((prev) => prev + 1);
            localStorage.setItem("page", 4);
          }
        }
      } catch (e) {
        toast.error(e);
      } finally {
        setLoading(false);
      }
    },
  });

  /**
   * Renders the progress bar and step indicators.
   */
  const Progress = () => (
    <div>
      <div className="bg-[#0F4189] h-1 w-[500px] mx-auto mt-6 translate-y-6"></div>
      <div className="flex justify-around mb-2">
        <div
          className={`size-12 rounded-full flex items-center justify-center z-10 ${
            currentStep === 1 ? "bg-[#0F4189]" : "bg-[#05022B]"
          } text-white`}
        >
          {currentStep === 1 ? 1 : <img src={Tick} alt="Tick" />}
        </div>
        <div
          className={`size-12 rounded-full flex items-center justify-center z-10 ${
            currentStep === 2 ? "bg-[#0F4189]" : "bg-[#05022B]"
          } text-white`}
        >
          {currentStep <= 2 ? 2 : <img src={Tick} alt="Tick" />}
        </div>
        <div
          className={`size-12 rounded-full flex items-center justify-center z-10 ${
            currentStep === 3 ? "bg-[#0F4189]" : "bg-[#05022B]"
          } text-white`}
        >
          {currentStep <= 3 ? 3 : <img src={Tick} alt="Tick" />}
        </div>
        <div
          className={`size-12 rounded-full flex items-center justify-center z-10 ${
            currentStep === 4 ? "bg-[#0F4189]" : "bg-[#05022B]"
          } text-white`}
        >
          4
        </div>
      </div>
      <div className="flex">
        <div
          className={`text-sm w-1/4 text-center font-semibold ${
            currentStep === 1 ? "text-[#0F4189]" : "text-black"
          }`}
        >
          {t("register.basicInfo")}
        </div>
        {currentStep > 1 && (
          <div
            className={`text-sm w-1/4 text-center font-semibold ${
              currentStep === 2 ? "text-[#0F4189]" : "text-black"
            }`}
          >
            {t("register.addressInfo")}
          </div>
        )}
        {currentStep > 2 && (
          <div
            className={`text-sm w-1/4 text-center font-semibold ${
              currentStep === 3 ? "text-[#0F4189]" : "text-black"
            }`}
          >
            {t("register.accountDetails")}
          </div>
        )}
        {currentStep > 3 && (
          <div
            className={`text-sm w-1/4 text-center font-semibold ${
              currentStep === 4 ? "text-[#0F4189]" : "text-black"
            }`}
          >
            {t("register.finish")}
          </div>
        )}
      </div>
    </div>
  );

  return (
    <>
      <div className="min-h-screen">
        {loading && (
          <div className="fixed inset-0 flex items-center justify-center bg-[#93a3b6] bg-opacity-50 z-30">
            <Spinner />
          </div>
        )}
        <Toaster position="top-center" reverseOrder={false} />
        <div className="flex items-center justify-center h-full">
          <div className="bg-white rounded-2xl backdrop-blur-lg w-[700px] mx-auto flex flex-col py-6">
            <div className="text-center text-black">
              <h2 className="flex items-center justify-center gap-2 mb-4 text-3xl">
                <Link to="/" className="flex items-center">
                  <img src={logo} alt="logo" className="size-10" />
                </Link>
              </h2>

              <h2 className="font-bold text-2xl mt-3 text-[#0F4189]">
                {t("register.setupAccount")}
              </h2>
              <Progress />
              <div className="px-20">
                {currentStep === 1 && <Step1 formik={formik} />}
                {currentStep === 2 && <Step2 formik={formik} />}
                {currentStep === 3 && <Step3 formik={formik} />}
                {currentStep === 4 && (
                  <Step4
                    checkProgress={() => {
                      setProgressChecking(true);
                      getadmin();
                    }}
                  />
                )}
              </div>
            </div>
          </div>
        </div>
      </div>
    </>
  );
}

export default SchoolDetailSignup;
