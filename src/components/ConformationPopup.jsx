import React, { useEffect } from "react";
import { useTranslation } from "react-i18next";
import cross from "../assets/images/darkmode/cross.png";
import crossw from "../assets/images/cross.png";
import { useSelector } from "react-redux";

export default function ConformationPopup({
  isVisible,
  onClose,
  onSubmit,
  message,
}) {
  const { t } = useTranslation();
  const isDarkMode = useSelector((state) => state.appConfig.isDarkMode);

  useEffect(() => {
    document.body.style.overflow = isVisible ? "hidden" : "auto";

    return () => {
      document.body.style.overflow = "auto";
    };
  }, [isVisible]);

  if (!isVisible) return null;

  return (
    <div
      className={`fixed inset-0 z-50 flex items-center justify-center bg-black bg-opacity-50 transition-opacity duration-300`}
    >
      <div
        className={`${
          isDarkMode ? "bg-background" : "bg-whiteBackground"
        } rounded-lg shadow-xl p-6 w-full max-w-md transform transition-all duration-300`}
      >
        {/* Header with title and close icon */}
        <div className="flex justify-between items-center mb-4">
          <h2
            className={`text-lg font-semibold  ${
              isDarkMode ? "text-textPrimary" : "text-textBlack"
            }`}
          >
            Confirm Action
          </h2>
          <button
            onClick={onClose}
            className="text-gray-400 hover:text-gray-600 transition-all duration-200 ease-in-out active:scale-90"
          >
            <img
              src={isDarkMode ? cross : crossw}
              alt="Close"
              className={`${isDarkMode ? "h-5 w-5" : "h-8 w-8"}`}
            />
          </button>
        </div>
        {/* Message */}
        <p className="text-textGray mb-6">{message}</p>
        {/* Action buttons */}
        <div className="flex justify-end space-x-3">
          <button
            onClick={onClose}
            className={`px-4 py-2 rounded-lg border border-borderGray transition-all duration-200 ease-in-out active:scale-90 ${ isDarkMode ? "text-textPrimary" : "bg-whiteBackground"}`}
          >
            {t("buttons.cancel")}
          </button>
          <button
            onClick={onSubmit}
            className="px-4 py-2 rounded-lg bg-backgroundDarkRed text-textPrimary hover:bg-backgroundDarkRed transition-all duration-200 ease-in-out active:scale-90"
          >
            {t("buttons.submit")}
          </button>
        </div>
      </div>
    </div>
  );
}
