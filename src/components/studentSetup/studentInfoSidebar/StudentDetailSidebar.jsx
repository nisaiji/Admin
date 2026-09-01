import React, { useState } from "react";
import { BookOpen, Info, User, Users } from "lucide-react";
import {
  getFullName,
  getStudentClassName,
  getStudentSectionName,
} from "./utils";
import { SidebarHeader } from "./StudentDetailSidebarParts";
import {
  AcademicTabContent,
  ActivityTabContent,
  GuardianTabContent,
  PersonalTabContent,
} from "./StudentDetailSidebarSections";

function cn(...classes) {
  return classes.filter(Boolean).join(" ");
}

const TABS = [
  { key: "personal", label: "Personal", Icon: User },
  { key: "guardian", label: "Guardian", Icon: Users },
  { key: "academic", label: "Academic", Icon: BookOpen },
  { key: "activity", label: "Activity", Icon: Info },
];

export function StudentDetailSidebar({ student, isDarkMode, onClose, onEdit }) {
  const [tab, setTab] = useState("personal");
  const fullName = getFullName(student);
  const className = getStudentClassName(student);
  const sectionName = getStudentSectionName(student);

  return (
    <div className="fixed inset-0 z-40 flex">
      <button
        type="button"
        aria-label="Close student profile"
        className="flex-1 bg-black/65"
        onClick={onClose}
      />
      <aside
        data-testid="student-detail-sidebar"
        className={cn(
          "flex h-screen w-full max-w-[540px] flex-col border-l shadow-2xl",
          isDarkMode
            ? "border-white/10 bg-[#111315] text-[#E3E8F3]"
            : "border-borderWhite bg-whiteBackground text-textBlack",
        )}
      >
        <SidebarHeader
          student={student}
          fullName={fullName}
          className={className}
          sectionName={sectionName}
          tabs={TABS}
          activeTab={tab}
          onTabChange={setTab}
          onClose={onClose}
          onEdit={onEdit}
          isDarkMode={isDarkMode}
        />

        <div className="flex-1 overflow-y-auto px-6 pb-8">
          {tab === "personal" ? (
            <PersonalTabContent
              student={student}
              fullName={fullName}
              isDarkMode={isDarkMode}
            />
          ) : null}

          {tab === "guardian" ? (
            <GuardianTabContent student={student} isDarkMode={isDarkMode} />
          ) : null}

          {tab === "academic" ? (
            <AcademicTabContent student={student} isDarkMode={isDarkMode} />
          ) : null}

          {tab === "activity" ? (
            <ActivityTabContent student={student} isDarkMode={isDarkMode} />
          ) : null}
        </div>
      </aside>
    </div>
  );
}
