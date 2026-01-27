import React, { useMemo, useState } from "react";

import ClassSummary from "./classsummary/ClassSummary";
// import PeriodicView from "./PeriodicView";
import PaymentView from "./PaymentView";
// import FeeSummaryView from "./FeeSummaryView";
import RefundAndFailedTransition from "./RefundAndFailedTransition";

// import calendar from "../../../assets/images/fees/calendar.png";
// import pending from "../../../assets/images/fees/pendingBlue.png";
import receipt from "../../../assets/images/fees/receipt.png";
import wallet from "../../../assets/images/fees/wallet.png";
import classimg from "../../../assets/images/fees/class.png";

export default function Reports() {
  const [selectedView, setSelectedView] = useState("class");

  const views = useMemo(
    () => [
      {
        key: "class",
        label: "Class-wise",
        icon: classimg,
        component: ClassSummary,
      },
      // {
      //   key: "periodic",
      //   label: "Periodically",
      //   icon: calendar,
      //   component: PeriodicView,
      // },
      {
        key: "paymentmode",
        label: "Datail Transitions",
        icon: wallet,
        component: PaymentView,
      },
      // {
      //   key: "feesummary",
      //   label: "Fee Summary",
      //   icon: pending,
      //   component: FeeSummaryView,
      // },
      {
        key: "refund",
        label: "Refund & Failed Txns",
        icon: receipt,
        component: RefundAndFailedTransition,
      },
    ],
    []
  );

  const ActiveView = views.find((v) => v.key === selectedView)?.component;

  return (
    <div className="p-6 w-full text-textPrimary">
      <p className="text-xl font-poppins-bold">Reports & Analytics</p>

      {/* Top buttons */}
      <div className="my-6 flex items-center gap-6">
        {views.map(({ key, label, icon }) => {
          const isActive = selectedView === key;

          return (
            <button
              key={key}
              type="button"
              onClick={() => setSelectedView(key)}
              className={`text-sm font-poppins-bold p-[10px] rounded-md flex justify-center items-center gap-2 ${
                isActive
                  ? "bg-backgroundBlue text-textPrimary"
                  : "text-textBlue"
              }`}
            >
              <img
                src={icon}
                alt={label}
                className={`size-6 object-contain ${
                  isActive ? "filter invert brightness-0 saturate-0" : ""
                }`}
              />
              {label}
            </button>
          );
        })}
      </div>

      {/* Active view */}
      {ActiveView && <ActiveView />}
    </div>
  );
}
