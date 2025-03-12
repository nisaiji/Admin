import React, { useEffect } from "react";
import { useTranslation } from "react-i18next";
import cross from "../assets/images/cross.png";

export default function ConformationPopup({
  isVisible,
  onClose,
  onSubmit,
  message,
}) {
  const { t } = useTranslation();

  useEffect(() => {
    document.body.style.overflow = isVisible ? "hidden" : "auto";

    return () => {
      document.body.style.overflow = "auto";
    };
  }, [isVisible]);

  if (!isVisible) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black bg-opacity-50 transition-opacity duration-300">
      <div className="bg-white rounded-lg shadow-xl p-6 w-full max-w-md transform transition-all duration-300">
        {/* Header with title and close icon */}
        <div className="flex justify-between items-center mb-4">
          <h2 className="text-lg font-semibold text-gray-800">
            Confirm Action
          </h2>
          <button
            onClick={onClose}
            className="text-gray-400 hover:text-gray-600 transition-all duration-200 ease-in-out active:scale-90"
          >
            <img src={cross} alt="Close" className="h-8 w-8" />
          </button>
        </div>
        {/* Message */}
        <p className="text-gray-700 mb-6">{message}</p>
        {/* Action buttons */}
        <div className="flex justify-end space-x-3">
          <button
            onClick={onClose}
            className="px-4 py-2 rounded-lg border border-gray-300 text-gray-700 hover:bg-gray-50 transition-all duration-200 ease-in-out active:scale-90"
          >
            {t("buttons.cancel")}
          </button>
          <button
            onClick={onSubmit}
            className="px-4 py-2 rounded-lg bg-red-600 text-white hover:bg-red-700 transition-all duration-200 ease-in-out active:scale-90"
          >
            {t("buttons.submit")}
          </button>
        </div>
      </div>
    </div>
  );
}
