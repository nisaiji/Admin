import React, { useState } from "react";
import Step1 from "../components/Step1";
import Step2 from "../components/Step2";
import Step3 from "../components/Step3";
import { Link, useNavigate } from "react-router-dom";
import { useFormik } from "formik";
import * as Yup from "yup";
import Tick from "../assets/images/Tick.png";
import { axiosClient } from "../services/axiosClient";
import EndPoints from "../services/EndPoints";
import toast, { Toaster } from "react-hot-toast";
import REGEX from "../utils/regix";
import { useTranslation } from "react-i18next";

function SchoolDetailSignup() {
  const [currentStep, setCurrentStep] = useState(1);
  const [loading, setLoading] = useState(false);
  const navigate = useNavigate();
  const [t] = useTranslation();

  const nextStep = () => {
    formik.validateForm().then((errors) => {
      if (Object.keys(errors).length === 0) {
        if (currentStep === 3) {
          formik.handleSubmit(); // Submit the form on the last step
        } else {
          setCurrentStep((prev) => prev + 1); // Move to the next step
        }
      } else {
        // There are validation errors, do not proceed
        formik.setTouched(errors); // Mark the fields as touched to show the validation errors
      }
    });
  };
  const prevStep = () => setCurrentStep((prev) => prev - 1);

  // Validation schema for each step
  const validationSchema = () => {
    switch (currentStep) {
      case 1:
        return Yup.object().shape({
          schoolName: Yup.string()
            .trim()
            .min(8, t("validationError.schoolNameLength"))
            .required(t("validationError.schoolName")),
          affiliationNo: Yup.string()
            .trim()
            .min(8, t("validationError.affiliationNumberLength"))
            .required(t("validationError.affiliationNumber")),
          email: Yup.string()
            .trim()
            .email(t("validationError.emailAddress"))
            .required(t("validationError.email")),
          phone: Yup.string()
            .required(t("validationError.phone"))
            .trim()
            .matches(REGEX.PHONE, t("validationError.phoneNumber"))
            .test(
              "starts-with-1-to-5",
              t("validationError.phoneStart"),
              (value) => (value ? REGEX.PHONE_TEST.test(value) : false)
            ),
          username: Yup.string()
            .trim()
            .min(5, t("validationError.usernameLength"))
            .required(t("validationError.username")),
        });
      case 2:
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
      case 3:
        return Yup.object().shape({
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
      default:
        return Yup.object();
    }
  };

  // Capitalizes the first letter of a string
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
      if (!formik.isValid || !formik.dirty) return;
      const data = {
        schoolName: capitalizeFirstLetter(values.schoolName).trim(),
        affiliationNo: values.affiliationNo.trim(),
        email: values.email.toLowerCase().trim(),
        phone: values.phone.trim(),
        username: capitalizeFirstLetter(values.username).trim(),
        country: capitalizeFirstLetter(values.country).trim(),
        state: capitalizeFirstLetter(values.state).trim(),
        city: capitalizeFirstLetter(values.city).trim(),
        district: capitalizeFirstLetter(values.district).trim(),
        pincode: values.pincode.trim(),
        address: capitalizeFirstLetter(values.address).trim(),
        password: values.password.trim(),
      };
      setLoading(true);
      try {
        // Send a POST request to register a new admin
        const response = await axiosClient.post(
          EndPoints.ADMIN.ADMIN_REGISTER,
          data
        );
        // If registration is successful
        if ([200, 201].includes(response?.statusCode)) {
          toast.success(response.result);
          navigate("/login");
        }
      } catch (e) {
        toast.error(e);
      } finally {
        setLoading(false);
      }
    },
  });

  const Progress = () => (
    <div>
      <div className="bg-[#7b79ff] h-1 w-[500px] mx-auto mt-6 translate-y-6"></div>
      <div className="flex justify-around mb-2">
        <div
          className={`size-12 rounded-full flex items-center justify-center z-10 ${
            currentStep === 1 ? "bg-[#7B79FF]" : "bg-[#05022B]"
          } text-white`}
        >
          {currentStep === 1 ? 1 : <img src={Tick} alt="Tick" />}
        </div>
        <div
          className={`size-12 rounded-full flex items-center justify-center z-10 ${
            currentStep === 2 ? "bg-[#7B79FF]" : "bg-[#05022B]"
          } text-white`}
        >
          {currentStep <= 2 ? 2 : <img src={Tick} alt="Tick" />}
        </div>
        <div
          className={`size-12 rounded-full flex items-center justify-center z-10 ${
            currentStep === 3 ? "bg-[#7B79FF]" : "bg-[#05022B]"
          } text-white`}
        >
          3
        </div>
      </div>
      <div className="flex justify-around">
        <div
          className={`text-sm text-center font-semibold ${
            currentStep === 1 ? "text-[#7B79FF]" : "text-black"
          }`}
        >
          {t("register.basicInfo")}
        </div>
        <div
          className={`text-sm text-center -translate-x-5 ${
            currentStep === 2 ? "text-[#7B79FF]" : "text-black"
          }`}
        >
          {t("register.addressInfo")}
        </div>
        <div
          className={`text-sm text-center  ${
            currentStep === 3 ? "text-[#7B79FF]" : "text-black"
          }`}
        >
          {t("register.setPassword")}
        </div>
      </div>
    </div>
  );

  return (
    <>
      <div className="min-h-screen">
        <Toaster position="top-center" reverseOrder={false} />
        <div className="flex items-center justify-center h-full">
          <div className="bg-white rounded-2xl backdrop-blur-lg w-[700px] mx-auto flex flex-col py-12">
            <div className="text-center text-black">
              <h2 className="flex items-center justify-center gap-2 mb-4 text-3xl">
                <Link to="/">
                  <div className="bg-blue-900 w-12 h-12 flex items-center justify-center rounded-lg">
                    <span className="text-white font-bold">A</span>
                  </div>
                </Link>
                <span className="font-bold text-3xl">LOGO</span>
              </h2>
              <h2 className="font-bold text-4xl mt-3">
                {t("register.setupAccount")}
              </h2>
              <Progress />
              <div className="px-20">
                {currentStep === 1 && (
                  <Step1 formik={formik} nextStep={nextStep} />
                )}
                {currentStep === 2 && (
                  <Step2
                    formik={formik}
                    prevStep={prevStep}
                    nextStep={nextStep}
                  />
                )}
                {currentStep === 3 && (
                  <Step3
                    formik={formik}
                    prevStep={prevStep}
                    onSubmit={formik.handleSubmit}
                    loading={loading}
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
