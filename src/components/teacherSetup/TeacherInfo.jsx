import React from "react";
import profileEmpty from "../../assets/images/profileEmpty.png";
import cross from "../../assets/images/cross.png";
import CONSTANT from "../../utils/constants";
import { useTranslation } from "react-i18next";

export default function TeacherInfo({ currTeacher, modelOpen }) {
  const [t] = useTranslation();

  // teacher details
  const personalDetails = [
    [
      t("labels.fullName"),
      `${currTeacher?.firstname} ${currTeacher?.lastname}`,
    ],
    [
      t("labels.university"),
      `${currTeacher?.section?.classId?.name || ""} ${
        currTeacher?.section?.name || CONSTANT.NA
      }`,
    ],
    [t("labels.gender"), currTeacher?.gender || CONSTANT.NA],
    [t("labels.bloodGroup"), currTeacher?.bloodGroup || CONSTANT.NA],
    [t("labels.dob"), currTeacher?.dob || CONSTANT.NA],
    [t("labels.email"), currTeacher?.email || CONSTANT.NA],
    [t("labels.phoneNumber"), currTeacher?.phone || CONSTANT.NA],
  ];

  const educationDetails = [
    [t("labels.university"), currTeacher?.university || CONSTANT.NA],
    [t("labels.degree"), currTeacher?.degree || CONSTANT.NA],
  ];

  return (
    <>
      <div className="fixed inset-0 flex justify-center items-end pb-5 bg-gray-900 bg-opacity-50 z-50">
        <div className="relative flex flex-col w-[80%] max-h-[90vh] bg-white rounded-lg shadow-lg overflow-hidden">
          <div
            className="absolute top-3 right-3 cursor-pointer"
            onClick={() => modelOpen(false)}
          >
            <img className="h-10 w-10" src={cross} alt="Close" />
          </div>
          <div className="flex flex-col md:flex-row overflow-y-auto">
            <div className="w-full md:w-2/3 p-6">
              <h2 className="text-2xl font-bold mb-4">
                {t("titles.teacherDetails")}
              </h2>
              <h3 className="pb-2 font-bold">
                {t("titles.teacherPersonalDetails")}
              </h3>
              <div className="pb-6 font-medium">
                {personalDetails.map(([label, value], index) => (
                  <div className="flex pb-2" key={index}>
                    <p className="w-1/3">{label}</p>
                    <p className="w-1/5">-</p>
                    <p className="w-1/3 font-poppins-bold">{value}</p>
                  </div>
                ))}
              </div>
              <h3 className="pb-2 font-bold">{t("titles.educationDetails")}</h3>
              <div className="font-medium">
                {educationDetails.map(([label, value], index) => (
                  <div className="flex pb-2" key={index}>
                    <p className="w-1/3">{label}</p>
                    <p className="w-1/5">-</p>
                    <p className="w-1/3 font-poppins-bold">{value}</p>
                  </div>
                ))}
              </div>
            </div>
            <div className="flex justify-center items-center w-full md:w-1/3 pr-10">
              <img
                className="h-[370px] w-[300px] object-contain"
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
