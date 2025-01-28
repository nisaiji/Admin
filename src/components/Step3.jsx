import React from "react";
import ArrowRight from "../assets/images/ArrowRight.png";
import { useTranslation } from "react-i18next";

/**
 * Step3 Component - Handles the third step of a multi-step form.
 * Collects the affiliation number and admin name.
 * @param {object} formik - Formik object for managing form state and validation.
 */
const Step3 = ({ formik }) => {
  const [t] = useTranslation();

  return (
    <form className="text-black" onSubmit={formik.handleSubmit}>
      <div className="flex flex-col">
        <div className={`mt-5`}>
          <p className="text-gray-900 text-sm text-left pl-3 font-semibold">
            {t("adminProfile.affiliationNumber")}
          </p>
          <input
            className="text-black rounded-xl border border-[#E9EAF0] py-2 px-5 mt-2 w-full"
            type="text"
            name="affiliationNo"
            placeholder={t("placeholders.affiliationNo")}
            onChange={formik.handleChange}
            value={formik.values["affiliationNo"]}
            maxLength={8}
          />
          {formik.touched["affiliationNo"] &&
            formik.errors["affiliationNo"] && (
              <div className="text-[#FE4040] text-sm text-left pl-3">
                {formik.errors["affiliationNo"]}
              </div>
            )}
        </div>
        <div className={`mt-5`}>
          <p className="text-gray-900 text-sm text-left pl-3 font-semibold">
            {t("adminProfile.adminName")}
          </p>
          <input
            className="text-black rounded-xl border border-[#E9EAF0] py-2 px-5 mt-2 w-full"
            type="text"
            name={"username"}
            placeholder={t("placeholders.adminName")}
            onChange={formik.handleChange}
            value={formik.values["username"]}
          />
          {formik.touched["username"] && formik.errors["username"] && (
            <div className="text-[#FE4040] text-sm text-left pl-3">
              {formik.errors["username"]}
            </div>
          )}
        </div>
        {/* Navigation buttons */}
        <div className="flex justify-between w-full mt-5">
          <button
            className="rounded-lg px-4 h-8 bg-[#0F4189] font-medium flex items-center justify-center ml-auto text-white"
            type="submit"
          >
            <div className="flex items-center gap-2">
              <p className="text-base">{t("buttons.submit")}</p>
            </div>
          </button>
        </div>
      </div>
    </form>
  );
};

export default Step3;
