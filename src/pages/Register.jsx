import React, { useCallback, useEffect, useMemo, useState } from "react";
import Step1 from "./Step1";
import Step2 from "./Step2";
import Step3 from "./Step3";
import Step4 from "./Step4";
import Step5 from "./Step5";
import Step6 from "./Step6";
import { Link, useLocation, useNavigate } from "react-router-dom";
import Tick from "../assets/images/Tick.png";
import logo from "../assets/images/deer logo.png";
import { axiosClient } from "../services/axiosClient";
import EndPoints from "../services/EndPoints";
import toast, { Toaster } from "react-hot-toast";
import { useTranslation } from "react-i18next";
import Spinner from "../components/Spinner";
import { setAuthData } from "../store/AppAuthSlice";
import { useDispatch } from "react-redux";
import { generateToken } from "../notifications/firebaseConfig";

function Register() {
  const navigate = useNavigate();
  const dispatch = useDispatch();
  const [loading, setLoading] = useState(false);
  const [toastDisplayed, setToastDisplayed] = useState(false);
  const [currentStep, setCurrentStep] = useState(
    Number(localStorage.getItem("page")) || 1
  );
  const [t] = useTranslation();

  const goBack = useCallback(() => {
    localStorage.clear();
    navigate("/login");
  }, [navigate]);

  const setStep = useCallback((step) => {
    setCurrentStep(step);
    localStorage.setItem("page", step);
  }, []);

  const getadmin = useCallback(
    async (shouldCheckProgress = false) => {
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
              const fcmToken = await generateToken();
              const result = await axiosClient.put(
                EndPoints.ADMIN.UPDATE_FCM_TOKEN,
                {
                  fcmToken,
                }
              );
              // console.log({ result });
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
        // console.error("Error fetching admin data:", e);
      } finally {
        setLoading(false);
      }
    },
    [dispatch, navigate, toastDisplayed]
  );

  const steps = [1, 2, 3, 4, 5, 6];
  const labels = [
    "Verify Phone",
    "Verify Email",
    "Update Password",
    t("register.basicInfo"),
    t("register.addressInfo"),
    t("register.finish"),
  ];

  const Progress = useMemo(
    () => (
      <div>
        <div className="bg-backgroundOrange1 h-1 w-[850px] mx-auto mt-6 translate-y-6" />
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
                className={`text-sm w-1/6 text-center font-medium ${
                  currentStep === i + 1 ? "text-textOrange" : "text-textGray1"
                }`}
              >
                {label}
              </div>
            ) : (
              <div key={i} className="w-1/6" />
            )
          )}
        </div>
      </div>
    ),
    [currentStep, t]
  );

  const stepComponents = [
    <Step1
      goback={goBack}
      setStep={setStep}
      setLoading={(bool) => setLoading(bool)}
      currentStep={currentStep}
    />,
    <Step2
      goback={goBack}
      setStep={setStep}
      setLoading={(bool) => setLoading(bool)}
      currentStep={currentStep}
    />,
    <Step3
      goback={goBack}
      setStep={setStep}
      setLoading={(bool) => setLoading(bool)}
    />,
    <Step4
      goback={goBack}
      setStep={setStep}
      setLoading={(bool) => setLoading(bool)}
    />,
    <Step5
      goback={goBack}
      setStep={setStep}
      setLoading={(bool) => setLoading(bool)}
    />,
    <Step6
      checkProgress={() => getadmin(true)}
      isDisable={toastDisplayed}
      goback={goBack}
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
              <h2 className="font-bold text-2xl mt-3 text-textPrimary">
                {t("register.setupAccount")}
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

export default Register;
