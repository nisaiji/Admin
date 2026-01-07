import React, { useState } from "react";
import ClassView from "./ClassView";
import SectionView from "./SectionView";
import StudentView from "./StudentView";

export default function Payments() {
  const [selectedView, setSelectedView] = useState("class");
  const [filterClass, setFilterClass] = useState(null);
  const [filterSection, setFilterSection] = useState(null);
  const [selectedStudent, setSelectedStudent] = useState(null);

  return selectedView === "class" ? (
    <ClassView
      setSelectedView={setSelectedView}
      filterClass={filterClass}
      setFilterClass={setFilterClass}
      filterSection={filterSection}
      setFilterSection={setFilterSection}
    />
  ) : selectedView === "section" ? (
    <SectionView
      setSelectedView={setSelectedView}
      filterClass={filterClass}
      filterSection={filterSection}
      setSelectedStudent={setSelectedStudent}
    />
  ) : selectedView === "student" ? (
    <StudentView
      setSelectedView={setSelectedView}
      selectedStudent={selectedStudent}
      filterClass={filterClass}
      filterSection={filterSection}
    />
  ) : (
    <></>
  );
}
