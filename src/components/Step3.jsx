import React, { useState } from "react";
import hide from "../assets/images/hide.png";
import show from "../assets/images/show.png";
import ArrowRight from "../assets/images/ArrowRight.png";
import { useTranslation } from "react-i18next";

const Step3 = ({ formik, prevStep, loading }) => {
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);

  const togglePasswordVisibility = () => setShowPassword(!showPassword);
  const toggleConfirmPasswordVisibility = () =>
    setShowConfirmPassword(!showConfirmPassword);

  const [t] = useTranslation();

  return (
    <div className="flex flex-col">
      <h5 className="font-bold text-xl mt-5 text-center">
        {t("register.setYourPassword")}
      </h5>
      <form className="mt-5" onSubmit={formik.handleSubmit}>
        {/* Password Field */}
        <div className="mt-5 relative">
          <p className="text-gray-900 text-sm text-left pl-3 font-semibold">
            {t("labels.password")}
          </p>
          <input
            className="text-black rounded-lg border border-gray-300 py-2 px-5 mt-2 w-full"
            type={showPassword ? "text" : "password"}
            name="password"
            placeholder={t("placeholders.password")}
            onChange={formik.handleChange}
            value={formik.values.password}
          />
          <img
            src={showPassword ? hide : show}
            alt="Toggle Password Visibility"
            className="absolute right-3 top-9 cursor-pointer size-6"
            style={{
              filter:
                "invert(41%) sepia(0%) saturate(0%) hue-rotate(180deg) brightness(90%) contrast(85%)",
            }}
            onClick={togglePasswordVisibility}
          />
          {formik.touched.password && formik.errors.password && (
            <div className="text-red-500 text-sm text-left pl-3">
              {formik.errors.password}
            </div>
          )}
        </div>

        {/* Confirm Password Field */}
        <div className="mt-5 relative">
          <p className="text-gray-900 text-sm text-left pl-3 font-semibold">
            {t("labels.confirmPassword")}
          </p>
          <input
            className="text-black rounded-lg border border-gray-300 py-2 px-5 mt-2 w-full"
            type={showConfirmPassword ? "text" : "password"}
            name="confirmPassword"
            placeholder={t("placeholders.confirmPassword")}
            onChange={formik.handleChange}
            value={formik.values.confirmPassword}
          />
          <img
            src={showConfirmPassword ? hide : show}
            alt="Toggle Confirm Password Visibility"
            className="absolute right-3 top-9 cursor-pointer size-6"
            style={{
              filter:
                "invert(41%) sepia(0%) saturate(0%) hue-rotate(180deg) brightness(90%) contrast(85%)",
            }}
            onClick={toggleConfirmPasswordVisibility}
          />
          {formik.touched.confirmPassword && formik.errors.confirmPassword && (
            <div className="text-red-500 text-sm text-left pl-3">
              {formik.errors.confirmPassword}
            </div>
          )}
        </div>

        {/* Navigation buttons */}
        <div className="flex justify-between w-full mt-5">
          {/* Back Button */}
          <button
            className="rounded-lg px-7 h-10 bg-[#464590] font-semibold flex items-center justify-center text-white"
            type="button" // No validation check on back button
            onClick={prevStep}
          >
            <div className="flex items-center gap-2">
              <img
                className="w-6 h-6 rotate-180"
                src={ArrowRight}
                alt="Arrow Left"
              />
              <p className="text-base">{t("adminProfile.back")}</p>
            </div>
          </button>

          {/* Submit Button */}
          <button
            className="rounded-lg px-7 h-10 bg-[#464590] font-semibold flex items-center justify-center text-white"
            type="submit"
          >
            <div className="flex items-center gap-2">
              <p className="text-base">
                {loading ? t("register.submitting") : t("register.registerNow")}
              </p>
            </div>
          </button>
        </div>
      </form>
    </div>
  );
};

export default Step3;
