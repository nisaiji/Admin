import React from "react";
import ArrowRight from "../assets/images/ArrowRight.png";
import { useTranslation } from "react-i18next";

// Reusable Input Component
const InputField = ({ label, name, type, placeholder, formik, className }) => (
  <div className={`mt-5 ${className}`}>
    <p className="text-gray-900 text-sm text-left pl-3 font-semibold">
      {label}
    </p>
    <input
      className="text-black rounded-xl border border-[#E9EAF0] py-2 px-5 mt-2 w-full"
      type={type}
      name={name}
      placeholder={placeholder}
      onChange={formik.handleChange}
      value={formik.values[name]}
    />
    {formik.touched[name] && formik.errors[name] && (
      <div className="text-red-500 text-sm text-left pl-3">
        {formik.errors[name]}
      </div>
    )}
  </div>
);

const Step1 = ({ formik, nextStep }) => {
  const [t] = useTranslation();

  return (
    <div>
      <form className="text-black">
        <InputField
          label={t("adminProfile.schoolName")}
          name="schoolName"
          type="text"
          placeholder={t("placeholders.schoolName")}
          formik={formik}
        />
        <div className="flex gap-5">
          <InputField
            label={t("adminProfile.affiliationNumber")}
            name="affiliationNo"
            type="text"
            placeholder={t("placeholders.affiliationNo")}
            formik={formik}
            className="w-1/2"
          />
          <InputField
            label={t("adminProfile.adminName")}
            name="username"
            type="text"
            placeholder={t("placeholders.adminName")}
            formik={formik}
            className="w-1/2"
          />
        </div>
        <InputField
          label={t("adminProfile.Email")}
          name="email"
          type="email"
          placeholder={t("placeholders.emailAddress")}
          formik={formik}
        />
        <InputField
          label={t("adminProfile.Phone")}
          name="phone"
          type="text"
          placeholder={t("placeholders.phone")}
          formik={formik}
        />

        <div className="mt-5">
          <button
            onClick={nextStep}
            type="button"
            className="rounded-lg px-7 h-10 bg-[#464590] font-semibold flex items-center justify-center ml-auto text-white"
          >
            <div className="flex items-center gap-2">
              <p className="text-base">{t("adminProfile.next")}</p>
              <img className="w-6 h-6" src={ArrowRight} alt="Arrow Right" />
            </div>
          </button>
        </div>
      </form>
    </div>
  );
};

export default Step1;
