import React, { useState } from "react";
import hide from "../assets/images/darkmode/hide.png";
import show from "../assets/images/darkmode/show.png";
import { useTranslation } from "react-i18next";
import { axiosClient } from "../services/axiosClient";
import EndPoints from "../services/EndPoints";
import toast from "react-hot-toast";
import { useDispatch } from "react-redux";
import { setAuth } from "../store/AppAuthSlice";

const Step3 = ({ goback, setStep }) => {
  const dispatch = useDispatch();
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [errors, setErrors] = useState({});

  const togglePasswordVisibility = () => setShowPassword(!showPassword);
  const toggleConfirmPasswordVisibility = () =>
    setShowConfirmPassword(!showConfirmPassword);

  const [t] = useTranslation();

  const validate = () => {
    const newErrors = {};

    if (!password.trim()) {
      newErrors.password = t("validationError.password");
    } else if (password.trim().length < 8) {
      newErrors.password = t("validationError.passwordLength");
    }

    if (!confirmPassword.trim()) {
      newErrors.confirmPassword = t("validationError.confirmPassword");
    } else if (confirmPassword.trim() !== password.trim()) {
      newErrors.confirmPassword = t("validationError.passwordMatch");
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!validate()) return;

    try {
      // Replace with your actual API call
      const res = await axiosClient.put(EndPoints.ADMIN.PASSWORD_UPDATE, {
        password,
      });
      if (res.statusCode === 200) {
        toast.success(res?.result);
        dispatch(setAuth({ passwordUpdated: true }));
        setStep(4);
      }
    } catch (e) {
      toast.error(e);
    }
  };

  return (
    <form onSubmit={handleSubmit}>
      <div className="">
        {/* Password Field */}
        <div className="mt-5 relative w-full">
          <p className="text-textPrimary text-sm text-left p-1 font-semibold">
            {t("labels.password")}
          </p>
          <input
            className="text-textPrimary rounded-lg border border-borderGray2 bg-backgroundGray15 py-2 px-5 mt-2 w-full"
            type={showPassword ? "text" : "password"}
            name="password"
            placeholder={t("placeholders.password")}
            value={password}
            onChange={(e) => setPassword(e.target.value)}
          />
          <img
            src={showPassword ? hide : show}
            alt="Toggle Password Visibility"
            className="absolute right-3 bottom-2 cursor-pointer size-6 object-contain"
            onClick={togglePasswordVisibility}
          />
          {errors.password && (
            <div className="text-textRed text-sm text-left p-1">
              {errors.password}
            </div>
          )}
        </div>

        {/* Confirm Password Field */}
        <div className="mt-5 relative w-full">
          <p className="text-textPrimary text-sm text-left p-1 font-semibold">
            {t("labels.confirmPassword")}
          </p>
          <input
            className="text-textPrimary rounded-lg border border-borderGray2 bg-backgroundGray15 py-2 px-5 mt-2 w-full"
            type={showConfirmPassword ? "text" : "password"}
            name="confirmPassword"
            placeholder={t("placeholders.confirmPassword")}
            value={confirmPassword}
            onChange={(e) => setConfirmPassword(e.target.value)}
          />
          <img
            src={showConfirmPassword ? hide : show}
            alt="Toggle Confirm Password Visibility"
            className="absolute right-3 bottom-2 cursor-pointer size-6 object-contain"
            onClick={toggleConfirmPasswordVisibility}
          />
          {errors.confirmPassword && (
            <div className="text-textRed text-sm text-left p-1">
              {errors.confirmPassword}
            </div>
          )}
        </div>
      </div>

      <div className="flex justify-between w-full mt-5">
        <button
          type="button"
          className="rounded-lg px-4 h-8 bg-backgroundBlue font-medium flex items-center justify-center text-white transition-all duration-200 ease-in-out active:scale-90"
          data-testid="back"
          onClick={goback}
        >
          <p className="text-base">{t("buttons.back")}</p>
        </button>
        <button
          type="submit"
          className="rounded-lg px-4 h-8 bg-backgroundBlue font-medium flex items-center justify-center text-white transition-all duration-200 ease-in-out active:scale-90"
          data-testid="submitPage3"
        >
          <div className="flex items-center gap-2">
            <p className="text-base">{t("buttons.submit")}</p>
          </div>
        </button>
      </div>
    </form>
  );
};

export default Step3;
