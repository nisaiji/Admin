import React, { useState } from "react";
import FeeStructureView from "./ViewFees";
import SchoolFeeSetting from "./SchoolFeeSetting";
import FeeStructureSetup from "../FeeStructureSetup/FeeStructureSetup";

export default function SettingSetup() {
  const [selected, setSelected] = useState("viewSetup");

  return (
    <div className="w-full">
      {selected === "viewSetup" && (
        <FeeStructureView setSelected={setSelected} />
      )}
      {selected === "feeStructureSetup" && (
        <FeeStructureSetup setSelected={setSelected} />
      )}
      {selected === "schoolFeeSetting" && (
        <SchoolFeeSetting setSelected={setSelected} />
      )}
    </div>
  );
}
