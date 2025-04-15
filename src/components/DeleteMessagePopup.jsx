import React, { useEffect } from "react";
import deleteIcon from "../assets/images/deleteIcon.png";
import { useTranslation } from "react-i18next";
import { useSelector } from "react-redux";

export default function DeletePopup({ isVisible, onClose, onDelete }) {
  const { t } = useTranslation();
  const isDarkMode = useSelector((state) => state.appConfig.isDarkMode);

  useEffect(() => {
    if (isVisible) {
      document.body.style.overflow = "hidden";
    } else {
      document.body.style.overflow = "auto";
    }

    return () => {
      document.body.style.overflow = "auto";
    };
  }, [isVisible]);

  if (!isVisible) return null;

  return (
    <div className="fixed inset-0 flex items-center justify-center bg-black bg-opacity-50 z-20">
      <div
        className={`${
          isDarkMode ? "bg-background" : "bg-whiteBackground"
        } p-5 rounded shadow-lg`}
      >
        <div className="flex">
          <div className="bg-red-100 rounded-full p-2">
            <div className="bg-red-200 rounded-full p-2">
              <img src={deleteIcon} alt="delete icon" className="size-6" />
            </div>
          </div>
          <div className="ml-3">
            <div className="flex justify-between">
              <p
                className={`font-semibold ${
                  isDarkMode ? "text-textPrimary" : "text-textBlack"
                }`}
              >
                {t("buttons.delete")}
              </p>
            </div>
            <p className={`text-textGray text-sm`}>
              {t("titles.confirmDelete")}
            </p>
          </div>
        </div>
        <div className="mt-4 flex justify-end">
          <button
            className={`border shadow-sm rounded-lg px-4 py-2 mr-2 text-base font-poppins-bold transition-all duration-200 ease-in-out active:scale-90 ${
              isDarkMode ? "text-textPrimary" : "bg-whiteBackground"
            }`}
            onClick={onClose}
          >
            {t("buttons.cancel")}
          </button>
          <button
            className="border border-borderDarkRed bg-backgroundDarkRed text-white shadow-sm rounded-lg px-4 py-2 text-base font-poppins-regular transition-all duration-200 ease-in-out active:scale-90"
            onClick={onDelete}
            data-testid="confirmdeleteTeacher"
          >
            {t("buttons.delete")}
          </button>
        </div>
      </div>
    </div>
  );
}
