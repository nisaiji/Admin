import React, { useEffect, useState } from "react";
import Step1 from "./Step1";
import Step2 from "./Step2";
// import Step3 from "./Step3";
// import Step4 from "./Step4";
// import Step5 from "./Step5";
import Step6 from "./Step6";
import { Link, useLocation, useNavigate } from "react-router-dom";
import * as Yup from "yup";
import Tick from "../assets/images/Tick.png";
import logo from "../assets/images/deer logo.png";
import { axiosClient } from "../services/axiosClient";
import EndPoints from "../services/EndPoints";
import toast, { Toaster } from "react-hot-toast";
import { useTranslation } from "react-i18next";
import Spinner from "../components/Spinner";
import { setAuthData } from "../store/AppAuthSlice";
import { useDispatch } from "react-redux";

function Register() {
  const navigate = useNavigate();
  const dispatch = useDispatch();
  const location = useLocation();
  const [loading, setLoading] = useState(false);
  const [toastDisplayed, setToastDisplayed] = useState(false);
  const [currentStep, setCurrentStep] = useState(
    Number(localStorage.getItem("page")) || 1
  );
  const [t] = useTranslation();

  const goBack = () => {
    localStorage.clear();
    navigate("/login");
  };

  const setStep = (step) => {
    setCurrentStep(step);
    localStorage.setItem("page", step);
  };

  const getadmin = async (shouldCheckProgress = false) => {
    try {
      if (toastDisplayed) return;
      setToastDisplayed(true);
      setTimeout(() => setToastDisplayed(false), 3000);
      setLoading(true);
      const res = await axiosClient.get(EndPoints.ADMIN.GET_ADMIN);

      if (res?.statusCode === 200) {
        const data = res?.result;

        if (shouldCheckProgress) {
          if (data?.isActive) {
            localStorage.setItem(
              "access_token",
              localStorage.getItem("temp_access_token")
            );
            localStorage.removeItem("temp_access_token");
            toast.success("Registration process completed.");
            localStorage.removeItem("page");
            dispatch(setAuthData(localStorage.getItem("access_token")));
            setTimeout(() => {
              navigate("/");
            }, 1500);
          } else {
            toast.error(
              "Registerations already in progress - please wait for some time"
            );
          }
        }
      }
    } catch (e) {
      console.error("Error fetching admin data:", e);
    } finally {
      setLoading(false);
    }
  };

  const Progress = () => (
    <div>
      <div className="bg-backgroundOrange1 h-1 w-[700px] mx-auto mt-6 translate-y-6" />
      <div className="flex justify-around mb-2">
        <div
          className={`size-12 rounded-full flex items-center justify-center z-10 ${
            currentStep === 1
              ? "bg-backgroundOrange1 text-textPrimary"
              : "bg-whiteBackground text-textBlack"
          }`}
        >
          {currentStep === 1 ? 1 : <img src={Tick} alt="Tick" />}
        </div>
        <div
          className={`size-12 rounded-full flex items-center justify-center z-10 ${
            currentStep === 2
              ? "bg-backgroundOrange1 text-textPrimary"
              : "bg-whiteBackground text-textBlack"
          }`}
        >
          {currentStep <= 2 ? 2 : <img src={Tick} alt="Tick" />}
        </div>
        <div
          className={`size-12 rounded-full flex items-center justify-center z-10 ${
            currentStep === 3
              ? "bg-backgroundOrange1 text-textPrimary"
              : "bg-whiteBackground text-textBlack"
          }`}
        >
          {currentStep <= 3 ? 3 : <img src={Tick} alt="Tick" />}
        </div>
        <div
          className={`size-12 rounded-full flex items-center justify-center z-10 ${
            currentStep === 4
              ? "bg-backgroundOrange1 text-textPrimary"
              : "bg-whiteBackground text-textBlack"
          }`}
        >
          {currentStep <= 4 ? 4 : <img src={Tick} alt="Tick" />}
        </div>
        <div
          className={`size-12 rounded-full flex items-center justify-center z-10 ${
            currentStep === 5
              ? "bg-backgroundOrange1 text-textPrimary"
              : "bg-whiteBackground text-textBlack"
          }`}
        >
          {currentStep <= 5 ? 5 : <img src={Tick} alt="Tick" />}
        </div>
        <div
          className={`size-12 rounded-full flex items-center justify-center z-10 ${
            currentStep === 6
              ? "bg-backgroundOrange1 text-textPrimary"
              : "bg-whiteBackground text-textBlack"
          }`}
        >
          6
        </div>
      </div>
      <div className="flex">
        <div
          className={`text-sm w-1/4 text-center font-semibold ${
            currentStep === 1 ? "text-backgroundOrange1" : "text-textPrimary"
          }`}
        >
          Phone Verification
        </div>
        {currentStep > 1 && (
          <div
            className={`text-sm w-1/4 text-center font-semibold ${
              currentStep === 2 ? "text-textOrange" : "text-textPrimary"
            }`}
          >
            Email Verification
          </div>
        )}
        {currentStep > 2 && (
          <div
            className={`text-sm w-1/4 text-center font-semibold ${
              currentStep === 3 ? "text-textOrange" : "text-textPrimary"
            }`}
          >
            Password Update
          </div>
        )}
        {currentStep > 3 && (
          <div
            className={`text-sm w-1/4 text-center font-semibold ${
              currentStep === 4 ? "text-textOrange" : "text-textPrimary"
            }`}
          >
            {t("register.basicInfo")}
          </div>
        )}
        {currentStep > 4 && (
          <div
            className={`text-sm w-1/4 text-center font-semibold ${
              currentStep === 5 ? "text-textOrange" : "text-textPrimary"
            }`}
          >
            {t("register.addressInfo")}
          </div>
        )}

        {currentStep > 5 && (
          <div
            className={`text-sm w-1/4 text-center font-semibold ${
              currentStep === 6 ? "text-textOrange" : "text-textPrimary"
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
      <div className="h-screen bg-background2">
        {loading && (
          <div className="fixed inset-0 flex items-center justify-center bg-[#93a3b6] bg-opacity-50 z-30">
            <Spinner />
          </div>
        )}
        <Toaster position="top-center" reverseOrder={false} />
        <div className="flex items-center justify-center h-full w-full">
          <div className="bg-gradient-to-t from-fromColor1 to-toColor1 rounded-2xl backdrop-blur-lg w-[800px] mx-auto flex flex-col py-6">
            <div className="text-center text-black">
              <h2 className="flex items-center justify-center gap-2 mb-4 text-3xl">
                <Link to="/" className="flex items-center">
                  <img src={logo} alt="logo" className="size-10" />
                </Link>
              </h2>

              <h2 className="font-bold text-2xl mt-3 text-textPrimary">
                {t("register.setupAccount")}
              </h2>
              <Progress />
              <div className="px-20">
                {currentStep === 1 && (
                  <Step1 goback={goBack} setStep={(step) => setStep(step)} />
                )}
                {currentStep === 2 && (
                  <Step2 goback={goBack} setStep={(step) => setStep(step)} />
                )}
                {currentStep === 3 && (
                  <Step3 goback={goBack} setStep={(step) => setStep(step)} />
                )}
                {currentStep === 6 && (
                  <Step6
                    checkProgress={() => {
                      getadmin(true);
                    }}
                    isDisable={toastDisplayed}
                    goback={goBack}
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

export default Register;
