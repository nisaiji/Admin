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

/**
 * AttendancePopup Component
 * Displays a popup to manage monthly attendance data for students.
 *
 * @param {boolean} isVisible - Determines if the popup is visible
 * @param {Function} onClose - Function to close the popup
 * @param {string} sectionId - Section ID of the class
 * @param {string} classId - Class ID
 * @param {string} className - Class name
 * @param {string} sectionName - Section name
 * @param {number} startTimeForAdmin - Section Start time for attendance applicable for admin
 */
export default function AttendancePopup({
  isVisible,
  onClose,
  sectionId,
  classId,
  className,
  sectionName,
  startTimeForAdmin,
}) {
  // Redux state selectors
  const id = useSelector((state) => state.appAuth.id);
  const sectionStartTime = useSelector(
    (state) => state.appAuth.sectionStartTime
  );
  const isTeacher = useSelector((state) => state.appAuth.role) === "teacher";
  const teacherSectionId = useSelector((state) => state.appAuth.section);
  // Component state variables
  const [isEditable, setIsEditable] = useState(false);
  const [attendanceData, setAttendanceData] = useState([]);
  const [loading, setLoading] = useState(false);
  const [currentDate, setCurrentDate] = useState(new Date());
  const [holidays, setHolidays] = useState({});
  const [workdays, setWorkdays] = useState({});
  const [toastDisplayed, setToastDisplayed] = useState(false);
  const [totalAttendanceDays, setTotalAttendanceDays] = useState(0);
  // Start time based on role
  const startTime = isTeacher ? sectionStartTime : startTimeForAdmin;
  // console.log({sectionStartTime});

  // Return null if the popup is not visible
  if (!isVisible) return null;

  // Total days in the current month
  const totalDays = new Date(
    currentDate.getFullYear(),
    currentDate.getMonth() + 1,
    0
  ).getDate();

  /**
   * Check if a specific date is a Sunday or a holiday.
   *
   * @param {number} dateIndex - Index of the date in the month (0-based)
   * @returns {boolean} - True if the date is a Sunday or a holiday
   */
  const isSunday = (dateIndex) => {
    const date = moment({ day: dateIndex + 1 }).format("YYYY-MM-DD");
    return moment(date).day() === 0 && !(date in workdays);
  };

  const isHoliday = (dateIndex) => {
    const date = new Date(
      currentDate.getFullYear(),
      currentDate.getMonth(),
      dateIndex + 1
    );
    const formattedDate = moment(date).format("YYYY-MM-DD");
    return holidays[formattedDate];
  };

  // Prevent body scrolling when the popup is visible
  useEffect(() => {
    document.body.style.overflow = isVisible ? "hidden" : "";

    return () => {
      document.body.style.overflow = "";
    };
  }, [isVisible]);

  /**
   * Change the displayed month in the popup.
   *
   * @param {number} increment - Positive or negative number to change months
   */
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
      // Prevent changing to months outside the allowed range
      if (
        newDate.getFullYear() < startYear ||
        (newDate.getFullYear() === startYear &&
          newDate.getMonth() < startMonth) ||
        newDate.getFullYear() > currentYear ||
        (newDate.getFullYear() === currentYear &&
          newDate.getMonth() > currentMonth)
      ) {
        if (!toastDisplayed) {
          setToastDisplayed(true);
          toast.error(
            `You can only change month between the ${moment(startTime).format(
              "MMMM YYYY"
            )} to ${moment().format("MMMM YYYY")}.`
          );
          setTimeout(() => setToastDisplayed(false), 3000);
        }
        return prevDate;
      }
      return newDate;
    });
  };

  /**
   * Handle attendance input changes for a specific student and date.
   *
   * @param {number} studentIndex - Index of the student in the data array
   * @param {number} dateIndex - Index of the date in the attendance array
   * @param {string} value - New attendance value ("P" or "A")
   */
  const handleInputChange = (studentIndex, dateIndex, value) => {
    const attendanceDate = new Date(
      currentDate.getFullYear(),
      currentDate.getMonth(),
      dateIndex + 1
    );

    // Ensure the date is within the valid range
    if (
      moment(attendanceDate).format("DD/MM/YYYY") <
        moment(startTime).format("DD/MM/YYYY") ||
      moment(attendanceDate).format("DD/MM/YYYY") >
        moment().startOf("days").format("DD/MM/YYYY")
    ) {
      // console.log(
      //   moment(attendanceDate).format("DD/MM/YYYY"),
      //   moment(startTime).format("DD/MM/YYYY")
      // );
      // console.log(
      //   moment(attendanceDate).format("DD/MM/YYYY"),
      //   moment().startOf("days").format("DD/MM/YYYY")
      // );

      if (!toastDisplayed) {
        setToastDisplayed(true);
        toast.error(
          `You can only edit attendance between the ${moment(startTime).format(
            "DD/MM/YYYY"
          )} and ${moment().format("DD/MM/YYYY")}.`
        );
        setTimeout(() => setToastDisplayed(false), 3000);
      }
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

  /**
   * Save the attendance data to the backend API.
   */
  const handleSaveAttendance = async () => {
    try {
      setLoading(true);
      const attendances = attendanceData;

      // Define the date range for checking
      const startDate = moment(startTime).format("DD-MM-YYYY");
      const today = moment(new Date()).format("DD-MM-YYYY");

      // Group attendance statuses by day
      const dayAttendance = {};
      attendanceData.forEach((student) => {
        student.attendances.forEach((item) => {
          const itemDate = moment(item.date).format("DD-MM-YYYY");
          if (itemDate >= startDate && itemDate <= today) {
            if (!dayAttendance[itemDate]) {
              dayAttendance[itemDate] = [];
            }
            dayAttendance[itemDate].push(item.attendance);
          }
        });
      });

      // Check each day: valid if all empty OR all filled; invalid if a mix
      const invalidDays = [];
      Object.entries(dayAttendance).forEach(([date, statuses]) => {
        const allEmpty = statuses.every((status) => status === "");
        const allFilled = statuses.every((status) => status !== "");
        if (!allEmpty && !allFilled) {
          invalidDays.push(date);
        }
      });

      if (invalidDays.length > 0) {
        if (!toastDisplayed) {
          setToastDisplayed(true);
          toast.error(
            `Please fill all the cells to save the attendance. Incomplete attendance on: ${invalidDays.join(
              ", "
            )}`
          );
          setTimeout(() => setToastDisplayed(false), 3000);
        }
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

      // Determine API endpoint based on role
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

  /**
   * Fetch monthly attendance data for the current month.
   */
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
            // console.log(
            //   dateKey,
            //   new Date(dateKey).getDay() === 0,
            //   !(dateKey in workdays)
            // );

            return {
              date: dateKey,
              attendance:
                dateKey in holidays
                  ? "H"
                  : new Date(dateKey).getDay() === 0 && !(dateKey in workdays)
                  ? "S"
                  : attendanceByDate[dateKey] || "",
            };
          });

          return {
            ...student,
            attendances: monthDates,
          };
        });

        // Sort by firstname, and if equal, sort by lastname
        updatedAttendanceData.sort((a, b) => {
          const firstNameComparison = a.firstname.localeCompare(b.firstname);
          if (firstNameComparison === 0) {
            return a.lastname.localeCompare(b.lastname);
          }
          return firstNameComparison;
        });

        const totalHolidays = Array.from({ length: totalDays }, (_, i) => {
          const dateKey = moment(
            new Date(currentDate.getFullYear(), currentDate.getMonth(), i + 1)
          ).format("YYYY-MM-DD");
          return dateKey in holidays || new Date(dateKey).getDay() === 0;
        }).filter(Boolean).length;

        setAttendanceData(updatedAttendanceData);
        setTotalAttendanceDays(totalDays - totalHolidays);
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
      let url = isTeacher
        ? EndPoints.TEACHER.GET_EVENTS
        : EndPoints.ADMIN.GET_EVENTS;
      const res = await axiosClient.post(url, { startTime, endTime });

      if (res?.statusCode === 200) {
        const holidayMap = res?.result?.reduce((acc, item) => {
          acc[moment(item.date).format("YYYY-MM-DD")] = true;
          return acc;
        }, {});
        setHolidays(holidayMap);
      }

      url = isTeacher
        ? EndPoints.TEACHER.GET_SUNDAY_HOLIDAY
        : EndPoints.ADMIN.GET_SUNDAY_HOLIDAY;
      const res2 = await axiosClient.post(url, {
        startTime,
        endTime,
      });

      if (res2?.statusCode === 200) {
        const workdayMap = res2?.result?.reduce((acc, item) => {
          acc[moment(item.date).format("YYYY-MM-DD")] = true;
          return acc;
        }, {});
        setWorkdays(workdayMap);
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
  }, [holidays, workdays]);

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
      "Total Attendance",
    ];

    // Table rows
    const rows = attendanceData.map((student, index) => {
      const totalPresent = student.attendances.filter(
        (a) => a.attendance === "P"
      ).length;
      return [
        index + 1,
        `${student?.firstname || ""} ${student?.lastname || ""}`,
        ...student?.attendances.map((item) => item.attendance || ""),
        `${totalPresent}/${totalDays}`, // Horizontal total
      ];
    });

    // Add vertical totals (final row)
    const totalRow = [
      "Total",
      "",
      ...Array.from({ length: totalDays }, (_, dayIndex) => {
        const totalPresentForDay = attendanceData.filter(
          (student) => student.attendances[dayIndex]?.attendance === "P"
        ).length;
        return `${totalPresentForDay}/${attendanceData?.length || 0}`;
      }),
      "", // Empty cell for total column
    ];
    rows.push(totalRow); // Add vertical total row to rows

    // Add table to PDF
    doc.autoTable({
      margin: { left: 0, right: 0 },
      startY: 30,
      head: [headers],
      body: rows,
      styles: {
        fontSize: 5,
        lineWidth: 0.01,
        lineColor: [0, 0, 0],
        textColor: [0, 0, 0],
        fillColor: [255, 255, 255],
        cellPadding: 1,
      },
      headStyles: {
        textColor: [0, 0, 0],
        fillColor: [255, 255, 255],
        lineWidth: 0.01,
        lineColor: [0, 0, 0],
      },
      alternateRowStyles: { fillColor: [255, 255, 255] },
      columnStyles: {
        0: { cellWidth: 9 }, // S.No
        1: { cellWidth: 15 }, // Student Name
        ...Array.from({ length: totalDays }, (_, i) => ({
          [i + 2]: { cellWidth: 5.5 }, // date
        })).reduce((acc, style) => Object.assign(acc, style), {}),
        [totalDays + 2]: { cellWidth: 15 }, // Total Attendance column
      },
      didParseCell: (data) => {
        if (data.section === "body" && data.column.index > 1) {
          const cellValue = data.cell.raw; // Get cell value
          if (cellValue === "P") {
            data.cell.styles.textColor = "#0F4189"; // Blue for "P"
          } else if (
            cellValue === "A" ||
            cellValue === "H" ||
            cellValue === "S"
          ) {
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
    <div className="fixed inset-0 bg-black bg-opacity-50 z-40 select-none">
      <div className="bg-black bg-opacity-50 h-screen p-4 shadow flex flex-col">
        {/* Header */}
        <div className="flex flex-row justify-between items-center mb-4">
          <div className="flex flex-row justify-between items-center w-[260px]">
            <img
              src={backIcon}
              alt="Previous Month"
              className="w-10 h-10 cursor-pointer transition-all duration-200 ease-in-out active:scale-90"
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
              className="w-10 h-10 rotate-180 cursor-pointer transition-all duration-200 ease-in-out active:scale-90"
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
                className="px-4 py-2 text-base font-poppins-regular rounded-full bg-white transition-all duration-200 ease-in-out active:scale-90"
                onClick={handleSaveAttendance}
              >
                Save
              </button>
            ) : (
              <>
                <img
                  src={editw}
                  alt=""
                  className="w-10 h-10 cursor-pointer transition-all duration-200 ease-in-out active:scale-90"
                  onClick={() => setIsEditable(true)}
                />
                <img
                  onClick={downloadAttendance}
                  src={downloadw}
                  alt=""
                  className="w-10 h-10 mx-4 cursor-pointer transition-all duration-200 ease-in-out active:scale-90"
                />
              </>
            )}
            <img
              src={closew}
              alt=""
              className="w-10 h-10 cursor-pointer transition-all duration-200 ease-in-out active:scale-90"
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
                <th className="border border-gray-300 w-[30px] p-1 font-poppins-bold">
                  S.No
                </th>
                <th className="border border-gray-300 p-1 w-[150px] font-poppins-bold">
                  Student Name
                </th>
                {Array.from({ length: totalDays }, (_, i) => (
                  <th key={i} className="relative border border-gray-300">
                    <div className={`flex flex-col items-center`}>
                      <span>{i + 1}</span>
                    </div>
                  </th>
                ))}
                <th className="border border-gray-300 p-1 w-[50px] font-poppins-bold">
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
                    {data.attendances.map((value, idx) => {
                      const attendance = isSunday(idx)
                        ? "S"
                        : isHoliday(idx)
                        ? "H"
                        : value.attendance;
                      return (
                        <td key={idx} className="border border-gray-300">
                          {isEditable &&
                          attendance !== "S" &&
                          attendance !== "H" ? (
                            <select
                              name="attendance"
                              value={attendance}
                              disabled={isSunday(idx) || isHoliday(idx)}
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
                              className={`w-full text-center focus:outline-none bg-transparent uppercase
                              ${
                                attendance === "P"
                                  ? "text-[#0F4189]"
                                  : attendance === "A" ||
                                    attendance === "S" ||
                                    attendance === "H"
                                  ? "text-[#D91111]"
                                  : "text-black"
                              }
                              `}
                            >
                              {attendance}
                            </div>
                          )}
                        </td>
                      );
                    })}
                    {/* Horizontal totals */}
                    <td className="border border-gray-300 p-1 font-poppins-regular">
                      {totalPresent}/{totalAttendanceDays}
                    </td>
                  </tr>
                );
              })}
              {/* Vertical totals */}
              <tr>
                <td
                  colSpan="2"
                  className="border border-gray-300 font-poppins-regular p-1"
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
                    <td
                      key={dayIndex}
                      className="border border-gray-300 font-poppins-regular p-1"
                    >
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
