import React from "react";
import pending from "../assets/images/pending.png";
import { useTranslation } from "react-i18next";

export default function Step4({ checkProgress }) {
  const [t] = useTranslation();
  return (
    <>
      <div className="flex flex-col justify-center items-center">
        <img src={pending} alt="" className="size-[200px]" />
        <p className="text-base font-poppins-bold text-center">
          Verification Pending
        </p>
        <p className="w-[310px] text-sm font-poppins-regular text-center">
          It might take up to 24 working hours to complete the verification
          process
        </p>
        <button
          className="rounded-lg px-4 mt-3 h-8 bg-[#0F4189] font-medium flex items-center justify-center text-white"
          type="button"
          onClick={checkProgress}
        >
          <div className="flex items-center gap-2">
            <p className="text-base">Check Progress</p>
          </div>
        </button>
      </div>
    </>
  );
}
