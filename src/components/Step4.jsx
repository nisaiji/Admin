import React from "react";
import pending from "../assets/images/pending.png";
import { useTranslation } from "react-i18next";

/**
 * Step4 Component - Displays a "Verification Pending" screen and provides an option to check progress.
 * @param {function} checkProgress - Function to handle the progress check when the button is clicked.
 */
export default function Step4({ checkProgress }) {
  const [t] = useTranslation();
  return (
    <>
      <div className="flex flex-col justify-center items-center">
        <img src={pending} alt="" className="size-[200px]" />
        <p className="text-base font-poppins-bold text-center">
          {t("register.verificationPending")}
        </p>
        <p className="w-[310px] text-sm font-poppins-regular text-center">
          {t("register.pendingMessage")}
        </p>
        <button
          className="rounded-lg px-4 mt-3 h-8 bg-[#0F4189] font-medium flex items-center justify-center text-white"
          type="button"
          onClick={checkProgress}
          data-testid="checkProgress"
        >
          <div className="flex items-center gap-2">
            <p className="text-base">{t("buttons.checkProgress")}</p>
          </div>
        </button>
      </div>
    </>
  );
}
