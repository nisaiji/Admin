import React, { useState } from "react";
import Step1 from "../components/Step1";
import Step2 from "../components/Step2";
import Step3 from "../components/Step3";
import { useFormik } from "formik";
import { Link, useNavigate } from "react-router-dom";
import { Toaster, toast } from "react-hot-toast";
import { axiosClient } from "../services/axiosClient";
import { setItem, setUsername } from "../services/LocalStorageManager";
import Tick from "../assets/images/Tick.png";

function SchoolDetailSignup() {
  const [currentStep, setCurrentStep] = useState(1);
  const nextStep = () => setCurrentStep((prev) => prev + 1);
  const prevStep = () => setCurrentStep((prev) => prev - 1);

  const [isAdmin, setIsAdmin] = useState(true);
  const navigate = useNavigate();

  const [ishide, setIsHide] = useState(true);
  const formik = useFormik({
    initialValues: {
      username: "",
      password: "",
    },
    validate: (values) => {
      const errors = {};
      return errors;
    },
    onSubmit: async (values, { setSubmitting, resetForm }) => {
      try {
        let response;
        if (isAdmin) {
          response = await axiosClient.post("/admin/login", {
            adminName: values.username,
            password: values.password,
          });
          setItem(response?.result.accessToken);
          setUsername(response?.result.username);
          // console.log(response);
        } else {
          response = await axiosClient.post("/teacher/login", values);
          setItem(response?.result.accessToken);
          setUsername(response?.result.username);
        }
        toast.success(<b>Login Successfully</b>);
        resetForm();
        setTimeout(() => {
          window.location.replace("/");
        }, 2000);
      } catch (error) {
        toast.error(<b>{error}</b>);
      } finally {
        setSubmitting(false);
      }
    },
  });

  const Progress = () => {
    return (
      <div>
        <div className="bg-[#7b79ff] h-1 w-2/3 mx-auto mt-6 translate-y-6"></div>
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
            Basic Information
          </div>
          <div
            className={`text-sm text-center -translate-x-5 ${
              currentStep === 2 ? "text-[#7B79FF]" : "text-black"
            }`}
          >
            Set Password
          </div>
          <div
            className={`text-sm text-center pr-7 ${
              currentStep === 3 ? "text-[#7B79FF]" : "text-black"
            }`}
          >
            Finish
          </div>
        </div>
      </div>
    );
  };

  return (
    <>
      <div className=" min-h-screen">
        <div className="flex items-center justify-center h-full">
          <div className="bg-white rounded-2xl backdrop-blur-lg w-1/2 mx-auto flex flex-col p-12">
            <div className="text-center text-black">
              <h2 className="flex items-center justify-center gap-2 mb-4 text-3xl">
                <Link to="/">
                  <div className="bg-blue-900 w-12 h-12 flex items-center justify-center rounded-lg">
                    <span className="text-white font-bold">A</span>
                  </div>
                </Link>
                <span className="font-bold text-3xl">LOGO</span>
              </h2>
              <h2 className="font-bold text-4xl mt-[3]">Setup your Account</h2>
              <Progress />
              <div>
                {currentStep === 1 && <Step1 nextStep={nextStep} />}
                {currentStep === 2 && (
                  <Step2 nextStep={nextStep} prevStep={prevStep} />
                )}
                {currentStep === 3 && <Step3 prevStep={prevStep} />}
              </div>
            </div>
          </div>
        </div>
      </div>
    </>
  );
}

export default SchoolDetailSignup;
