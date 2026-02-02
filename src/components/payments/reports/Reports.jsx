import React, { useEffect, useMemo, useState } from "react";

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
  const [selectedView, setSelectedView] = useState("paymentmode");
  const [isHide, setIsHide] = useState(() => {
    return localStorage.getItem("hideReportsHeader") === "true";
  });

  const views = useMemo(
    () => [
      {
        key: "paymentmode",
        label: "Datail Transitions",
        icon: wallet,
        component: PaymentView,
      },
      {
        key: "class",
        label: "Class-wise",
        icon: classimg,
        component: ClassSummary,
      },
      {
        key: "refund",
        label: "Refund & Failed Txns",
        icon: receipt,
        component: RefundAndFailedTransition,
      },
    ],
    [],
  );

  const ActiveView = views.find((v) => v.key === selectedView)?.component;

  useEffect(() => {
    localStorage.setItem("hideReportsHeader", isHide ? "true" : "false");
  }, [isHide]);

  // when switching tabs, reset hide state (optional but recommended)
  useEffect(() => {
    if (selectedView !== "class") {
      setIsHide(false);
      localStorage.setItem("hideReportsHeader", "false");
    }
  }, [selectedView]);

  return (
    <div className="p-6 w-full text-textPrimary">
      {!isHide && (
        <>
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
        </>
      )}

      {/* Active view */}
      {ActiveView && <ActiveView setHideReportsHeader={setIsHide} />}
    </div>
  );
}
