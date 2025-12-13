import React, { useState } from "react";
import { useSelector } from "react-redux";

import dashboard from "../../assets/images/fees/dashboard.png";
import report from "../../assets/images/fees/report.png";
import payment from "../../assets/images/fees/payment.png";
import disputes from "../../assets/images/fees/disputes.png";
import settings from "../../assets/images/fees/settings.png";
import support from "../../assets/images/fees/support.png";

import Sidebar from "./Sidebar";
import Dashboard from "./Dashboard";
import Disputes from "./Disputes";
import Payments from "./payments/Payments";
import Reports from "./reports/Reports";
import SettingSetup from "./setting/SettingSetup";

export default function Fees() {
  const isDarkMode = useSelector((state) => state.appConfig.isDarkMode);
  const [selected, setSelected] = useState("Settings");
  const items = [
    { src: dashboard, label: "Dashboard" },
    { src: report, label: "Reports" },
    { src: payment, label: "Payments" },
    { src: disputes, label: "Disputes" },
    { src: settings, label: "Settings" },
    { src: support, label: "Support" },
  ];

  return (
    <div
      className={`${
        isDarkMode ? "bg-background2" : "bg-whiteBackground2"
      } select-none flex`}
    >
      <Sidebar items={items} selected={selected} setSelected={setSelected} />
      {selected === "Dashboard" && <Dashboard />}
      {selected === "Reports" && <Reports />}
      {selected === "Payments" && <Payments />}
      {selected === "Disputes" && <Disputes />}
      {selected === "Settings" && <SettingSetup />}
    </div>
  );
}
