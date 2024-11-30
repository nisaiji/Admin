import React, { useState, useEffect } from "react";
import backIcon from "../assets/images/backIcon.png";
import editw from "../assets/images/editw.png";
import downloadw from "../assets/images/downloadw.png";
import closew from "../assets/images/closew.png";
import { axiosClient } from "../services/axiosClient";
import EndPoints from "../services/EndPoints";
import toast from "react-hot-toast";
import { useSelector } from "react-redux";

export default function AttendancePopup({
  isVisible,
  onClose,
  sectionId,
  classId,
}) {
  const id = useSelector((state) => state.appAuth.id);
  const [isEditable, setIsEditable] = useState(false);
  const [attendanceData, setAttendanceData] = useState([]);
  const [loading, setLoading] = useState(false);
  const date = new Date();

  useEffect(() => {
    if (isVisible) {
      document.body.style.overflow = "hidden"; // Disable scrolling
    } else {
      document.body.style.overflow = ""; // Restore scrolling
    }

    return () => {
      document.body.style.overflow = ""; // Clean up on unmount
    };
  }, [isVisible]);

  const handleEditToggle = () => {
    setIsEditable((prev) => !prev);
  };

  const handleInputChange = (sno, dateIndex, value) => {
    const uppercaseValue = value.slice(0, 1).toUpperCase(); // Ensure single, uppercase letter
    setAttendanceData((prevData) =>
      prevData.map((row) =>
        row.sno === sno
          ? {
              ...row,
              dates: row.dates.map((val, idx) =>
                idx === dateIndex ? uppercaseValue : val
              ),
            }
          : row
      )
    );
  };

  const getCellStyle = (value) => {
    if (value === "P") return "text-[#0F4189]";
    if (value === "A") return "text-[#D91111]";
    return "text-black";
  };

  if (!isVisible) return null;

  // get student api
  const getMonthlyAttendance = async () => {
    try {
      setLoading(true);
      const startTime = new Date(
        date.getFullYear(),
        date.getMonth(),
        1
      ).getTime();
      const endTime = new Date(
        date.getFullYear(),
        date.getMonth() + 1,
        0,
        23,
        59,
        59,
        999
      ).getTime();

      const res = await axiosClient.get(
        `${EndPoints.ADMIN.GET_ATTENDANCE}?admin=${id}&section=${sectionId}&classId=${classId}&startTime=${startTime}&endTime=${endTime}`
      );

      if (res?.statusCode === 200) {
        // setAttendanceData(res?.result?.attendances);
        const attendances = res?.result?.attendances || [];
        // console.log(attendances);
        
        const totalDays = new Date(
          date.getFullYear(),
          date.getMonth() + 1,
          0
        ).getDate();

        // Fill missing days with ""
        const updatedAttendanceData = attendances.map((student) => ({
          ...student,
          attendances: Array.from(
            { length: totalDays },
            (_, i) => student.attendances[i] || "" // Use existing data or fill with ""
          ),
        }));

        setAttendanceData(updatedAttendanceData);
      }
    } catch (e) {
      toast.error(e);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    getMonthlyAttendance();
  }, []);

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 z-40">
      <div className="bg-black bg-opacity-50 h-screen p-4 shadow flex flex-col">
        {/* Header */}
        <div className="flex flex-row justify-between items-center mb-4">
          <div className="flex flex-row items-center">
            <img src={backIcon} alt="" className="w-10 h-10 cursor-pointer" />
            <div className="text-white text-xl mx-4">November 2024</div>
            <img
              src={backIcon}
              alt=""
              className="w-10 h-10 rotate-180 cursor-pointer"
            />
          </div>
          <div className="text-white text-xl">Monthly Attendance</div>
          <div className="flex flex-row">
            {isEditable ? (
              <button
                className="px-4 py-2 text-base font-poppins-regular rounded-full bg-white "
                onClick={handleEditToggle}
              >
                Save
              </button>
            ) : (
              <>
                <img
                  src={editw}
                  alt=""
                  className="w-10 h-10 cursor-pointer"
                  onClick={handleEditToggle}
                />
                <img
                  src={downloadw}
                  alt=""
                  className="w-10 h-10 mx-4 cursor-pointer"
                />
              </>
            )}
            <img
              src={closew}
              alt=""
              className="w-10 h-10 cursor-pointer"
              onClick={onClose}
            />
          </div>
        </div>

        {/* Table */}
        <div className="overflow-x-auto bg-white p-4 h-[550px] overflow-y-auto">
          <div className="text-2xl font-poppins-regular text-center w-full">
            Monthly Attendance Sheet
          </div>
          <div className="text-xl font-poppins-regular text-[#686868] text-center w-full my-2">
            November 2024
          </div>
          <table className="w-full text-center border border-gray-300">
            <thead className="sticky -top-4 bg-white z-10">
              <tr>
                <th className="border border-gray-300 p-1">S.No</th>
                <th className="border border-gray-300 p-1 w-[150px]">
                  Student Name
                </th>
                {Array.from({ length: 31 }, (_, i) => (
                  <th key={i} className="border border-gray-300 p-1 w-[35px]">
                    {i + 1}
                  </th>
                ))}
              </tr>
            </thead>
            <tbody>
              {attendanceData.map((data, index) => (
                <tr key={index}>
                  <td className="border border-gray-300 p-1">{index+1}</td>
                  <td className="border border-gray-300 p-1">
                    {data?.firstname || ""} {data?.lastname || ""}
                  </td>
                  {data.attendances.map((value, idx) => (
                    <td key={idx} className="border border-gray-300">
                      {isEditable ? (
                        <select
                          name="attendance"
                          value={value}
                          onChange={(e) =>
                            handleInputChange(index, idx, e.target.value)
                          }
                          className={`w-full text-center bg-transparent uppercase focus:outline-none ${
                            value === "P"
                              ? "text-[#0F4189]"
                              : value === "A"
                              ? "text-[#D91111]"
                              : "text-black"
                          }`}
                        >
                          <option value="" label="" />
                          <option value="-" label="-" />
                          <option
                            value="P"
                            label="P"
                            className="text-[#0F4189]"
                          />
                          <option
                            value="A"
                            label="A"
                            className="text-[#D91111]"
                          />
                        </select>
                      ) : (
                        <div
                          className={`w-full text-center focus:outline-none bg-transparent uppercase ${getCellStyle(
                            value
                          )}`}
                        >
                          {value}
                        </div>
                      )}
                    </td>
                  ))}
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
