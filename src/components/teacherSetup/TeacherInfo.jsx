import React from "react";
import teacher from "../../assets/images/teacher.png";
import cross from "../../assets/images/cross.png";

export default function TeacherInfo({ currTeacher, modelOpen }) {
  console.log(currTeacher);
  const personalDetails = [
    ["Full Name", `${currTeacher.firstname} ${currTeacher.lastname}`],
    ["Class and Section", `${currTeacher.section.classId.name || ""} ${currTeacher.section.name||"NA"}`],
    ["Gender", currTeacher.gender || "NA"],
    ["Blood Group", currTeacher.bloodGroup || "NA"],
    ["Date of birth", currTeacher.dob || "NA"],
    ["Email Address", currTeacher.email || "NA"],
    ["Phone Number", currTeacher.phone || "NA"],
  ];

  const educationDetails = [
    ["University", currTeacher.university || "NA"],
    ["Degree", currTeacher.degree || "NA"],
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
              <h2 className="text-2xl font-bold mb-4">Teacher Details</h2>
              <h3 className="pb-2 font-bold">Teacher Personal Details</h3>
              <div className="pb-6 font-medium">
                {personalDetails.map(([label, value], index) => (
                  <div className="flex pb-2" key={index}>
                    <p className="w-1/3">{label}</p>
                    <p className="w-1/5">-</p>
                    <p className="w-1/3 font-poppins-bold">{value}</p>
                  </div>
                ))}
              </div>
              <h3 className="pb-2 font-bold">Education Details</h3>
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
                src={teacher}
                alt="Teacher"
              />
            </div>
          </div>
        </div>
      </div>
    </>
  );
}
