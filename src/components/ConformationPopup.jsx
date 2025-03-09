import React, { useEffect } from "react";
import { useTranslation } from "react-i18next";

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
    <div className="fixed inset-0 flex items-center justify-center bg-black bg-opacity-50 z-50">
      <div className="bg-white p-5 rounded shadow-lg">
        <div className="flex">
          <div className="ml-3">
            <div className="flex justify-betweens max-w-[400px]">
              <p className="font-semibold text-black">{message}</p>
            </div>
          </div>
        </div>
        <div className="mt-4 flex justify-end">
          <button
            className="border border-[#d9d9d9] bg-white shadow-sm rounded-lg px-4 py-2 mr-2 text-base font-poppins-bold"
            onClick={onClose}
          >
            {t("buttons.cancel")}
          </button>
          <button
            className="border border-[#d91111] bg-[#d91111] text-white shadow-sm rounded-lg px-4 py-2 text-base font-poppins-regular"
            onClick={onSubmit}
          >
            {t("buttons.submit")}
          </button>
        </div>
      </div>
    </div>
  );
}
