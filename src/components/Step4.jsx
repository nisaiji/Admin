import React from "react";
import pending from "../assets/images/pending.png";

export default function Step4() {
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
      </div>
    </>
  );
}
