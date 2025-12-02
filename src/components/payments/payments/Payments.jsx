import React, { useState } from "react";
import ClassView from "./ClassView";
import SectionView from "./SectionView";
import StudentView from "./StudentView";

export default function Payments() {
  const [selectedView, setSelectedView] = useState("class");

  return selectedView === "class" ? (
    <ClassView setSelectedView={setSelectedView} />
  ) : selectedView === "section" ? (
    <SectionView setSelectedView={setSelectedView} />
  ) : selectedView === "student" ? (
    <StudentView setSelectedView={setSelectedView} />
  ) : (
    <></>
  );
}
