import React, { useState } from "react";
import FeeStructureSetup from "../paymentSetup/FeeStructureSetup";
import Setting from "./Setting";

export default function SettingSetup() {
  //   const isDarkMode = useSelector((state) => state.appConfig.isDarkMode);
  const [selected, setSelected] = useState("settingSetup");

  return (
    <div className="w-full">
      {selected === "settingSetup" && <Setting setSelected={setSelected} />}
      {selected === "paymentSetup" && (
        <FeeStructureSetup onBack={() => setSelected("settingSetup")} />
      )}
    </div>
  );
}
