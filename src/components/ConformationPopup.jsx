import React from "react";
import { useTranslation } from "react-i18next";

export default function ConformationPopup({ isVisible, onClose, submit }) {
  const { t } = useTranslation();
  if (!isVisible) return null;

  return (
    <div className="fixed inset-0 flex items-center justify-center bg-black bg-opacity-50">
      <div className="bg-white p-5 rounded shadow-lg">
        <div className="flex">
          <div className="ml-3">
            <div className="flex justify-between">
              <p className="font-semibold text-black">{t("sameEntry")}</p>
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
            onClick={submit}
          >
            {t("buttons.submit")}
          </button>
        </div>
      </div>
    </div>
  );
}
