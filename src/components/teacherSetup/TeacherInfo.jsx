import React, { useEffect } from "react";
import profileEmpty from "../../assets/images/profileEmpty.png";
import cross from "../../assets/images/darkmode/cross.png";
import crossw from "../../assets/images/cross.png";
import CONSTANT from "../../utils/constants";
import { useTranslation } from "react-i18next";
import { useSelector } from "react-redux";

export default function TeacherInfo({ currTeacher, modelOpen }) {
  const [t] = useTranslation();
  const isDarkMode = useSelector((state) => state.appConfig.isDarkMode);

  useEffect(() => {
    document.body.style.overflow = modelOpen ? "hidden" : "auto";
    return () => {
      document.body.style.overflow = "auto";
    };
  }, [modelOpen]);

  const personalDetails = [
    [
      t("labels.fullName"),
      `${currTeacher?.firstname} ${currTeacher?.lastname}`,
    ],
    [
      t("labels.class"),
      `${currTeacher?.section?.classId?.name || ""} ${
        currTeacher?.section?.name || CONSTANT.NA
      }`,
    ],
    [t("labels.gender"), currTeacher?.gender || CONSTANT.NA],
    [t("labels.bloodGroup"), currTeacher?.bloodGroup || CONSTANT.NA],
    [t("labels.dob"), currTeacher?.dob || CONSTANT.NA],
    [t("labels.email"), currTeacher?.email || CONSTANT.NA],
    [t("labels.phoneNumber"), currTeacher?.phone || CONSTANT.NA],
    [t("labels.username"), currTeacher?.username || CONSTANT.NA],
    [t("labels.address"), currTeacher?.address || CONSTANT.NA],
  ];

  const educationDetails = [
    [t("labels.university"), currTeacher?.university || CONSTANT.NA],
    [t("labels.degree"), currTeacher?.degree || CONSTANT.NA],
  ];

  return (
    <div
      className={`fixed inset-0 z-50 flex items-center justify-center bg-opacity-50 p-4 ${
        isDarkMode ? "bg-backgroundTableCell" : "bg-background"
      }`}
    >
      <div
        className={`relative rounded-lg shadow-xl w-full max-w-3xl max-h-full overflow-auto ${
          isDarkMode ? "bg-background" : "bg-whiteBackground"
        }`}
      >
        {/* Header */}
        <div className={`flex items-center justify-between border-b border-borderLine px-8 py-3`}>
          <h2
            className={`text-xl font-bold  ${
              isDarkMode ? "text-textPrimary" : "text-textBlack"
            }`}
          >
            {t("titles.teacherDetails")}
          </h2>
          <button onClick={() => modelOpen(false)} aria-label="Close">
            <img
              src={isDarkMode ? cross : crossw}
              alt="Close"
              className={`${isDarkMode ? "h-4 w-4" : "h-7 w-7"}`}
            />
          </button>
        </div>

        {/* Content */}
        <div className={`py-5 px-12 flex flex-col lg:flex-row gap-6`}>
          <div className={`flex-1`}>
            <section>
              <h3
                className={`text-lg font-semibold mb-2 ${
                  isDarkMode ? "text-textPrimary" : "text-textBlack"
                }`}
              >
                {t("titles.teacherPersonalDetails")}
              </h3>
              <div className={`space-y-2`}>
                {personalDetails.map(([label, value], index) => (
                  <div
                    key={index}
                    className={`flex justify-between border-b border-borderLine pb-1`}
                  >
                    <span
                      className={`font-medium text-sm ${
                        isDarkMode ? "text-textPrimary" : "text-textGray"
                      }`}
                    >
                      {label}
                    </span>
                    <span
                      className={`text-sm ${
                        isDarkMode ? "text-textPrimary" : "text-textDarkGray"
                      }`}
                    >
                      {value}
                    </span>
                  </div>
                ))}
              </div>
            </section>

            <section className={`mt-5`}>
              <h3
                className={`text-lg font-semibold mb-2 ${
                  isDarkMode ? "text-textPrimary" : "text-textBlack"
                }`}
              >
                {t("titles.educationDetails")}
              </h3>
              <div className={`space-y-2`}>
                {educationDetails.map(([label, value], index) => (
                  <div
                    key={index}
                    className={`flex justify-between border-b border-borderLine pb-1`}
                  >
                    <span
                      className={`font-medium text-sm  ${
                        isDarkMode ? "text-textPrimary" : "text-textGray"
                      }`}
                    >
                      {label}
                    </span>
                    <span
                      className={`text-sm ${
                        isDarkMode ? "text-textPrimary" : "text-textDarkGray"
                      }`}
                    >
                      {value}
                    </span>
                  </div>
                ))}
              </div>
            </section>
          </div>

          {/* Teacher Photo */}
          <div className={`flex-shrink-0 flex items-center justify-center`}>
            <img
              className={`h-60 w-40 object-cover border border-gray-300`}
              src={
                currTeacher?.photo
                  ? `data:image/jpeg;base64,${currTeacher?.photo}`
                  : profileEmpty
              }
              alt={t("titles.teacherDetails")}
            />
          </div>
        </div>
      </div>
    </div>
  );
}
