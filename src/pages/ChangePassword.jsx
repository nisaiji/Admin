import React, { useEffect, useRef, useState } from "react";
import Spinner from "../components/Spinner";
import toast, { Toaster } from "react-hot-toast";
import { useTranslation } from "react-i18next";
import { useDispatch, useSelector } from "react-redux";
import REGEX from "../utils/regix";
import refresh from "../assets/images/refresh.png";
import { useNavigate } from "react-router-dom";
import { axiosClient } from "../services/axiosClient";
import EndPoints from "../services/EndPoints";
import { setAuth } from "../store/AppAuthSlice";
import hide from "../assets/images/darkmode/hide.png";
import show from "../assets/images/darkmode/show.png";

export default function ChangePassword() {
  const { status } = useSelector((state) => state.appAuth);
  const dispatch = useDispatch();
  const navigate = useNavigate();
  const [loading, setLoading] = useState(false);
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [errors, setErrors] = useState({});

  const togglePasswordVisibility = () => setShowPassword(!showPassword);
  const toggleConfirmPasswordVisibility = () =>
    setShowConfirmPassword(!showConfirmPassword);

  const [t] = useTranslation();

  /**
   * Validates password and confirm password fields.
   * Sets error messages if validation fails.
   * @returns {boolean} - True if valid, false otherwise.
   */
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

  /**
   * Handles form submission, validates input, updates password via API,
   * updates Redux state, and navigates to the next step.
   */
  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!validate()) return;

    try {
      // Replace with your actual API call
      setLoading(true);
      const res = await axiosClient.post(EndPoints.ADMIN.PASSWORD_RESET, {
        phone: status?.phone,
        email: status?.email,
        phoneToken: status?.phoneToken,
        emailToken: status?.emailToken,
        resetPasswordToken: status?.resetToken,
        password,
      });
      if (res.statusCode === 200) {
        toast.success(res?.result);
        navigate("/login");
      }
    } catch (e) {
      toast.error(e);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen h-svh select-none bg-background2">
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
              Change Password
            </h2>

            <div className="px-10">
              {/* Password Field */}
              <div className="mt-5 relative w-full">
                <p className="text-textPrimary text-sm text-left p-1 font-semibold">
                  {t("labels.password")}
                </p>
                <div className="relative w-full">
                  <input
                    className="text-textPrimary rounded-lg bg-backgroundGray15 py-2 px-5 mt-2 w-full"
                    type={showPassword ? "text" : "password"}
                    name="password"
                    placeholder={t("placeholders.password")}
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                  />
                  <img
                    src={showPassword ? hide : show}
                    alt="Toggle Password Visibility"
                    className="absolute right-3 -bottom-1 transform -translate-y-1/2 cursor-pointer size-6 object-contain"
                    onClick={togglePasswordVisibility}
                  />
                </div>
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
                <div className="relative w-full">
                  <input
                    className="text-textPrimary rounded-lg bg-backgroundGray15 py-2 px-5 mt-2 w-full pr-10"
                    type={showConfirmPassword ? "text" : "password"}
                    name="confirmPassword"
                    placeholder={t("placeholders.confirmPassword")}
                    value={confirmPassword}
                    onChange={(e) => setConfirmPassword(e.target.value)}
                  />
                  <img
                    src={showConfirmPassword ? hide : show}
                    alt="Toggle Confirm Password Visibility"
                    className="absolute right-3 -bottom-1 transform -translate-y-1/2 cursor-pointer size-6 object-contain"
                    onClick={toggleConfirmPasswordVisibility}
                  />
                </div>
                {errors.confirmPassword && (
                  <div className="text-textRed text-sm text-left p-1">
                    {errors.confirmPassword}
                  </div>
                )}
              </div>
              {/* Navigation Buttons */}
              <div className="flex justify-between w-full mt-5">
                <button
                  type="button"
                  className="rounded-lg px-4 h-8 bg-backgroundBlue font-medium flex items-center justify-center text-white transition-all duration-200 ease-in-out active:scale-90"
                  data-testid="back"
                  onClick={() => {
                    localStorage.clear();
                    navigate("/login");
                  }}
                >
                  <p className="text-base">{t("buttons.back")}</p>
                </button>
                <button
                  type="button"
                  onClick={handleSubmit}
                  disabled={loading}
                  className="rounded-lg px-4 h-8 bg-backgroundBlue font-medium flex items-center justify-center text-white transition-all duration-200 ease-in-out active:scale-90"
                  data-testid="submitPage3"
                >
                  <div className="flex items-center gap-2">
                    <p className="text-base">{t("buttons.continue")}</p>
                  </div>
                </button>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
