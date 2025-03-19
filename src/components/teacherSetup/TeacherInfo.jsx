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
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black bg-opacity-50 p-4">
      <div className="relative bg-white rounded-lg shadow-xl w-full max-w-3xl max-h-full overflow-auto">
        {/* Header */}
        <div className="flex items-center justify-between border-b px-4 py-3">
          <h2 className="text-xl font-bold">{t("titles.teacherDetails")}</h2>
          <button onClick={() => modelOpen(false)} aria-label="Close">
            <img src={cross} alt="Close" className="h-6 w-6" />
          </button>
        </div>

        {/* Content */}
        <div className="p-5 flex flex-col lg:flex-row gap-6">
          <div className="flex-1">
            <section>
              <h3 className="text-lg font-semibold mb-2">
                {t("titles.teacherPersonalDetails")}
              </h3>
              <div className="space-y-2">
                {personalDetails.map(([label, value], index) => (
                  <div
                    key={index}
                    className="flex justify-between border-b pb-1"
                  >
                    <span className="font-medium text-gray-700">{label}</span>
                    <span className="text-gray-900">{value}</span>
                  </div>
                ))}
              </div>
            </section>

            <section className="mt-5">
              <h3 className="text-lg font-semibold mb-2">
                {t("titles.educationDetails")}
              </h3>
              <div className="space-y-2">
                {educationDetails.map(([label, value], index) => (
                  <div
                    key={index}
                    className="flex justify-between border-b pb-1"
                  >
                    <span className="font-medium text-gray-700">{label}</span>
                    <span className="text-gray-900">{value}</span>
                  </div>
                ))}
              </div>
            </section>
          </div>

          {/* Teacher Photo */}
          <div className="flex-shrink-0 flex items-center justify-center">
            <img
              className="h-40 w-40 object-cover rounded-full border border-gray-300"
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
