import React, { useEffect } from "react";
import profileEmpty from "../../assets/images/profileEmpty.png";
import cross from "../../assets/images/cross.png";
import CONSTANT from "../../utils/constants";
import { useTranslation } from "react-i18next";

export default function TeacherInfo({ currTeacher, modelOpen }) {
  const [t] = useTranslation();

  useEffect(() => {
    document.body.style.overflow = modelOpen ? "hidden" : "auto";
    return () => {
      document.body.style.overflow = "auto";
    };
  }, [modelOpen]);

  /**
   * A modal component to display detailed information about a teacher.
   *
   * @param {Object} currTeacher - Current teacher's details.
   * @param {Function} modelOpen - Function to toggle the modal visibility.
   *
   * @returns {JSX.Element} Teacher information modal component.
   */
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
    <>
      <div className="fixed inset-0 flex items-center justify-center bg-gray-900 bg-opacity-50 z-50 p-4">
        <div className="relative bg-white rounded-lg shadow-xl overflow-hidden w-full max-w-3xl">
          <div
            className="absolute top-4 right-4 cursor-pointer text-gray-600 hover:text-gray-800"
            onClick={() => modelOpen(false)}
          >
            <img className="h-10 w-10" src={cross} alt="Close" />
          </div>
          <div className="flex flex-col md:flex-row overflow-y-auto">
            <div className="w-full md:w-2/3 p-6">
              <h2 className="text-2xl font-bold mb-4">
                {t("titles.teacherDetails")}
              </h2>
              <div className="mb-6">
                <h3 className="text-xl font-semibold mb-2">
                  {t("titles.teacherPersonalDetails")}
                </h3>
                <div className="space-y-2">
                  {personalDetails.map(([label, value], index) => (
                    <div className="flex" key={index}>
                      <span className="w-1/3 font-medium text-gray-700">
                        {label}:
                      </span>
                      <span className="w-2/3 font-semibold text-gray-900">
                        {value}
                      </span>
                    </div>
                  ))}
                </div>
              </div>
              <div>
                <h3 className="text-xl font-semibold mb-2">
                  {t("titles.educationDetails")}
                </h3>
                <div className="space-y-2">
                  {educationDetails.map(([label, value], index) => (
                    <div className="flex" key={index}>
                      <span className="w-1/3 font-medium text-gray-700">
                        {label}:
                      </span>
                      <span className="w-2/3 font-semibold text-gray-900">
                        {value}
                      </span>
                    </div>
                  ))}
                </div>
              </div>
            </div>
            <div className="md:w-1/3 p-6 flex items-center justify-center border-t md:border-t-0 md:border-l border-gray-200">
              <img
                className="h-[200px] w-[200px] object-contain"
                src={
                  currTeacher?.photo
                    ? `data:image/jpeg;base64,${currTeacher?.photo}`
                    : profileEmpty
                }
                alt="Teacher"
              />
            </div>
          </div>
        </div>
      </div>
    </>
  );
}
