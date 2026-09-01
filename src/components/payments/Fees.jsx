import React, { useEffect, useMemo, useState } from "react";
import { useSelector } from "react-redux";

import dashboard from "../../assets/images/fees/dashboard.png";
import collected from "../../assets/images/fees/collected.png";
import receipt from "../../assets/images/fees/receipt.png";
import settings from "../../assets/images/fees/settings.png";

import Sidebar from "./Sidebar";
import { PaymentDashboard } from "./dashboard/Dashboard";
import CollectionScreen from "./CollectionScreen";
import Lookup from "./lookup/Lookup";
import SettingSetup from "./setting/SettingSetup";

const ALLOWED_TABS = ["Dashboard", "Collection", "Lookup", "Settings"];

export default function Fees() {
  const tempData = useSelector((state) => state.appAuth.tempData);
  const isDarkMode = useSelector((state) => state.appConfig.isDarkMode);
  const [selected, setSelected] = useState(
    ALLOWED_TABS.includes(tempData?.selectedTab) ? tempData.selectedTab : "Dashboard",
  );

  useEffect(() => {
    if (ALLOWED_TABS.includes(tempData?.selectedTab)) {
      setSelected(tempData.selectedTab);
    }
  }, [tempData?.selectedTab]);

  const menuItems = useMemo(
    () => [
      { src: dashboard, label: "Dashboard" },
      { src: collected, label: "Collection" },
      // { src: receipt, label: "Lookup" },
      { src: settings, label: "Settings" },
    ],
    [],
  );

  const screens = {
    Dashboard: PaymentDashboard,
    Collection: CollectionScreen,
    Lookup,
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
