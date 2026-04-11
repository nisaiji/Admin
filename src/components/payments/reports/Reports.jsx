import React, { useEffect, useMemo, useState } from "react";

import ClassSummary from "./classsummary/ClassSummary";
import PaymentView from "./PaymentView";
import RefundAndFailedTransition from "./RefundAndFailedTransition";

import receipt from "../../../assets/images/fees/receipt.png";
import wallet from "../../../assets/images/fees/wallet.png";
import classimg from "../../../assets/images/fees/class.png";
import { useDispatch, useSelector } from "react-redux";
import { setTempData } from "../../../store/AppAuthSlice";

export default function Reports() {
  const dispatch = useDispatch();
  const tempData = useSelector((state) => state.appAuth.tempData);
  const [selectedView, setSelectedView] = useState(
    tempData?.selectedReportsTab || "paymentmode",
  );
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
                  onClick={() => {
                    setSelectedView(key);
                    dispatch(setTempData({ selectedReportsTab: key }));
                  }}
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
