import React, { useMemo, useState } from "react";
import { useSelector } from "react-redux";

import dashboard from "../../assets/images/fees/dashboard.png";
import report from "../../assets/images/fees/report.png";
import settings from "../../assets/images/fees/settings.png";

import Sidebar from "./Sidebar";
import Dashboard from "./Dashboard";
import Disputes from "./Disputes";
import Reports from "./reports/Reports";
import SettingSetup from "./setting/SettingSetup";

export default function Fees() {
  const tempData = useSelector((state) => state.appAuth.tempData);
  const isDarkMode = useSelector((state) => state.appConfig.isDarkMode);
  const [selected, setSelected] = useState(
    tempData?.selectedTab || "Dashboard",
  );

  const menuItems = useMemo(
    () => [
      { src: dashboard, label: "Dashboard" },
      { src: report, label: "Reports" },
      { src: settings, label: "Settings" },
    ],
    [],
  );

  const screens = {
    Dashboard: Dashboard,
    Reports: Reports,
    Disputes: Disputes,
    Settings: SettingSetup,
  };

  const ActiveScreen = screens[selected];

  return (
    <div
      className={`${
        isDarkMode ? "bg-background2" : "bg-whiteBackground2"
      } select-none flex h-[calc(100vh-72px)] min-h-[calc(100vh-72px)] overflow-hidden`}
    >
      <Sidebar
        items={menuItems}
        selected={selected}
        setSelected={setSelected}
      />
      <div className="flex-1 h-full overflow-y-auto">
        {ActiveScreen && <ActiveScreen setSelected={setSelected} />}
      </div>
    </div>
  );
}
