import React, { useEffect, useState } from "react";
import FeeStructureSetup from "../paymentSetup/FeeStructureSetup";
import Setting from "./Setting";
import { FeeStructureView } from "./ViewFees";
import SchoolFeeSetting from "./SchoolFeeSetting";

export default function SettingSetup() {
  const [selected, setSelected] = useState("viewSetup");
  
  return (
    <div className="w-full">
      {selected === "settingSetup" && <Setting setSelected={setSelected} />}
      {selected === "schoolFeeSetting" && (
        <SchoolFeeSetting setSelected={setSelected} />
      )}
      {selected === "viewSetup" && (
        <FeeStructureView setSelected={setSelected} />
      )}
      {selected === "paymentSetup" && (
        <FeeStructureSetup onBack={() => setSelected("viewSetup")} />
      )}
    </div>
  );
}
