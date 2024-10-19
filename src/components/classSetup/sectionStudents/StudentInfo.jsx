import React, { useRef } from "react";
import profileEmpty from "../../../assets/images/profileEmpty.png";
import cross from "../../../assets/images/cross.png";
import html2canvas from "html2canvas";
import { useTranslation } from "react-i18next";
import CONSTANT from "../../../utils/constants";

export default function StudentInfo({ currStudent, modelOpen }) {
  const [t] = useTranslation();
  const captureRef = useRef(null);

  // print schema
  const handleScreenshot = () => {
    const hiddenContainer = document.createElement("div");
    hiddenContainer.style.position = "fixed";
    hiddenContainer.style.width = "500px";
    hiddenContainer.style.backgroundColor = "white";
    hiddenContainer.style.zIndex = "-1";

    const clonedNode = captureRef.current.cloneNode(true);

    const imageContainer = document.createElement("div");
    imageContainer.style.position = "absolute";
    imageContainer.style.top = "100px";
    imageContainer.style.right = "50px";
    imageContainer.style.width = "100px";
    imageContainer.style.height = "130px";
    imageContainer.style.border = "1px solid black";
    imageContainer.style.overflow = "hidden";
    imageContainer.style.backgroundColor = "white";

    const imageElement = document.createElement("img");
    imageElement.src = currStudent?.photo
      ? `data:image/jpeg;base64,${currStudent?.photo}`
      : profileEmpty;
    imageElement.style.width = "100px";
    imageElement.style.height = "130px";
    imageElement.style.objectFit = "cover";

    imageContainer.appendChild(imageElement);
    clonedNode.style.position = "relative";
    clonedNode.appendChild(imageContainer);
    hiddenContainer.appendChild(clonedNode);
    document.body.appendChild(hiddenContainer);

    const largeImage = clonedNode.querySelector('img[id="StudentInfoImage"]');
    if (largeImage) {
      largeImage.style.display = "none";
    }

    html2canvas(clonedNode, {
      scrollY: -window.scrollY,
      useCORS: true,
      scale: 2,
    }).then((canvas) => {
      const imgData = canvas.toDataURL("image/png");
      const link = document.createElement("a");
      link.href = imgData;
      link.download = "student_info.png";
      link.click();

      document.body.removeChild(hiddenContainer);
    });
  };

  // student details
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

  // parent details
  const guardianDetails = [
    [t("labels.fullName"), currStudent?.parentDetails?.fullname || CONSTANT.NA],
    [t("labels.gender"), currStudent?.parentDetails?.gender || CONSTANT.NA],
    [t("labels.age"), currStudent?.parentDetails?.age || CONSTANT.NA],
    [t("labels.email"), currStudent?.parentDetails?.email || CONSTANT.NA],
    [t("labels.phoneNumber"), currStudent?.parentDetails?.phone || CONSTANT.NA],
    [
      t("labels.qualification"),
      currStudent?.parentDetails?.qualification || CONSTANT.NA,
    ],
    [
      t("labels.occupation"),
      currStudent?.parentDetails?.occupation || CONSTANT.NA,
    ],
    [t("labels.address"), currStudent?.parentDetails?.address || CONSTANT.NA],
  ];

  return (
    <>
      <div className="fixed inset-0 z-50 flex justify-center items-end pb-5 bg-gray-900 bg-opacity-50">
        <div className="relative flex flex-col w-[80%] h-4/5 bg-white rounded-lg shadow-lg overflow-hidden">
          <div
            className="absolute top-3 right-5 cursor-pointer"
            onClick={() => modelOpen(false)}
          >
            <img className="h-10 w-10" src={cross} alt="close" />
          </div>
          <div
            ref={captureRef}
            className="flex flex-col lg:flex-row overflow-y-auto p-6"
          >
            <div className="w-full">
              <h2 className="text-2xl font-bold mb-4">
                {t("titles.studentDetails")}
              </h2>
              <h3 className="pb-2 font-bold">{t("titles.personalDetails")}</h3>
              <div className="pb-6 font-medium">
                {/* student details */}
                {personalDetails.map(([label, value], index) => (
                  <div className="flex pb-2" key={index}>
                    <p className="w-1/3">{label}</p>
                    <p className="w-1/5">-</p>
                    <p className="w-1/3 font-poppins-bold">{value}</p>
                  </div>
                ))}
              </div>
              <h3 className="pb-2 font-bold">{t("titles.guardianDetails")}</h3>
              <div className="font-medium">
                {/* parent details */}
                {guardianDetails.map(([label, value], index) => (
                  <div className="flex pb-2" key={index}>
                    <p className="w-1/3">{label}</p>
                    <p className="w-1/5">-</p>
                    <p className="w-1/3 font-poppins-bold">{value}</p>
                  </div>
                ))}
              </div>
            </div>
            <div className="flex justify-center items-center w-full mt-32">
              <img
                id="StudentInfoImage"
                className="h-[370px] w-[300px] object-center"
                src={
                  currStudent?.photo
                    ? `data:image/jpeg;base64,${currStudent?.photo}`
                    : profileEmpty
                }
                alt={t("titles.student")}
              />
            </div>
          </div>
          {/* screenshot button */}
          <div className="flex justify-center mt-5 space-x-5">
            <button
              className="px-4 py-2 bg-green-500 text-white rounded"
              onClick={handleScreenshot}
            >
              {t("buttons.screenshot")}
            </button>
          </div>
        </div>
      </div>
    </>
  );
}
