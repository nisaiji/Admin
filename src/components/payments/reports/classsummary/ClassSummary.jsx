import React, { useState } from "react";
import ClassView from "./ClassView";
import SectionView from "./SectionView";
import StudentView from "./StudentView";
import { useSelector } from "react-redux";

export default function ClassSummary() {
  const { classAndSectionData } = useSelector((state) => state.appAuth);
  const [selectedView, setSelectedView] = useState("class");
  const [filterData, setFilterData] = useState(null);
  const [filterClass, setFilterClass] = useState(null);
  const [filterSection, setFilterSection] = useState(null);
  const [selectedStudent, setSelectedStudent] = useState(null);

  return selectedView === "class" ? (
    <ClassView
      setFilterData={setFilterData}
      setSelectedView={setSelectedView}
      // filterClass={filterClass}
      // setFilterClass={setFilterClass}
      // filterSection={filterSection}
      // setFilterSection={setFilterSection}
    />
  ) : selectedView === "section" ? (
    <SectionView
      setSelectedView={setSelectedView}
      filterData={filterData}
      setFilterData={setFilterData}
      // filterClass={filterClass}
      // filterSection={filterSection}
      // setSelectedStudent={setSelectedStudent}
    />
  ) : // <></>
  selectedView === "student" ? (
    <StudentView
      setSelectedView={setSelectedView}
      filterData={filterData}
      classAndSectionData={classAndSectionData}
      // selectedStudent={selectedStudent}
      // filterClass={filterClass}
      // filterSection={filterSection}
    />
  ) : (
    // <></>
    <></>
  );
}
