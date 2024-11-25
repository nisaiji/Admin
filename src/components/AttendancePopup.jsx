import React, { useEffect } from "react";
import backIcon from "../assets/images/backIcon.png";
import editw from "../assets/images/editw.png";
import downloadw from "../assets/images/downloadw.png";
import closew from "../assets/images/closew.png";

export default function AttendancePopup({ isVisible, onClose }) {
  useEffect(() => {
    if (isVisible) {
      document.body.style.overflow = "hidden"; // Disable scrolling
    } else {
      document.body.style.overflow = ""; // Restore scrolling
    }

    return () => {
      document.body.style.overflow = ""; // Clean up on unmount
    };
  }, [isVisible]);

  if (!isVisible) return null;

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 z-40">
      <div className="bg-black bg-opacity-50 p-4 shadow flex flex-row justify-between">
        <div className="flex flex-row items-center">
          <img src={backIcon} alt="" className="size-[42px]" />
          <div className="text-white text-xl mx-4">Month</div>
          <img src={backIcon} alt="" className="size-[42px] rotate-180" />
        </div>
        <div className="text-white text-xl">Monthly Attendance</div>
        <div className="flex flex-row">
          <img src={editw} alt="" className="size-[42px]" />
          <img src={downloadw} alt="" className="size-[42px] mx-4" />
          <img src={closew} alt="" className="size-[42px]" />
        </div>
      </div>
    </div>
  );
}
