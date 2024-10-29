import React, { useState } from "react";
import { Toaster } from "react-hot-toast";
import Spinner from "../Spinner";
import { useTranslation } from "react-i18next";

export default function Requests() {
  const { t } = useTranslation();
  const [requests, setRequests] = useState([
    {
      classTeacherName: "John Doe",
      className: "5th Grade",
      resetBefore: 2,
      status: "pending",
      otp: "",
    },
    {
      classTeacherName: "Jane Smith",
      className: "6th Grade",
      resetBefore: 5,
      status: "approved",
      otp: "123456",
    },
    {
      classTeacherName: "Michael Lee",
      className: "7th Grade",
      resetBefore: 1,
      status: "rejected",
      otp: "",
    },
  ]);
  const [selectedTab, setSelectedTab] = useState("all");
  const [loading, setLoading] = useState(false);
  const isDarkMode = false; // Change this according to your theme logic

  const handleApprove = (index) => {
    const newRequests = [...requests];
    newRequests[index].status = "approved";
    newRequests[index].otp = Math.floor(
      100000 + Math.random() * 900000
    ).toString(); // Generate a 6-digit OTP
    setRequests(newRequests);
  };

  const handleReject = (index) => {
    const newRequests = [...requests];
    newRequests[index].status = "rejected";
    newRequests[index].otp = ""; // Clear the OTP on rejection
    setRequests(newRequests);
  };

  const filteredRequests =
    selectedTab === "all"
      ? requests
      : requests.filter((req) => req.status === selectedTab);

  return (
    <>
      {/* Loading spinner */}
      {loading && (
        <div className="fixed inset-0 flex items-center justify-center bg-white bg-opacity-50 z-30">
          <Spinner />
        </div>
      )}
      <div className="bg-[#f3f3ff] px-6 py-10">
        <div
          className={`${
            isDarkMode ? "bg-[#0D192F] text-white" : "bg-white "
          } min-h-screen  rounded-[16px]`}
        >
          {/* Toast notifications */}
          <Toaster position="top-center" reverseOrder={false} />
          <div>
            <div className="text-4xl font-poppins-bold pl-12 py-5">
              {t("titles.passwordReset")}
            </div>

            {/* Tabs for All, Approved, Rejected */}
            <div className="flex space-x-4 mt-4 pl-12">
              <div
                className={`cursor-pointer text-xs text-[#040320] font-poppins font-semibold w-[75px] text-center ${
                  selectedTab === "all"
                    ? "pb-3 border-b-[3px] border-[#4834d4]"
                    : ""
                }`}
                onClick={() => setSelectedTab("all")}
              >
                {t("labels.all")}
              </div>
              <div
                className={`cursor-pointer text-xs text-[#040320] font-poppins font-semibold w-[75px] text-center ${
                  selectedTab === "approved"
                    ? "pb-3 border-b-[3px] border-[#4834d4]"
                    : ""
                }`}
                onClick={() => setSelectedTab("approved")}
              >
                {t("labels.approved")}
              </div>
              <div
                className={`cursor-pointer text-xs text-[#040320] font-poppins font-semibold w-[75px] text-center ${
                  selectedTab === "rejected"
                    ? "pb-3 border-b-[3px] border-[#4834d4]"
                    : ""
                }`}
                onClick={() => setSelectedTab("rejected")}
              >
                {t("labels.rejected")}
              </div>
            </div>
            <hr className="border-[#9391A5BF] mx-10 -translate-y-[1px]" />

            {/* Request list table */}
            <div className="overflow-x-auto mt-6">
              <table className={`w-full shadow-md overflow-hidden`}>
                <thead>
                  {/* Table headings */}
                  <tr>
                    <th className="p-4 text-base font-poppins-bold text-gray-600">
                      {t("labels.classTeacher")}
                    </th>
                    <th className="p-4 text-base font-poppins-bold  text-gray-600">
                      {t("labels.class")}
                    </th>
                    <th className="p-4 text-base font-poppins-bold text-gray-600">
                      {t("labels.resetBefore")}
                    </th>
                    <th className="p-4 text-base font-poppins-bold text-gray-600">
                      {t("labels.action")}
                    </th>
                    <th className="p-4 text-base font-poppins-bold text-gray-600">
                      {t("labels.otp")}
                    </th>
                  </tr>
                </thead>
                <tbody className="text-sm font-normal text-gray-900">
                  {filteredRequests.map((req, index) => (
                    <tr
                      className={`${index % 2 === 0 ? "bg-[#4645900D]" : ""}`}
                      key={index}
                    >
                      {/* Class Teacher Name */}
                      <td className="p-4 text-sm font-poppins-bold text-center">
                        <div>{req.classTeacherName}</div>
                      </td>
                      {/* Class Name */}
                      <td className="p-4 text-sm font-poppins-bold text-center">
                        <div>{req.className}</div>
                      </td>
                      {/* Reset Before (in days) */}
                      <td className="p-4 text-sm font-poppins-bold text-center">
                        <div>{req.resetBefore}</div>
                      </td>
                      {/* Actions (Approve/Reject) */}
                      <td className="pl-3 pr-5 py-2 text-sm font-poppins-bold ">
                        {req.status === "pending" ? (
                          <div className="flex justify-center text-center gap-3">
                            <button
                              onClick={() => handleApprove(index)}
                              className="text-green-500 font-poppins-bold text-center"
                            >
                              approve
                            </button>
                            <button
                              onClick={() => handleReject(index)}
                              className="text-red-500 font-poppins-bold text-center"
                            >
                              reject
                            </button>
                          </div>
                        ) : (
                          <div className="font-poppins-bold text-center">
                            {req.status}
                          </div>
                        )}
                      </td>
                      {/* OTP */}
                      <td className="px-5">
                        <div className="h-[35px] border border-[rgba(104, 104, 104, 0.25)] rounded-[10px] flex justify-center items-center">
                          <div className="text-sm font-poppins-bold">
                            {req.otp}
                          </div>
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        </div>
      </div>
    </>
  );
}
