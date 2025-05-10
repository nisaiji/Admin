import React from "react";
import pending from "../assets/images/pending.png";
import { useTranslation } from "react-i18next";

/**
 * Step4 Component - Displays a "Verification Pending" screen and provides an option to check progress.
 * @param {function} checkProgress - Function to handle the progress check when the button is clicked.
 */
export default function Step6({ checkProgress, isDisable, goback }) {
  const [t] = useTranslation();
  return (
    <>
      <div className="flex flex-col justify-center items-center">
        <img src={pending} alt="" className="size-[200px]" />
        <p className="text-base font-poppins-bold text-center text-textPrimary">
          {t("register.verificationPending")}
        </p>
        <p className="w-[310px] text-sm font-poppins-regular text-center text-textPrimary">
          {t("register.pendingMessage")}
        </p>
        {/* Navigation buttons */}
        <div className="flex justify-between w-full mt-5">
          <button
            type="button"
            className="rounded-lg px-4 h-8 bg-[#0F4189] font-medium flex items-center justify-center text-white transition-all duration-200 ease-in-out active:scale-90"
            data-testid="back"
            onClick={goback}
          >
            <p className="text-base">{t("buttons.back")}</p>
          </button>
          <button
            className="rounded-lg px-4 h-8 bg-[#0F4189] font-medium flex items-center justify-center text-white transition-all duration-200 ease-in-out active:scale-90"
            type="button"
            onClick={checkProgress}
            data-testid="checkProgress"
            disabled={isDisable}
          >
            <div className="flex items-center gap-2">
              <p className="text-base">{t("buttons.checkProgress")}</p>
            </div>
          </button>
        </div>
      </div>
    </>
  );
}
