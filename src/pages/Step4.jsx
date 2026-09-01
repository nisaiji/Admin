/**
 * Step4.jsx
 *
 * This component handles the fourth step of the admin registration process: entering basic school information.
 * It manages input fields for school name, affiliation number, and username, validates the input,
 * sends the data to the backend, and navigates to the next step upon success.
 * Uses React hooks for state, Redux for authentication state, and utility functions for validation and notifications.
 */
import React, { useState } from "react";
import { useTranslation } from "react-i18next";
import { axiosClient } from "../services/axiosClient";
import EndPoints from "../services/EndPoints";
import { useDispatch } from "react-redux";
import { setAuth } from "../store/AppAuthSlice";
import { showToast } from "../services/toastService";

const Step4 = ({ goback, setStep, loading, setLoading }) => {
  const dispatch = useDispatch();
  const [formData, setFormData] = useState({
    schoolName: "",
    affiliationNo: "",
    username: "",
  });

  const [errors, setErrors] = useState({});
  const [t] = useTranslation();

  /**
   * Handles input changes for all form fields.
   * @param {object} e - The input change event.
   */
  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
  };

  /**
   * Validates the form fields for school name, affiliation number, and username.
   * Sets error messages if validation fails.
   * @returns {boolean} - True if valid, false otherwise.
   */
  const validate = () => {
    const newErrors = {};
    if (!formData.schoolName.trim()) {
      newErrors.schoolName = t("validationError.schoolName");
    } else if (formData.schoolName.length < 8) {
      newErrors.schoolName = t("validationError.schoolNameLength");
    }
    if (!formData.affiliationNo.trim()) {
      newErrors.affiliationNo = t("validationError.affiliationNumber");
    } else if (formData.affiliationNo.length < 6) {
      newErrors.affiliationNo = t("validationError.affiliationNumberLength");
    }
    if (!formData.username.trim()) {
      newErrors.username = t("validationError.username");
    } else if (formData.username.length < 6) {
      newErrors.username = t("validationError.usernameLength");
    }
    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  /**
   * Handles form submission, validates input, updates basic info via API,
   * updates Redux state, and navigates to the next step.
   */
  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!validate()) return;

    try {
      setLoading(true);
      const res = await axiosClient.put(
        EndPoints.ADMIN.BASIC_INFO_UPDATE,
        formData
      );
      if (res?.statusCode === 200) {
        showToast.success(res?.result);
        dispatch(setAuth({ affiliationExists: true }));
        setStep(5);
      }
    } catch (e) {
      showToast.error(e);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div>
      {/* School Name */}
      <div className="mt-5">
        <p className="text-textPrimary text-sm text-left p-1 font-semibold">
          {t("adminProfile.schoolName")}
        </p>
        <input
          className=" rounded-xl bg-backgroundGray15 text-textPrimary py-2 px-5 mt-2 w-full"
          type="text"
          name="schoolName"
          placeholder={t("placeholders.schoolName")}
          value={formData.schoolName}
          onChange={handleChange}
        />
        {errors.schoolName && (
          <div className="text-textRed text-sm text-left p-1">
            {errors.schoolName}
          </div>
        )}
      </div>

      {/* Affiliation No */}
      <div className="mt-5">
        <p className="text-textPrimary text-sm text-left p-1 font-semibold">
          {t("adminProfile.affiliationNumber")}
        </p>
        <input
          className="rounded-xl bg-backgroundGray15 text-textPrimary py-2 px-5 mt-2 w-full"
          type="text"
          name="affiliationNo"
          placeholder={t("placeholders.affiliationNo")}
          value={formData.affiliationNo}
          onChange={handleChange}
          maxLength={8}
        />
        {errors.affiliationNo && (
          <div className="text-textRed text-sm text-left p-1">
            {errors.affiliationNo}
          </div>
        )}
      </div>

      {/* Username */}
      <div className="mt-5">
        <p className="text-textPrimary text-sm text-left p-1 font-semibold">
          {t("adminProfile.userName")}
        </p>
        <input
          className="rounded-xl bg-backgroundGray15 text-textPrimary py-2 px-5 mt-2 w-full"
          type="text"
          name="username"
          placeholder={t("placeholders.username")}
          value={formData.username}
          onChange={handleChange}
        />
        {errors.username && (
          <div className="text-textRed text-sm text-left p-1">
            {errors.username}
          </div>
        )}
      </div>

      {/* Navigation Buttons */}
      <div className="flex justify-between w-full mt-5">
        <button
          type="button"
          className="rounded-lg px-4 h-8 bg-backgroundBlue font-medium flex items-center justify-center text-white transition-all duration-200 ease-in-out active:scale-90"
          onClick={goback}
        >
          <p className="text-base">{t("buttons.back")}</p>
        </button>
        <button
          type="button"
          onClick={handleSubmit}
          disabled={loading}
          className="rounded-lg px-4 h-8 bg-backgroundBlue font-medium flex items-center justify-center text-white transition-all duration-200 ease-in-out active:scale-90"
        >
          <div className="flex items-center gap-2">
            <p className="text-base">{t("buttons.continue")}</p>
          </div>
        </button>
      </div>
    </div>
  );
};

export default Step4;
