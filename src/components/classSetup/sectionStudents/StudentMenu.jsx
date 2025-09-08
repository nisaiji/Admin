import React, { useState } from "react";
import Spinner from "../../Spinner";
import { useSelector } from "react-redux";
import Breadcrumbs from "../../BreadCrumbs";
import { useTranslation } from "react-i18next";
import { useNavigate } from "react-router-dom";
import classroom from "../../../assets/images/darkmode/classroom.png";
import attendance from "../../../assets/images/darkmode/attendance.png";
import calendar from "../../../assets/images/darkmode/calendarimg.png";

export default function StudentMenu() {
  const navigate = useNavigate();
  const isTeacher = useSelector((state) => state.appAuth.role) === "teacher";
  const { classAndSectionData, classAndSectionDataOfTeacher } = useSelector(
    (state) => state.appAuth
  );
  const isDarkMode = useSelector((state) => state.appConfig.isDarkMode);
  const [loading, setLoading] = useState(false);
  // const [t] = useTranslation();
  // console.log(classAndSectionData);

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
              {isTeacher
                ? `${classAndSectionDataOfTeacher?.className} ${classAndSectionDataOfTeacher?.sectionName}`
                : `${classAndSectionData?.className} ${classAndSectionData?.sectionName}`}
            </div>
          </div>
          <div className="flex mt-5 ">
            {/* student section */}
            <div
              onClick={() => {
                isTeacher
                  ? navigate("/student-menu/student-section")
                  : navigate("/class-setup/student-menu/student-section");
              }}
              className="size-[162px] cursor-pointer bg-[#0A81D11A] rounded-[14px] flex flex-col justify-around items-center "
            >
              <img
                src={classroom}
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
                isTeacher
                  ? navigate("/student-menu/attendance")
                  : navigate("/class-setup/student-menu/attendance");
              }}
              className="size-[162px] bg-[#0A81D11A] ml-5 rounded-[14px] flex flex-col justify-around items-center  "
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
            <div className="size-[162px] bg-[#0A81D11A] ml-5 rounded-[14px] flex flex-col justify-around items-center  ">
              <img
                src={calendar}
                alt="classroom"
                className="size-16 object-contain"
              />
              <p className="text-base font-normal text-textPrimary">Calendar</p>
            </div>
            {/* subjects */}
            <div
              onClick={() => {
                isTeacher
                  ? navigate("/student-menu/subjects")
                  : navigate("/class-setup/student-menu/subjects");
              }}
              className="size-[162px] bg-[#0A81D11A] ml-5 rounded-[14px] flex flex-col justify-around items-center  "
            >
              <img
                src={calendar}
                alt="classroom"
                className="size-16 object-contain"
              />
              <p className="text-base font-normal text-textPrimary">Subjects</p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
