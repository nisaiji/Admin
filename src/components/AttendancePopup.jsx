import React, { useState, useEffect } from "react";
import backIcon from "../assets/images/backIcon.png";
import editw from "../assets/images/editw.png";
import downloadw from "../assets/images/downloadw.png";
import closew from "../assets/images/closew.png";
import { axiosClient } from "../services/axiosClient";
import EndPoints from "../services/EndPoints";
import toast from "react-hot-toast";
import { useSelector } from "react-redux";
import jsPDF from "jspdf";
import "jspdf-autotable";
import moment from "moment";

export default function AttendancePopup({
  isVisible,
  onClose,
  sectionId,
  classId,
  className,
  sectionName,
  startTimeForAdmin,
}) {
  const id = useSelector((state) => state.appAuth.id);
  const sectionStartTime = useSelector(
    (state) => state.appAuth.sectionStartTime
  );
  const isTeacher = useSelector((state) => state.appAuth.role) === "teacher";
  const teacherSectionId = useSelector((state) => state.appAuth.section);
  const [isEditable, setIsEditable] = useState(false);
  const [attendanceData, setAttendanceData] = useState([]);
  const [loading, setLoading] = useState(false);
  const [currentDate, setCurrentDate] = useState(new Date());
  const [holidays, setHolidays] = useState({});

  const startTime = isTeacher ? sectionStartTime : startTimeForAdmin;

  if (!isVisible) return null;

  const totalDays = new Date(
    currentDate.getFullYear(),
    currentDate.getMonth() + 1,
    0
  ).getDate();

  const isSundayOrHoliday = (dateIndex) => {
    const date = new Date(
      currentDate.getFullYear(),
      currentDate.getMonth(),
      dateIndex + 1
    );
    const isSunday = date.getDay() === 0;
    const formattedDate = moment(date).format("YYYY-MM-DD");
    return isSunday || holidays[formattedDate];
  };

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

  const changeMonth = (increment) => {
    setCurrentDate((prevDate) => {
      const newDate = new Date(
        prevDate.getFullYear(),
        prevDate.getMonth() + increment,
        1
      );
      const startMonth = new Date(startTime).getMonth();
      const startYear = new Date(startTime).getFullYear();
      const currentMonth = new Date().getMonth();
      const currentYear = new Date().getFullYear();
      // console.log(
      //   newDate.getFullYear() < startYear,
      //   newDate.getMonth() < startMonth,
      //   newDate.getFullYear() > currentYear,
      //   newDate.getMonth() > currentMonth
      // );

      if (
        newDate.getFullYear() < startYear ||
        newDate.getMonth() < startMonth ||
        newDate.getFullYear() > currentYear ||
        newDate.getMonth() > currentMonth
      ) {
        toast.error(
          `You can only change month between the ${moment(startTime).format(
            "MMMM YYYY"
          )} to ${moment().format("MMMM YYYY")}.`
        );
        return prevDate; // Prevent changes beyond allowed range
      }
      return newDate;
    });
  };

  const handleInputChange = (studentIndex, dateIndex, value) => {
    const attendanceDate = new Date(
      currentDate.getFullYear(),
      currentDate.getMonth(),
      dateIndex + 1
    );

    if (
      moment(attendanceDate).valueOf() < startTime ||
      attendanceDate > moment().endOf("days").valueOf()
    ) {
      toast.error(
        `You can only edit attendance between the ${moment(startTime).format(
          "DD/MM/YYYY"
        )} and ${moment().format("DD/MM/YYYY")}.`
      );
      return;
    }
    setAttendanceData((prevData) =>
      prevData.map((student, idx) =>
        idx === studentIndex
          ? {
              ...student,
              attendances: student.attendances.map((attendance, i) =>
                i === dateIndex
                  ? { ...attendance, attendance: value } // Update attendance field
                  : attendance
              ),
            }
          : student
      )
    );
  };

  const handleSaveAttendance = async () => {
    try {
      setLoading(true);
      const attendances = attendanceData;

      // Validate attendance
      const hasEmptyAttendance = attendanceData.some((student) =>
        student.attendances.some((item) => {
          const itemDate = item.date;
          const startDate = moment(startTime).format("YYYY-MM-DD");
          const today = moment(new Date()).format("YYYY-MM-DD");

          // console.log(
          //   item.attendance === "" && itemDate >= startDate && itemDate <= today
          // );

          // Check if attendance is empty for dates within the range
          return (
            item?.attendance === "" &&
            itemDate >= startDate &&
            itemDate <= today
          );
        })
      );

      if (hasEmptyAttendance) {
        toast.error("Please fill all the cells to save the attendance");
        return;
      }

      const studentsAttendances = {};
      attendances.forEach((student) => {
        student.attendances.forEach((item) => {
          const date = new Date(item.date).getTime();

          if (!studentsAttendances[date]) {
            studentsAttendances[date] = [];
          }

          studentsAttendances[date].push({
            student: student._id,
            attendance:
              item?.attendance === "P"
                ? "present"
                : item?.attendance === "A"
                ? "absent"
                : "",
          });
        });
      });
      const url = isTeacher
        ? `${EndPoints.TEACHER.UPDATE_ATTENDANCE}/${teacherSectionId}`
        : `${EndPoints.ADMIN.UPDATE_ATTENDANCE}/${sectionId}`;
      // API call
      const res = await axiosClient.post(url, { studentsAttendances });

      if (res.statusCode === 200) {
        toast.success(res?.result);
        setIsEditable(false);
        fetchMonthlyAttendance();
      }
    } catch (e) {
      toast.error(e);
    } finally {
      setLoading(false);
    }
  };

  const getCellStyle = (value) => {
    if (value === "P") return "text-[#0F4189]";
    if (value === "A" || value === "H") return "text-[#D91111]";
    return "text-black";
  };

  // get student api
  const fetchMonthlyAttendance = async () => {
    try {
      setLoading(true);
      const startTime = new Date(
        currentDate.getFullYear(),
        currentDate.getMonth(),
        1
      ).getTime();
      const endTime = new Date(
        currentDate.getFullYear(),
        currentDate.getMonth() + 1,
        0,
        23,
        59,
        59,
        999
      ).getTime();
      // console.log("start");
      const url = isTeacher
        ? `${EndPoints.TEACHER.GET_ATTENDANCE}?section=${teacherSectionId}&startTime=${startTime}&endTime=${endTime}`
        : `${EndPoints.ADMIN.GET_ATTENDANCE}?admin=${id}&section=${sectionId}&classId=${classId}&startTime=${startTime}&endTime=${endTime}`;
      const res = await axiosClient.get(url);
      // console.log(res?.result);

      if (res?.statusCode === 200) {
        const attendances = res?.result?.attendances || [];

        const updatedAttendanceData = attendances.map((student) => {
          // Create a map of attendance data by date
          const attendanceByDate = student.attendances.reduce((acc, item) => {
            acc[item.date] =
              item.teacherAttendance === "present"
                ? "P"
                : item.teacherAttendance === "absent"
                ? "A"
                : "";
            return acc;
          }, {});

          // Generate an array for all days in the month
          const monthDates = Array.from({ length: totalDays }, (_, i) => {
            const dateKey = moment(
              new Date(currentDate.getFullYear(), currentDate.getMonth(), i + 1)
            ).format("YYYY-MM-DD");

            return {
              date: dateKey,
              attendance:
                dateKey in holidays || new Date(dateKey).getDay() === 0
                  ? "H"
                  : attendanceByDate[dateKey] || "",
            };
          });
          // console.log({monthDates});

          return {
            ...student,
            attendances: monthDates,
          };
        });
        // console.log({ updatedAttendanceData });

        setAttendanceData(updatedAttendanceData);
      }
    } catch (e) {
      toast.error(e);
    } finally {
      setLoading(false);
    }
  };

  // get events api
  const fetchEvents = async () => {
    setLoading(true);
    try {
      const res = await axiosClient.post(EndPoints.COMMON.GET_EVENTS, {
        startTime: new Date(
          currentDate.getFullYear(),
          currentDate.getMonth(),
          1
        ).getTime(),
        endTime: new Date(
          currentDate.getFullYear(),
          currentDate.getMonth() + 1,
          0,
          23,
          59,
          59,
          999
        ).getTime(),
      });

      if (res?.statusCode === 200) {
        const holidayMap = res?.result?.reduce((acc, item) => {
          acc[moment(item.date).format("YYYY-MM-DD")] = true;
          return acc;
        }, {});
        setHolidays(holidayMap);
      }
    } catch (e) {
      toast.error(e);
    } finally {
      setLoading(false);
    }
  };

  // Trigger fetchMonthlyAttendance when holidays update
  useEffect(() => {
    fetchMonthlyAttendance();
  }, [holidays]);

  useEffect(() => {
    fetchEvents();
  }, [currentDate]);

  // attendance download in pdf format
  const downloadAttendance = () => {
    const doc = new jsPDF();

    // Title
    const title = `${className}-${sectionName} Monthly Attendance ${currentDate.toLocaleString(
      "default",
      {
        month: "long",
      }
    )} ${currentDate.getFullYear()}`;
    doc.setFontSize(16);
    doc.text(title, 14, 20);

    // Table headers
    const headers = [
      "S.No",
      "Student Name",
      ...Array.from({ length: totalDays }, (_, i) => i + 1),
    ];

    // Table rows
    const rows = attendanceData.map((student, index) => [
      index + 1,
      `${student?.firstname || ""} ${student?.lastname || ""}`,
      ...student?.attendances.map((item) => item.attendance || ""),
    ]);

    // Add table to PDF
    doc.autoTable({
      margin: { left: 1, right: 1 },
      startY: 30,
      head: [headers],
      body: rows,
      styles: {
        fontSize: 7,
        lineWidth: 0.01,
        lineColor: [0, 0, 0],
        textColor: [0, 0, 0],
        fillColor: [255, 255, 255],
      },
      headStyles: {
        textColor: [0, 0, 0],
        fillColor: [255, 255, 255],
        lineWidth: 0.01,
        lineColor: [0, 0, 0],
      },
      alternateRowStyles: { fillColor: [255, 255, 255] },
      columnStyles: {
        0: { cellWidth: 7 }, // S.No
        1: { cellWidth: 15 }, // Student Name
        ...Array.from({ length: totalDays }, (_, i) => ({
          [i + 2]: { cellWidth: 6 }, // date
        })).reduce((acc, style) => Object.assign(acc, style), {}),
      },
      didParseCell: (data) => {
        if (data.section === "body" && data.column.index > 1) {
          const cellValue = data.cell.raw; // Get cell value
          if (cellValue === "P") {
            data.cell.styles.textColor = "#0F4189"; // Blue for "P"
          } else if (cellValue === "A" || cellValue === "H") {
            data.cell.styles.textColor = "#D91111"; // Red for "A"
          }
        }
      },
    });

    // Save PDF
    doc.save(
      `Attendance_${className}_${sectionName}_${currentDate.getFullYear()}_${
        currentDate.getMonth() + 1
      }.pdf`
    );
  };

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 z-40">
      <div className="bg-black bg-opacity-50 h-screen p-4 shadow flex flex-col">
        {/* Header */}
        <div className="flex flex-row justify-between items-center mb-4">
          <div className="flex flex-row justify-between items-center w-[260px]">
            <img
              src={backIcon}
              alt="Previous Month"
              className="w-10 h-10 cursor-pointer"
              onClick={() =>
                isEditable
                  ? toast.error(
                      "please save the data before changing the month"
                    )
                  : changeMonth(-1)
              }
            />
            <div className="text-white text-xl mx-4">
              {currentDate.toLocaleString("default", { month: "long" })}{" "}
              {currentDate.getFullYear()}
            </div>
            <img
              src={backIcon}
              alt="Next Month"
              className="w-10 h-10 rotate-180 cursor-pointer"
              onClick={() =>
                isEditable
                  ? toast.error(
                      "please save the data before changing the month"
                    )
                  : changeMonth(1)
              }
            />
          </div>
          <div className="text-white text-xl">Monthly Attendance</div>
          <div className="flex flex-row w-[270px] justify-end">
            {isEditable ? (
              <button
                className="px-4 py-2 text-base font-poppins-regular rounded-full bg-white "
                onClick={handleSaveAttendance}
              >
                Save
              </button>
            ) : (
              <>
                <img
                  src={editw}
                  alt=""
                  className="w-10 h-10 cursor-pointer"
                  onClick={() => setIsEditable(true)}
                />
                <img
                  onClick={downloadAttendance}
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
            {currentDate.toLocaleString("default", { month: "long" })}{" "}
            {currentDate.getFullYear()}
          </div>
          <table className="w-full text-center border border-gray-300">
            <thead className="sticky -top-4 bg-white z-10">
              <tr>
                <th className="border border-gray-300 w-[30px] p-1 font-poppins-regular">
                  S.No
                </th>
                <th className="border border-gray-300 p-1 w-[150px] font-poppins-regular">
                  Student Name
                </th>
                {Array.from({ length: totalDays }, (_, i) => (
                  <th key={i} className="relative">
                    <div className={`flex flex-col items-center`}>
                      <span>{i + 1}</span>
                    </div>
                  </th>
                ))}
                <th className="border border-gray-300 p-1 w-[50px] font-poppins-regular">
                  Total Attendance
                </th>
              </tr>
            </thead>
            <tbody>
              {attendanceData.map((data, index) => {
                const totalPresent = data.attendances.filter(
                  (a) => a.attendance === "P"
                ).length;
                const totalAbsent = data.attendances.filter(
                  (a) => a.attendance === "A"
                ).length;
                return (
                  <tr key={index}>
                    <td className="border border-gray-300 p-1">{index + 1}</td>
                    <td className="border border-gray-300 p-1">
                      {data?.firstname || ""} {data?.lastname || ""}
                    </td>
                    {data.attendances.map((value, idx) => (
                      <td key={idx} className="border border-gray-300">
                        {isEditable ? (
                          <select
                            name="attendance"
                            value={
                              isSundayOrHoliday(idx) ? "H" : value.attendance
                            }
                            disabled={isSundayOrHoliday(idx)}
                            onChange={(e) => {
                              handleInputChange(index, idx, e.target.value);
                            }}
                            className={`w-full h-full m-0 text-center bg-transparent uppercase focus:outline-none focus:ring focus:ring-black ${
                              value?.attendance === "P"
                                ? "text-[#0F4189]"
                                : value?.attendance === "A"
                                ? "text-[#D91111]"
                                : "text-black"
                            }`}
                          >
                            <option value="" label="" />
                            <option
                              value="H"
                              label="H"
                              style={{ display: "none" }}
                            />
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
                              value?.attendance
                            )}`}
                          >
                            {value?.attendance}
                          </div>
                        )}
                      </td>
                    ))}
                    {/* Horizontal totals */}
                    <td className="border border-gray-300 p-1">
                      {totalPresent}/{totalDays}
                    </td>
                  </tr>
                );
              })}
              {/* Vertical totals */}
              <tr>
                <td
                  colSpan="2"
                  className="border border-gray-300 font-bold p-1"
                >
                  Total
                </td>
                {Array.from({ length: totalDays }, (_, dayIndex) => {
                  const totalPresentForDay = attendanceData.filter(
                    (student) =>
                      student.attendances[dayIndex]?.attendance === "P"
                  ).length;
                  const totalAbsentForDay = attendanceData.filter(
                    (student) =>
                      student.attendances[dayIndex]?.attendance === "A"
                  ).length;

                  return (
                    <td key={dayIndex} className="border border-gray-300 p-1">
                      {totalPresentForDay}/{attendanceData?.length || 0}
                    </td>
                  );
                })}
                <td
                  colSpan="2"
                  className="border border-gray-300 font-bold p-1"
                ></td>
              </tr>
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
