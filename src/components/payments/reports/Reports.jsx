import React, { useState } from "react";
import ClassView from "./ClassView";
import calendar from "../../../assets/images/fees/calendar.png";
import pending from "../../../assets/images/fees/pendingBlue.png";
import receipt from "../../../assets/images/fees/receipt.png";
import wallet from "../../../assets/images/fees/wallet.png";
import classimg from "../../../assets/images/fees/class.png";
import PeriodicView from "./PeriodicView";
import PaymentView from "./PaymentView";
import FeeSummaryView from "./FeeSummaryView";

export default function Reports() {
  const [selectedView, setSelectedView] = useState("feesummary");

  return (
    <div className="p-6 w-full text-textPrimary">
      <p className="text-xl font-poppins-bold">Reports & Analytics</p>
      {/* top buttons */}
      <div className="my-6 flex items-center gap-6">
        <button
          type="button"
          onClick={() => setSelectedView("class")}
          className={`text-sm font-poppins-bold p-[10px] rounded-md flex justify-center items-center gap-2 ${
            selectedView === "class"
              ? "bg-backgroundBlue text-textPrimary"
              : "text-textBlue"
          }`}
        >
          <img
            src={classimg}
            alt="d"
            className={`size-6 object-contain ${
              selectedView === "class"
                ? "filter invert brightness-0 saturate-0"
                : ""
            }`}
          />
          Class-wise
        </button>
        <button
          type="button"
          onClick={() => setSelectedView("periodic")}
          className={`text-sm font-poppins-bold p-[10px] rounded-md flex justify-center items-center gap-2 ${
            selectedView === "periodic"
              ? "bg-backgroundBlue text-textPrimary"
              : "text-textBlue"
          }`}
        >
          <img
            src={calendar}
            alt="d"
            className={`size-6 object-contain ${
              selectedView === "periodic"
                ? "filter invert brightness-0 saturate-0"
                : ""
            }`}
          />
          Periodically
        </button>
        <button
          type="button"
          onClick={() => setSelectedView("paymentmode")}
          className={`text-sm font-poppins-bold p-[10px] rounded-md flex justify-center items-center gap-2 ${
            selectedView === "paymentmode"
              ? "bg-backgroundBlue text-textPrimary"
              : "text-textBlue"
          }`}
        >
          <img
            src={wallet}
            alt="d"
            className={`size-6 object-contain ${
              selectedView === "paymentmode"
                ? "filter invert brightness-0 saturate-0"
                : ""
            }`}
          />
          Payment Mode
        </button>
        <button
          type="button"
          onClick={() => setSelectedView("feesummary")}
          className={`text-sm font-poppins-bold p-[10px] rounded-md flex justify-center items-center gap-2 ${
            selectedView === "feesummary"
              ? "bg-backgroundBlue text-textPrimary"
              : "text-textBlue"
          }`}
        >
          <img
            src={pending}
            alt="d"
            className={`size-6 object-contain ${
              selectedView === "feesummary"
                ? "filter invert brightness-0 saturate-0"
                : ""
            }`}
          />
          Fee Summary
        </button>
        <button
          type="button"
          onClick={() => setSelectedView("refund")}
          className={`text-sm font-poppins-bold p-[10px] rounded-md flex justify-center items-center gap-2 ${
            selectedView === "refund"
              ? "bg-backgroundBlue text-textPrimary"
              : "text-textBlue"
          }`}
        >
          <img
            src={receipt}
            alt="d"
            className={`size-6 object-contain ${
              selectedView === "refund"
                ? "filter invert brightness-0 saturate-0"
                : ""
            }`}
          />
          Refund & Failed Txns
        </button>
      </div>
      {selectedView === "class" ? <ClassView /> : <></>}
      {selectedView === "periodic" ? <PeriodicView /> : <></>}
      {selectedView === "paymentmode" ? <PaymentView /> : <></>}
      {selectedView === "feesummary" ? <FeeSummaryView /> : <></>}
    </div>
  );
}
