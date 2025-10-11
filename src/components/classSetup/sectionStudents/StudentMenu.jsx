import React, { useState } from "react";
import Spinner from "../../Spinner";
import { useSelector } from "react-redux";
import Breadcrumbs from "../../BreadCrumbs";
import { useTranslation } from "react-i18next";
import { useNavigate } from "react-router-dom";
import student from "../../../assets/images/darkmode/student.png";
import attendance from "../../../assets/images/darkmode/attendance.png";
import calendar from "../../../assets/images/darkmode/calendarimg.png";
import subject from "../../../assets/images/darkmode/subject.png";
import marksheet from "../../../assets/images/darkmode/marksheet.png";

export default function StudentMenu() {
  const navigate = useNavigate();
  const role = useSelector((state) => state.appAuth.role);
  const { classAndSectionData, classAndSectionDataOfTeacher } = useSelector(
    (state) => state.appAuth
  );
  const isDarkMode = useSelector((state) => state.appConfig.isDarkMode);
  const [loading, setLoading] = useState(false);
  // const [t] = useTranslation();
  // console.log(classAndSectionDataOfTeacher);

  return (
    <div
      className={`${
        isDarkMode ? "bg-background2" : "bg-whiteBackground2"
      } px-6 py-6`}
    >
      {loading && (
        <div
          className={`fixed inset-0 flex items-center justify-center bg-[#93a3b6]/25 bg-opacity-50 z-30`}
        >
          <Spinner />
        </div>
      )}
      <div
        className={`${
          isDarkMode
            ? "bg-gradient-to-r from-fromColor1 to-toColor1"
            : "bg-whiteBackground"
        } p-4 rounded-[16px] min-h-[calc(100vh-120px)]`}
      >
        <div className={`px-6`}>
          <Breadcrumbs />
          <div
            className={`flex justify-between border-b-2 border-[#9391A5BF] pb-5`}
          >
            <div
              className={`text-2xl ${
                isDarkMode ? "text-textPrimary" : "text-textBlack"
              } font-semibold px-2 py-3`}
            >
              {role === "classTeacher"
                ? `${classAndSectionDataOfTeacher?.className} ${classAndSectionDataOfTeacher?.sectionName}`
                : role === "admin"
                ? `${classAndSectionData?.className} ${classAndSectionData?.sectionName}`
                : ""}
            </div>
          </div>
          <div className="flex mt-5 ">
            {/* student section */}
            <div
              onClick={() => {
                role === "classTeacher"
                  ? navigate("/student-menu/student-section")
                  : role === "admin"
                  ? navigate("/class-setup/student-menu/student-section")
                  : "";
              }}
              className="size-[162px] cursor-pointer bg-[#0A81D11A] rounded-[14px] flex flex-col justify-around items-center "
            >
              <img
                src={student}
                alt="classroom"
                className="size-16 object-contain"
              />
              <p className="text-base font-normal text-textPrimary">
                Classroom
              </p>
            </div>
            {/* attendnace */}
            <div
              onClick={() => {
                role === "classTeacher"
                  ? navigate("/student-menu/attendance")
                  : role === "admin"
                  ? navigate("/class-setup/student-menu/attendance")
                  : "";
              }}
              className="size-[162px] cursor-pointer bg-[#0A81D11A] ml-5 rounded-[14px] flex flex-col justify-around items-center  "
            >
              <img
                src={attendance}
                alt="classroom"
                className="size-16 object-contain"
              />
              <p className="text-base font-normal text-textPrimary">
                Attendance
              </p>
            </div>
            {/* calendar */}
            {role === "admin" && (
              <div className="size-[162px] cursor-pointer bg-[#0A81D11A] ml-5 rounded-[14px] flex flex-col justify-around items-center  ">
                <img
                  src={calendar}
                  alt="classroom"
                  className="size-16 object-contain"
                />
                <p className="text-base font-normal text-textPrimary">
                  Calendar
                </p>
              </div>
            )}
            {/* subjects */}
            {(role === "classTeacher" || role === "admin") && (
              <div
                onClick={() => {
                  role === "classTeacher"
                    ? navigate("/student-menu/subjects")
                    : role === "admin"
                    ? navigate("/class-setup/student-menu/subjects")
                    : "";
                }}
                className="size-[162px] cursor-pointer bg-[#0A81D11A] ml-5 rounded-[14px] flex flex-col justify-around items-center  "
              >
                <img
                  src={subject}
                  alt="classroom"
                  className="size-16 object-contain"
                />
                <p className="text-base font-normal text-textPrimary">
                  Subjects
                </p>
              </div>
            )}

            {/* marksheet */}
            {role === "admin" && (
              <div
                onClick={() => {
                  navigate("/class-setup/student-menu/marksheet");
                }}
                className="size-[162px] cursor-pointer bg-[#0A81D11A] ml-5 rounded-[14px] flex flex-col justify-around items-center  "
              >
                <img
                  src={marksheet}
                  alt="classroom"
                  className="size-16 object-contain"
                />
                <p className="text-base font-normal text-textPrimary">
                  Marksheet
                </p>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
