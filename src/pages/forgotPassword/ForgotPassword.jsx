import React, { useCallback, useMemo, useState } from "react";
import Spinner from "../../components/Spinner";
import { useTranslation } from "react-i18next";
import { Toaster } from "react-hot-toast";
import Tick from "../../assets/images/Tick.png";
import Step1 from "./Step1";
import Step2 from "./Step2";
import Step3 from "./Step3";
import { useNavigate } from "react-router-dom";
import logo from "../../assets/images/deer logo.png";

export default function ForgotPassword() {
  const navigate = useNavigate();
  const [t] = useTranslation();
  const [loading, setLoading] = useState(false);
  const [currentStep, setCurrentStep] = useState(
    Number(localStorage.getItem("forgotpage")) || 1
  );
  const steps = [1, 2, 3];
  const labels = ["Verify Phone", "Verify Email", "Update Password"];

  /**
   * Handles navigation back to the login page and clears local storage.
   */
  const goBack = useCallback(() => {
    localStorage.clear();
    navigate("/login");
  }, [navigate]);

  /**
   * Sets the current registration step and persists it in local storage.
   * @param {number} step - The step number to set as current.
   */
  const setStep = useCallback((step) => {
    setCurrentStep(step);
    localStorage.setItem("forgotpage", step);
  }, []);

  /**
   * Renders the progress bar and step labels.
   */
  const Progress = useMemo(
    () => (
      <div>
        <div className="bg-backgroundOrange1 h-1 w-[700px] mx-auto mt-6 translate-y-6" />
        <div className="flex justify-around mb-2">
          {steps.map((step, i) => (
            <div
              key={step}
              className={`size-12 rounded-full flex items-center justify-center z-10 ${
                currentStep === step
                  ? "bg-backgroundOrange1 text-textPrimary"
                  : "bg-whiteBackground text-textBlack"
              }`}
            >
              {currentStep <= step ? (
                step
              ) : (
                <img src={Tick} alt="Tick" className="size-6" />
              )}
            </div>
          ))}
        </div>
        <div className="flex">
          {labels.map((label, i) =>
            currentStep >= i + 1 ? (
              <div
                key={i}
                className={`text-sm w-1/3 text-center font-medium ${
                  currentStep === i + 1 ? "text-textOrange" : "text-textGray1"
                }`}
              >
                {label}
              </div>
            ) : (
              <div key={i} className="w-1/3" />
            )
          )}
        </div>
      </div>
    ),
    [currentStep, t]
  );

  // Array of step components, each representing a registration step
  const stepComponents = [
    <Step1
      goback={goBack}
      setStep={setStep}
      loading={loading}
      setLoading={(bool) => setLoading(bool)}
      currentStep={currentStep}
    />,
    <Step2
      goback={goBack}
      setStep={setStep}
      loading={loading}
      setLoading={(bool) => setLoading(bool)}
      currentStep={currentStep}
    />,
    <Step3
      goback={goBack}
      setStep={setStep}
      loading={loading}
      setLoading={(bool) => setLoading(bool)}
    />,
  ];

  return (
    <>
      {/* <div id="otp_input_container"></div> */}
      <div className="min-h-screen h-svh bg-background2">
        {loading && (
          <div className="fixed inset-0 flex items-center justify-center bg-background3 bg-opacity-50 z-30">
            <Spinner />
          </div>
        )}
        <Toaster position="top-center" reverseOrder={false} />
        <div className="flex items-center justify-center h-full w-full">
          <div className="bg-gradient-to-t from-fromColor1 to-toColor1 rounded-2xl backdrop-blur-lg w-[1000px] mx-auto my-3 flex flex-col py-6">
            <div className="text-center text-black">
              <div className="flex justify-center">
                <img
                  src={logo}
                  className="size-[60px] object-contain"
                  alt="img"
                />
              </div>
              <h2 className="font-bold text-2xl mt-3 text-textPrimary">
                Forgot Password
              </h2>
              {Progress}
              <div className="px-20">{stepComponents[currentStep - 1]}</div>
            </div>
          </div>
        </div>
      </div>
    </>
  );
}
