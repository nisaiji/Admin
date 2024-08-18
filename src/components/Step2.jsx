import React, { useState } from "react";
import { useFormik } from "formik";
import ArrowRight from "../assets/images/ArrowRight.png";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { faEye, faEyeSlash } from "@fortawesome/free-solid-svg-icons";

const Step2 = ({ nextStep }) => {
  const [currentStep, setCurrentStep] = useState(2);
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);

  const togglePassword = () => {
    setShowPassword(!showPassword);
  };

  const toggleConfirmPassword = () => {
    setShowConfirmPassword(!showConfirmPassword);
  };

  const formik = useFormik({
    initialValues: {
      SetPassword: "",
      ConfirmPassword: "",
    },
    validate: (values) => {
      const errors = {};
      return errors;
    },
    onSubmit: (values) => {
      nextStep();
    },
  });

  return (
    <div>
      <form className="text-black" onSubmit={formik.handleSubmit}>
        <div className="mt-5">
          <p className="text-gray-900 text-sm text-left pl-3 font-semibold">
            Set Password
          </p>
          <div className="flex">
            <input
              className="text-black rounded-lg border border-gray-300 py-1 px-5 mt-2 w-full"
              type={showPassword ? "text" : "password"}
              name="SetPassword"
              placeholder="Password"
              onChange={formik.handleChange}
              value={formik.values.SetPassword}
            />
            <span
              onClick={togglePassword}
              className="cursor-pointer -translate-x-8 mt-3 text-gray-600"
            >
              <FontAwesomeIcon icon={showPassword ? faEyeSlash : faEye} />
            </span>
          </div>
        </div>
        <div className="mt-5">
          <p className="text-gray-900 text-sm text-left pl-3 font-semibold">
            Confirm Password
          </p>
          <div className="flex">
            <input
              className="text-black rounded-lg border border-gray-300 mt-2 py-1 px-5 w-full"
              type={showConfirmPassword ? "text" : "password"}
              name="ConfirmPassword"
              placeholder="Password"
              onChange={formik.handleChange}
              value={formik.values.ConfirmPassword}
            />
            <span
              onClick={toggleConfirmPassword}
              className="cursor-pointer mt-3 -translate-x-8 text-gray-600"
            >
              <FontAwesomeIcon
                icon={showConfirmPassword ? faEyeSlash : faEye}
              />
            </span>
          </div>
        </div>
        <div className="mt-5">
          <button
            className="rounded-lg px-7 h-10 bg-[#464590] font-semibold flex items-center justify-center ml-auto text-white"
            type="submit"
            onClick={nextStep}
          >
            <div className="flex items-center gap-2">
              <p className="text-base">Finish</p>
              <img className="w-6 h-6" src={ArrowRight} alt="Arrow Right" />
            </div>
          </button>
        </div>
      </form>
    </div>
  );
};

export default Step2;
