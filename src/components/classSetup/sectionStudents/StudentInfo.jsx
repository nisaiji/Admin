import React, { useEffect, useRef } from "react";
import profileEmpty from "../../../assets/images/profileEmpty.png";
import cross from "../../../assets/images/cross.png";
import html2canvas from "html2canvas";
import { useTranslation } from "react-i18next";
import CONSTANT from "../../../utils/constants";

/**
 * A modal component to display detailed information about a student.
 *
 * @param {Object} currStudent - Current student's details.
 * @param {Function} modelOpen - Function to toggle the modal visibility.
 *
 * @returns {JSX.Element} Student information modal component.
 */
export default function StudentInfo({ currStudent, modelOpen }) {
  const [t] = useTranslation();
  const captureRef = useRef(null);

  useEffect(() => {
    document.body.style.overflow = modelOpen ? "hidden" : "auto";
    return () => {
      document.body.style.overflow = "auto";
    };
  }, [modelOpen]);

  // Print student information in pdf format.
  const handleScreenshot = () => {
    // Create an off-screen container to hold the cloned content
    const hiddenContainer = document.createElement("div");
    hiddenContainer.style.position = "fixed";
    hiddenContainer.style.width = "768px";
    hiddenContainer.style.backgroundColor = "white";

    // Clone the content in captureRef without changing its layout
    const clonedNode = captureRef.current.cloneNode(true);
    // Append the cloned node to the hidden container
    hiddenContainer.appendChild(clonedNode);
    // Append the container to the body
    document.body.appendChild(hiddenContainer);

    // Use html2canvas to capture the hidden container
    html2canvas(clonedNode, {
      scrollY: -window.scrollY,
      useCORS: true,
    }).then((canvas) => {
      const imgData = canvas.toDataURL("image/png");
      const link = document.createElement("a");
      link.href = imgData;
      link.download = "student_info.png";
      link.click();

      document.body.removeChild(hiddenContainer);
    });
  };

  // Student details array.
  const personalDetails = [
    [
      t("labels.fullName"),
      `${currStudent?.firstname} ${currStudent?.lastname}` || CONSTANT.NA,
    ],
    [
      t("labels.classAndSection"),
      `${currStudent?.classDetails?.name} ${currStudent?.sectionDetails?.name}` ||
        CONSTANT.NA,
    ],
    [t("labels.gender"), currStudent?.gender || CONSTANT.NA],
    [t("labels.bloodGroup"), currStudent?.bloodGroup || CONSTANT.NA],
    [t("labels.dob"), currStudent?.dob || CONSTANT.NA],
    [t("labels.address"), currStudent?.address || CONSTANT.NA],
  ];

  // Guardian details array.
  const guardianDetails = [
    [
      t("labels.guardianName"),
      currStudent?.parentDetails?.fullname || CONSTANT.NA,
    ],
    [t("labels.phoneNumber"), currStudent?.parentDetails?.phone || CONSTANT.NA],
  ];

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black bg-opacity-50 p-4">
      <div className="relative bg-white rounded-lg shadow-xl w-full max-w-3xl max-h-full overflow-auto">
        {/* Header */}
        <div className="flex items-center justify-between border-b px-4 py-3">
          <h2 className="text-xl font-bold">{t("titles.studentDetails")}</h2>
          <button onClick={() => modelOpen(false)} aria-label="Close">
            <img src={cross} alt="close" className="h-6 w-6" />
          </button>
        </div>

        {/* Content */}
        <div ref={captureRef} className="p-6 flex flex-col lg:flex-row gap-6">
          <div className="flex-1">
            <section>
              <h3 className="text-lg font-semibold mb-2">
                {t("titles.personalDetails")}
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

            <section className="mt-6">
              <h3 className="text-lg font-semibold mb-2">
                {t("titles.guardianDetails")}
              </h3>
              <div className="space-y-2">
                {guardianDetails.map(([label, value], index) => (
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

          {/* Student Photo */}
          <div className="flex-shrink-0 flex items-center justify-center">
            <img
              id="StudentInfoImage"
              className="h-60 w-40 object-cover border border-gray-300"
              src={
                currStudent?.photo
                  ? `data:image/jpeg;base64,${currStudent?.photo}`
                  : profileEmpty
              }
              alt={t("titles.student")}
            />
          </div>
        </div>

        {/* Footer */}
        <div className="flex justify-end border-t px-4 py-3">
          <button
            className="px-4 py-2 bg-blue-600 hover:bg-blue-700 transition text-white text-sm font-medium rounded-md"
            onClick={handleScreenshot}
          >
            {t("buttons.screenshot")}
          </button>
        </div>
      </div>
    </div>
  );
}
