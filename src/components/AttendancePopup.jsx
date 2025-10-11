import React, { useState, useEffect, useMemo, useRef } from "react";
import backIcon from "../assets/images/backIcon.png";
import editw from "../assets/images/editw.png";
import downloadw from "../assets/images/downloadw.png";
import closew from "../assets/images/closew.png";
import { axiosClient } from "../services/axiosClient";
import EndPoints from "../services/EndPoints";
import toast, { Toaster } from "react-hot-toast";
import { useSelector } from "react-redux";
import jsPDF from "jspdf";
import "jspdf-autotable";
import moment from "moment";

export default function AttendancePopup() {
  // Redux state selectors
  const { classAndSectionData, classAndSectionDataOfTeacher } = useSelector(
    (state) => state.appAuth
  );
  const role = useSelector((state) => state.appAuth.role);
  const isDarkMode = useSelector((state) => state.appConfig.isDarkMode);

  // Component state variables
  const [isEditable, setIsEditable] = useState(false);
  const [attendanceData, setAttendanceData] = useState([]);
  const [loading, setLoading] = useState(false);
  const [currentDate, setCurrentDate] = useState(new Date());
  const [holidays, setHolidays] = useState({});
  const [workdays, setWorkdays] = useState({});
  const [toastDisplayed, setToastDisplayed] = useState(false);
  const [totalAttendanceDays, setTotalAttendanceDays] = useState(0);
  const isFetchingRef = useRef(false);
  const formatDate = (date) => moment(date).format("YYYY-MM-DD");

  const totalDays = useMemo(
    () =>
      new Date(
        currentDate.getFullYear(),
        currentDate.getMonth() + 1,
        0
      ).getDate(),
    [currentDate]
  );
  // console.log(classAndSectionData);

  const startTime = useMemo(
    () =>
      role === "classTeacher"
        ? classAndSectionDataOfTeacher?.startTime
        : role === "admin"
        ? classAndSectionData?.startTime
        : "",
    [
      role,
      classAndSectionDataOfTeacher?.startTime,
      classAndSectionData?.startTime,
    ]
  );

  /**
   * Check if a specific date is a Sunday or a holiday.
   *
   * @param {number} dateIndex - Index of the date in the month (0-based)
   * @returns {boolean} - True if the date is a Sunday or a holiday
   */
  const isSunday = (dateIndex) => {
    const date = new Date(
      currentDate.getFullYear(),
      currentDate.getMonth(),
      dateIndex + 1
    );
    return date.getDay() === 0 && !workdays?.[formatDate(date)];
  };

  const isHoliday = (dateIndex) => {
    const date = new Date(
      currentDate.getFullYear(),
      currentDate.getMonth(),
      dateIndex + 1
    );
    const formattedDate = formatDate(date);
    return holidays[formattedDate];
  };

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
        // console.log({ toastDisplayed });

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
      moment(attendanceDate).isBefore(moment(startTime), "day") ||
      moment(attendanceDate).isAfter(moment().startOf("day"))
    ) {
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
            sessionStudent: student._id,
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
      const url =
        role === "classTeacher"
          ? `${EndPoints.TEACHER.UPDATE_ATTENDANCE}/${classAndSectionDataOfTeacher?.sectionId}`
          : role === "admin"
          ? `${EndPoints.ADMIN.UPDATE_ATTENDANCE}/${classAndSectionData?.sectionId}`
          : "";
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
  // console.log(attendanceData);

  /**
   * Fetch monthly attendance data for the current month.
   */
  const fetchMonthlyAttendance = async () => {
    if (isFetchingRef.current) return;
    isFetchingRef.current = true;
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
      // console.log(classAndSectionDataOfTeacher);
      const url =
        role === "classTeacher"
          ? `${EndPoints.TEACHER.GET_ATTENDANCE}?section=${classAndSectionDataOfTeacher?.sectionId}&startTime=${startTime}&endTime=${endTime}&session=${classAndSectionDataOfTeacher?.sessionId}`
          : role === "admin"
          ? `${EndPoints.ADMIN.GET_ATTENDANCE}?admin=${classAndSectionData?.selectedSession?.school}&section=${classAndSectionData?.sectionId}&classId=${classAndSectionData?.classId}&startTime=${startTime}&endTime=${endTime}&session=${classAndSectionData?.selectedSession?._id}`
          : "";
      // console.log(url);
      const res = await axiosClient.get(url);

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
            const dateKey = formatDate(
              new Date(currentDate.getFullYear(), currentDate.getMonth(), i + 1)
            );
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
          // console.log(monthDates);

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
          const dateKey = formatDate(
            new Date(currentDate.getFullYear(), currentDate.getMonth(), i + 1)
          );
          return dateKey in holidays || new Date(dateKey).getDay() === 0;
        }).filter(Boolean).length;

        setAttendanceData(updatedAttendanceData);

        // setTotalAttendanceDays(totalDays - totalHolidays);
      }
    } catch (e) {
      toast.error(e);
    } finally {
      setLoading(false);
      isFetchingRef.current = false;
    }
  };

  useEffect(() => {
    const currentMonth = moment(currentDate).format("MM-YYYY");
    const startMonth = moment(startTime).format("MM-YYYY");
    const todayMonth = moment().format("MM-YYYY");

    const startDate =
      currentMonth === startMonth
        ? moment(startTime)
        : moment(currentDate).startOf("month");

    const effectiveEnd =
      currentMonth === todayMonth
        ? moment().endOf("day")
        : moment(currentDate).endOf("month");

    const allDatesInRange = [];
    let day = moment(startDate);

    while (day.isSameOrBefore(effectiveEnd, "day")) {
      allDatesInRange.push(day.clone());
      day.add(1, "day");
    }

    const totalDaysInRange = allDatesInRange.length;

    const totalHolidays = allDatesInRange.filter((date) => {
      const dateStr = date.format("YYYY-MM-DD");
      const isSunday = date.day() === 0 && !(dateStr in workdays);
      const isHoliday = dateStr in holidays;
      return isSunday || isHoliday;
    }).length;

    setTotalAttendanceDays(totalDaysInRange - totalHolidays);

    // console.log("Start:", startDate.format("YYYY-MM-DD"));
    // console.log("End:", effectiveEnd.format("YYYY-MM-DD"));
    // console.log("Days:", totalDaysInRange);
    // console.log("Holidays:", totalHolidays);
    // console.log("Attendance Days:", totalDaysInRange - totalHolidays);
  }, [startTime, currentDate, holidays, workdays]);
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
      let url =
        role === "classTeacher"
          ? EndPoints.TEACHER.GET_EVENTS
          : role === "admin"
          ? EndPoints.ADMIN.GET_EVENTS
          : "";
      // console.log(classAndSectionData);

      const res = await axiosClient.post(url, {
        startTime,
        endTime,
        sessionId:
          role === "classTeacher"
            ? classAndSectionDataOfTeacher?.sessionId
            : role === "admin"
            ? classAndSectionData?.selectedSession?._id
            : "",
      });
      // console.log(res);

      if (res?.statusCode === 200) {
        const holidayMap = res?.result?.reduce((acc, item) => {
          acc[formatDate(item.date)] = true;
          return acc;
        }, {});
        setHolidays(holidayMap);
      }

      url =
        role === "classTeacher"
          ? EndPoints.TEACHER.GET_SUNDAY_HOLIDAY
          : role === "admin"
          ? EndPoints.ADMIN.GET_SUNDAY_HOLIDAY
          : "";
      const res2 = await axiosClient.post(url, {
        startTime,
        endTime,
        sessionId:
          role === "classTeacher"
            ? classAndSectionDataOfTeacher?.sessionId
            : role === "admin"
            ? classAndSectionData?.selectedSession?._id
            : "",
      });

      if (res2?.statusCode === 200) {
        const workdayMap = res2?.result?.reduce((acc, item) => {
          acc[formatDate(item.date)] = true;
          return acc;
        }, {});
        setWorkdays(workdayMap);
      }
    } catch (e) {
      // console.log({ e });
      // toast.error(e);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    // console.log(classAndSectionData);

    if (
      (role === "classTeacher" &&
        classAndSectionDataOfTeacher?.sectionId &&
        classAndSectionDataOfTeacher?.sessionId) ||
      (role === "admin" &&
        classAndSectionData?.selectedSession?.school &&
        classAndSectionData?.selectedSession?._id &&
        classAndSectionData?.sectionId &&
        classAndSectionData?.classId)
    ) {
      fetchEvents().then(fetchMonthlyAttendance);
    }
  }, [
    currentDate,
    classAndSectionData?.selectedSession?._id,
    classAndSectionData?.selectedSession?.school,
    classAndSectionData?.sectionId,
    classAndSectionData?.classId,
    classAndSectionDataOfTeacher?.sessionId,
    classAndSectionDataOfTeacher?.sectionId,
  ]);

  // attendance download in pdf format
  const downloadAttendance = () => {
    const doc = new jsPDF();

    // Title
    const title = `${classAndSectionData?.className}-${
      classAndSectionData?.sectionName
    } Monthly Attendance ${currentDate.toLocaleString("default", {
      month: "long",
    })} ${currentDate.getFullYear()}`;
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
          } else if (cellValue === "A") {
            data.cell.styles.textColor = "#FE4040"; // Red for "A"
          } else if (cellValue === "S" || cellValue === "H") {
            data.cell.styles.textColor = "#FF9933";
          }
        }
      },
    });

    // Save PDF
    doc.save(
      `Attendance_${classAndSectionData?.className}_${
        classAndSectionData?.sectionName
      }_${currentDate.getFullYear()}_${currentDate.getMonth() + 1}.pdf`
    );
  };

  return (
    <div className={`z-40 select-none`}>
      <div
        className={`min-h-[calc(100vh-72px)] p-4 shadow flex flex-col ${
          isDarkMode ? "bg-background2" : "bg-whiteBackground2"
        }`}
      >
        <Toaster />
        {/* Header */}
        <div className={`flex flex-row justify-between items-center mb-4`}>
          <div
            className={`flex flex-row justify-between items-center w-[260px]`}
          >
            <img
              src={backIcon}
              alt="Previous Month"
              className={`w-10 h-10 cursor-pointer transition-all duration-200 ease-in-out active:scale-90`}
              onClick={() =>
                isEditable
                  ? toast.error(
                      "please save the data before changing the month"
                    )
                  : changeMonth(-1)
              }
            />
            <div className={`text-white text-xl mx-4`}>
              {currentDate.toLocaleString("default", { month: "long" })}{" "}
              {currentDate.getFullYear()}
            </div>
            <img
              src={backIcon}
              alt="Next Month"
              className={`w-10 h-10 rotate-180 cursor-pointer transition-all duration-200 ease-in-out active:scale-90`}
              onClick={() =>
                isEditable
                  ? toast.error(
                      "please save the data before changing the month"
                    )
                  : changeMonth(1)
              }
            />
          </div>
          <div className={`text-white text-xl`}>Monthly Attendance</div>
          <div className={`flex flex-row w-[270px] justify-end`}>
            {isEditable ? (
              <button
                className={`px-4 py-2 text-base font-poppins-regular rounded-full bg-white transition-all duration-200 ease-in-out active:scale-90`}
                onClick={handleSaveAttendance}
              >
                Save
              </button>
            ) : (
              <>
                <img
                  src={editw}
                  alt=""
                  className={`w-10 h-10 cursor-pointer transition-all duration-200 ease-in-out active:scale-90`}
                  onClick={() => setIsEditable(true)}
                />
                <img
                  onClick={downloadAttendance}
                  src={downloadw}
                  alt=""
                  className={`w-10 h-10 mx-4 cursor-pointer transition-all duration-200 ease-in-out active:scale-90`}
                />
              </>
            )}
          </div>
        </div>

        {/* Table */}
        <div
          className={`overflow-x-auto p-4 h-[500px] overflow-y-auto ${
            isDarkMode
              ? "bg-gradient-to-r from-fromColor1 to-toColor1"
              : "bg-whiteBackground"
          }`}
        >
          <div
            className={`text-2xl font-poppins-regular text-center w-full ${
              isDarkMode ? "text-textPrimary" : "text-textBlack"
            }`}
          >
            Monthly Attendance Sheet
          </div>
          <div
            className={`text-xl font-poppins-regular text-textGray text-center w-full my-2`}
          >
            {currentDate.toLocaleString("default", { month: "long" })}{" "}
            {currentDate.getFullYear()}
          </div>
          <table className={`w-full text-center border border-borderLine`}>
            <thead
              className={`sticky -top-4 z-10 ${
                isDarkMode
                  ? "bg-backgroundTableCell text-textPrimary"
                  : "bg-whiteBackground text-textBlack"
              }`}
            >
              <tr>
                <th
                  className={`border border-borderLine w-[30px] p-1 font-poppins-bold`}
                >
                  S.No
                </th>
                <th
                  className={`border border-borderLine p-1 w-[150px] font-poppins-bold`}
                >
                  Student Name
                </th>
                {Array.from({ length: totalDays }, (_, i) => (
                  <th key={i} className={`relative border border-borderLine`}>
                    <div className={`flex flex-col items-center`}>
                      <span>{i + 1}</span>
                    </div>
                  </th>
                ))}
                <th
                  className={`border border-borderLine p-1 w-[50px] font-poppins-bold`}
                >
                  Total Attendance
                </th>
              </tr>
            </thead>
            <tbody>
              {/* {console.log(attendanceData)} */}
              {attendanceData.map((data, index) => {
                const totalPresent = data.attendances.filter(
                  (a) => a.attendance === "P"
                ).length;
                const totalAbsent = data.attendances.filter(
                  (a) => a.attendance === "A"
                ).length;
                return (
                  <tr key={index}>
                    <td
                      className={`border border-borderLine p-1  ${
                        isDarkMode ? "text-textPrimary" : "text-textBlack"
                      }`}
                    >
                      {index + 1}
                    </td>
                    <td
                      className={`border border-borderLine p-1  ${
                        isDarkMode ? "text-textPrimary" : "text-textBlack"
                      }`}
                    >
                      {data?.firstname || ""} {data?.lastname || ""}
                    </td>
                    {data.attendances.map((value, idx) => {
                      const attendance = isSunday(idx)
                        ? "S"
                        : isHoliday(idx)
                        ? "H"
                        : value.attendance;
                      return (
                        <td
                          key={idx}
                          className={`border border-borderLine  ${
                            isDarkMode ? "text-textPrimary" : "text-textBlack"
                          }`}
                        >
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
                              className={`w-full h-full m-0 text-center bg-transparent uppercase focus:outline-none focus:ring ${
                                isDarkMode
                                  ? "focus:ring-gray"
                                  : "focus:ring-black"
                              } ${
                                value?.attendance === "P"
                                  ? "text-textBlue"
                                  : value?.attendance === "A"
                                  ? "text-textDarkRed"
                                  : "text-textBlack"
                              }`}
                            >
                              <option value="" label="" />
                              <option
                                value="P"
                                label="P"
                                className={`text-textBlue`}
                              />
                              <option
                                value="A"
                                label="A"
                                className={`text-textDarkRed`}
                              />
                            </select>
                          ) : (
                            <div
                              className={`w-full text-center focus:outline-none bg-transparent uppercase
                              ${
                                attendance === "P"
                                  ? "text-textBlue"
                                  : attendance === "A"
                                  ? "text-textRed"
                                  : attendance === "S" || attendance === "H"
                                  ? "text-textHoliday"
                                  : "text-textBlack"
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
                    <td
                      className={`border border-borderLine p-1 font-poppins-regular  ${
                        isDarkMode ? "text-textPrimary" : "text-textBlack"
                      }`}
                    >
                      {totalPresent}/{totalAttendanceDays}
                    </td>
                  </tr>
                );
              })}
              {/* Vertical totals */}
              <tr>
                <td
                  colSpan="2"
                  className={`border border-borderLine font-poppins-regular p-1  ${
                    isDarkMode ? "text-textPrimary" : "text-textBlack"
                  }`}
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
                      className={`border border-borderLine font-poppins-regular p-1  ${
                        isDarkMode ? "text-textPrimary" : "text-textBlack"
                      }`}
                    >
                      {totalPresentForDay}/{attendanceData?.length || 0}
                    </td>
                  );
                })}
                <td colSpan="2" className={`border border-borderLine`}></td>
              </tr>
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
