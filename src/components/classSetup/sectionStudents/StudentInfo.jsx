import React, { useRef } from "react";
import student from "../../../assets/images/student.png";
import cross from "../../../assets/images/cross.png";
import html2canvas from "html2canvas";
import { useReactToPrint } from "react-to-print";
import { useTranslation } from "react-i18next"; // Import useTranslation

export default function StudentInfo({ currStudent, modelOpen }) {
  const { t } = useTranslation(); // Initialize useTranslation hook

  const captureRef = useRef(null);
  const componentRef = useRef();

  const handlePrint = useReactToPrint({
    content: () => componentRef.current,
    documentTitle: t("studentDetails.title"), // Use translation key
  });

  const handleScreenshot = () => {
    const hiddenContainer = document.createElement("div");
    hiddenContainer.style.position = "fixed";
    hiddenContainer.style.width = "500px";
    hiddenContainer.style.backgroundColor = "white";
    hiddenContainer.style.zIndex = "-1";

    const clonedNode = captureRef.current.cloneNode(true);

    // Create a container for the image at the top right
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
    imageElement.src = student;
    imageElement.style.width = "100px";
    imageElement.style.height = "130px";
    imageElement.style.objectFit = "cover";

    imageContainer.appendChild(imageElement);
    clonedNode.style.position = "relative"; // Ensure clonedNode is relative for the absolute positioning of the image container
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

      // Clean up the hidden container
      document.body.removeChild(hiddenContainer);
    });
  };

  const personalDetails = [
    // [t("studentDetails.fields.rollNumber"), currStudent.rollNumber || "NA"],
    [
      t("studentDetails.fields.fullName"),
      `${currStudent.firstname} ${currStudent.lastname}` || "NA",
    ],
    [
      t("studentDetails.fields.classAndSection"),
      `${currStudent.classId.name} ${currStudent.section.name}` || "NA",
    ],
    [t("studentDetails.fields.gender"), currStudent.gender || "NA"],
    [t("studentDetails.fields.bloodGroup"), currStudent.bloodGroup || "NA"],
    [t("studentDetails.fields.dateOfBirth"), currStudent.dob || "NA"],
  ];

  const guardianDetails = [
    [t("studentDetails.fields.fullName"), currStudent.parent.fullname || "NA"],
    [t("studentDetails.fields.gender"), currStudent.parent.gender || "NA"],
    [t("studentDetails.fields.age"), currStudent.parent.age || "NA"],
    [t("studentDetails.fields.email"), "NA"],
    [t("studentDetails.fields.phoneNumber"), currStudent.parent.phone || "NA"],
    [
      t("studentDetails.fields.qualification"),
      currStudent.parent.qualification || "NA",
    ],
    [
      t("studentDetails.fields.occupation"),
      currStudent.parent.occupation || "NA",
    ],
    [t("studentDetails.fields.address"), currStudent.parent.address || "NA"],
  ];

  return (
    <>
      <div className="fixed inset-0 z-50 flex justify-center items-end pb-5 bg-gray-900 bg-opacity-50">
        <div className="relative flex flex-col w-[80%] h-4/5 bg-white rounded-lg shadow-lg overflow-hidden">
          <div
            className="absolute top-3 right-5 cursor-pointer"
            onClick={() => modelOpen(false)}
          >
            <img className="h-10 w-10" src={cross} alt={t("buttons.close")} />
          </div>
          <div
            ref={captureRef}
            className="flex flex-col lg:flex-row overflow-y-auto p-6"
          >
            <div className="w-full">
              <h2 className="text-2xl font-bold mb-4">
                {t("studentDetails.title")}
              </h2>
              <h3 className="pb-2 font-bold">
                {t("studentDetails.personalDetails")}
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
              <h3 className="pb-2 font-bold">
                {t("studentDetails.guardianDetails")}
              </h3>
              <div className="font-medium">
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
                src={student}
                alt={t("studentDetails.fields.student")}
              />
            </div>
          </div>
          <div className="flex justify-center mt-5 space-x-5">
            {/* <button
              className="px-4 py-2 bg-blue-500 text-white rounded"
              onClick={handlePrint}
            >
              {t('studentDetails.buttons.print')}
            </button> */}
            <button
              className="px-4 py-2 bg-green-500 text-white rounded"
              onClick={handleScreenshot}
            >
              {t("studentDetails.buttons.screenshot")}
            </button>
          </div>
        </div>
      </div>
    </>
  );
}
