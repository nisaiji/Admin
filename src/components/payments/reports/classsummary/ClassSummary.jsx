import React, { useEffect, useState } from "react";
import ClassView from "./ClassView";
import SectionView from "./SectionView";
import StudentView from "./StudentView";
import { useSelector } from "react-redux";

export default function ClassSummary({ setHideReportsHeader }) {
  const { classAndSectionData, tempData } = useSelector(
    (state) => state.appAuth,
  );
  const [selectedView, setSelectedView] = useState(
    tempData?.selectedReportsClassTab || "class",
  );

  useEffect(() => {
    if (selectedView === "section" || selectedView === "student") {
      setHideReportsHeader(true);
      localStorage.setItem("hideReportsHeader", "true");
    } else {
      setHideReportsHeader(false);
      localStorage.setItem("hideReportsHeader", "false");
    }
  }, [selectedView, setHideReportsHeader]);

  return selectedView === "class" ? (
    <ClassView setSelectedView={setSelectedView} />
  ) : selectedView === "section" ? (
    <SectionView
      setSelectedView={setSelectedView}
    />
  ) : selectedView === "student" ? (
    <StudentView
      setSelectedView={setSelectedView}
      classAndSectionData={classAndSectionData}
    />
  ) : (
    <></>
  );
}
