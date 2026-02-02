import React, { useEffect, useState } from "react";
import ClassView from "./ClassView";
import SectionView from "./SectionView";
import StudentView from "./StudentView";
import { useSelector } from "react-redux";

export default function ClassSummary({ setHideReportsHeader }) {
  const { classAndSectionData } = useSelector((state) => state.appAuth);
  const [filterData, setFilterData] = useState(null);
  const [filterClass, setFilterClass] = useState(null);
  const [filterSection, setFilterSection] = useState(null);
  const [selectedStudent, setSelectedStudent] = useState(null);
  const [selectedView, setSelectedView] = useState("class");

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
    <ClassView
      setFilterData={setFilterData}
      setSelectedView={setSelectedView}
    />
  ) : selectedView === "section" ? (
    <SectionView
      setSelectedView={setSelectedView}
      filterData={filterData}
      setFilterData={setFilterData}
    />
  ) : selectedView === "student" ? (
    <StudentView
      setSelectedView={setSelectedView}
      filterData={filterData}
      classAndSectionData={classAndSectionData}
    />
  ) : (
    <></>
  );
}
