import React, { useState } from "react";
import deleteIcon from "../assets/images/deleteIcon.png";
import { useTranslation } from "react-i18next";

export default function DeletePopup({ isVisible, onClose, onDelete }) {
  const { t } = useTranslation();
  if (!isVisible) return null;

  return (
    <div className="fixed inset-0 flex items-center justify-center bg-black bg-opacity-50 z-20">
      <div className="bg-white p-5 rounded shadow-lg">
        <div className="flex">
          <div className="bg-red-100 rounded-full p-2">
            <div className="bg-red-200 rounded-full p-2">
              <img src={deleteIcon} alt="delete icon" className="size-6" />
            </div>
          </div>
          <div className="ml-3">
            <div className="flex justify-between">
              <p className="font-semibold text-black">{t("buttons.delete")}</p>
            </div>
            <p className="text-gray-600 text-sm">{t("confirmDelete")}</p>
          </div>
        </div>
        <div className="mt-4 flex justify-end">
          <button
            className="border border-[#d9d9d9] bg-white shadow-sm rounded-lg px-4 py-2 mr-2 text-base font-poppins-bold"
            onClick={onClose}
          >
            {t("cancel")}
          </button>
          <button
            className="border border-[#d91111] bg-[#d91111] text-white shadow-sm rounded-lg px-4 py-2 text-base font-poppins-regular"
            onClick={onDelete}
          >
            {t("delete")}
          </button>
        </div>
      </div>
    </div>
  );
}
