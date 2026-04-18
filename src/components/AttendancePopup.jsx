/**
 * AttendancePopup.jsx
 *
 * This component displays and manages the monthly attendance sheet for students in a class or section.
 * It supports viewing, editing, and downloading attendance data as a PDF.
 * Attendance can be marked as Present (P), Absent (A), Sunday (S), or Holiday (H).
 * The component handles month navigation, attendance validation, API integration for fetching and saving data,
 * and dynamic calculation of attendance totals.
 * Uses React hooks for state, Redux for authentication/config state, and third-party libraries for PDF generation and date handling.
 */
import React, { useState, useEffect, useMemo, useRef } from "react";
import backIcon from "../assets/images/backIcon.png";
import editw from "../assets/images/editw.png";
import downloadw from "../assets/images/downloadw.png";
import { axiosClient } from "../services/axiosClient";
import EndPoints from "../services/EndPoints";
import toast, { Toaster } from "react-hot-toast";
import { useSelector } from "react-redux";
import jsPDF from "jspdf";
import autoTable from "jspdf-autotable";
import moment from "moment";
import { getSessionPermissions, getSessionWindow } from "../utils/helper";
import Breadcrumbs from "./BreadCrumbs";

export default function AttendancePopup() {
  // Redux state selectors
  const { classAndSectionData, teacherData, data } = useSelector(
    (state) => state.appAuth,
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

  const selectedSession = classAndSectionData?.selectedSession;

  // Get start time for attendance (depends on role)
  const startTime = useMemo(
    () =>
      role === "classTeacher"
        ? teacherData?.sectionStartTime
        : role === "admin"
          ? classAndSectionData?.startTime
          : "",
    [role, teacherData?.sectionStartTime, classAndSectionData?.startTime],
  );

  const sessionPermissions = useMemo(() => {
    if (role !== "admin") {
      return {
        phase: "current",
        canView: true,
        canEdit: true,
        canCreate: true,
        canCreateAttendance: true,
      };
    }

    return getSessionPermissions(selectedSession);
  }, [role, selectedSession]);

  const sessionWindow = useMemo(() => {
    if (role !== "admin") {
      return null;
    }

    return getSessionWindow(selectedSession);
  }, [role, selectedSession]);

  const canEditAttendance = sessionPermissions?.canCreateAttendance;

  const editableStartDate = useMemo(() => {
    if (role === "admin" && sessionWindow?.start) {
      return sessionWindow.start.clone().startOf("day");
    }

    return moment(startTime).startOf("day");
  }, [role, sessionWindow, startTime]);

  const editableEndDate = useMemo(() => {
    if (role === "admin" && sessionWindow?.end) {
      return moment.min(
        moment().startOf("day"),
        sessionWindow.end.clone().startOf("day"),
      );
    }

    return moment().startOf("day");
  }, [role, sessionWindow]);

  // Format date as YYYY-MM-DD
  const formatDate = (date) => moment(date).format("YYYY-MM-DD");

  // Calculate total days in the current month
  const totalDays = useMemo(
    () =>
      new Date(
        currentDate.getFullYear(),
        currentDate.getMonth() + 1,
        0,
      ).getDate(),
    [currentDate],
  );

  /**
   * Check if a specific date is a Sunday or a holiday.
   * Optimized to use string lookups instead of Date objects where possible
   */
  const isSunday = (dateStr) => {
    const date = new Date(dateStr);
    return date.getDay() === 0 && !workdays?.[dateStr];
  };

  /**
   * Check if a specific date is a holiday.
   */
  const isHoliday = (dateStr) => {
    return holidays[dateStr];
  };

  /**
   * Change the displayed month in the popup.
   * Prevents navigation outside allowed range.
   * @param {number} increment - Positive or negative number to change months
   */
  const changeMonth = (increment) => {
    setCurrentDate((prevDate) => {
      const newDate = new Date(
        prevDate.getFullYear(),
        prevDate.getMonth() + increment,
        1,
      );

      const nextMonthMoment = moment(newDate).startOf("month");

      let minAllowedMonth;
      let maxAllowedMonth;

      if (sessionPermissions?.phase === "current") {
        minAllowedMonth = moment(classAndSectionData?.startTime).startOf(
          "month",
        );
        maxAllowedMonth = moment().endOf("month");
      } else if (
        role === "admin" &&
        sessionWindow?.start &&
        sessionWindow?.end
      ) {
        minAllowedMonth = sessionWindow.start.clone().startOf("month");
        maxAllowedMonth =
          sessionPermissions?.phase === "current"
            ? moment.min(moment(), sessionWindow.end.clone()).endOf("month")
            : sessionWindow.end.clone().endOf("month");
      } else {
        minAllowedMonth = moment(startTime).startOf("month");
        maxAllowedMonth = moment().endOf("month");
      }

      // Prevent changing to months outside the allowed range
      if (
        nextMonthMoment.isBefore(minAllowedMonth, "month") ||
        nextMonthMoment.isAfter(maxAllowedMonth, "month")
      ) {
        if (!toastDisplayed) {
          setToastDisplayed(true);
          toast.error(
            `You can only change month between ${minAllowedMonth.format(
              "MMMM YYYY",
            )} and ${maxAllowedMonth.format("MMMM YYYY")}.`,
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
    if (!canEditAttendance) {
      if (!toastDisplayed) {
        setToastDisplayed(true);
        toast.error(
          sessionPermissions?.phase === "upcoming"
            ? "Attendance cannot be created in upcoming session."
            : "Previous session attendance is view only.",
        );
        setTimeout(() => setToastDisplayed(false), 3000);
      }
      return;
    }

    const attendanceDate = new Date(
      currentDate.getFullYear(),
      currentDate.getMonth(),
      dateIndex + 1,
    );

    const attendanceMoment = moment(attendanceDate).startOf("day");

    // Ensure the date is within the valid range
    if (
      attendanceMoment.isBefore(editableStartDate, "day") ||
      attendanceMoment.isAfter(editableEndDate, "day")
    ) {
      if (!toastDisplayed) {
        setToastDisplayed(true);

        toast.error(
          `You can only edit attendance between ${editableStartDate.format(
            "DD/MM/YYYY",
          )} and ${editableEndDate.format("DD/MM/YYYY")}.`,
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
                  : attendance,
              ),
            }
          : student,
      ),
    );
  };

  /**
   * Save the attendance data to the backend API.
   * Validates that attendance for each day is either fully filled or empty.
   */
  const handleSaveAttendance = async () => {
    if (!canEditAttendance) {
      toast.error(
        sessionPermissions?.phase === "upcoming"
          ? "Attendance cannot be created in upcoming session."
          : "Previous session attendance is view only.",
      );
      return;
    }

    try {
      setLoading(true);
      const attendances = attendanceData;

      // Group attendance statuses by day
      const dayAttendance = {};
      attendanceData.forEach((student) => {
        student.attendances.forEach((item) => {
          const itemDate = moment(item.date);
          if (
            itemDate.isSameOrAfter(editableStartDate, "day") &&
            itemDate.isSameOrBefore(editableEndDate, "day")
          ) {
            const itemDateKey = itemDate.format("YYYY-MM-DD");
            if (!dayAttendance[itemDateKey]) {
              dayAttendance[itemDateKey] = [];
            }
            dayAttendance[itemDateKey].push(item.attendance);
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
              ", ",
            )}`,
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
          ? `${EndPoints.TEACHER.UPDATE_ATTENDANCE}/${teacherData?.sectionId}`
          : role === "admin"
            ? `${EndPoints.ADMIN.UPDATE_ATTENDANCE}/${classAndSectionData?.sectionId}`
            : "";
      // API call
      const res = await axiosClient.post(url, { studentsAttendances });

      if (res.statusCode === 200) {
        toast.success(res?.result);
        setIsEditable(false);
        // We need to re-fetch with current state logic or pass current state if we want to be safe,
        // but typically safe here as save doesn't change holidays/workdays
        fetchMonthlyAttendance({ holidayMap: holidays, workdayMap: workdays });
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
   * Populates attendanceData state with attendance for each student and day.
   * @param {Object} eventData - Optional object containing holidayMap and workdayMap
   */
  const fetchMonthlyAttendance = async (eventData = {}) => {
    if (isFetchingRef.current) return;
    isFetchingRef.current = true;

    // Use passed data or fall back to state
    const currentHolidays = eventData.holidayMap || holidays;
    const currentWorkdays = eventData.workdayMap || workdays;

    try {
      setLoading(true);
      const startTime = new Date(
        currentDate.getFullYear(),
        currentDate.getMonth(),
        1,
      ).getTime();
      const endTime = new Date(
        currentDate.getFullYear(),
        currentDate.getMonth() + 1,
        0,
        23,
        59,
        59,
        999,
      ).getTime();
      const url =
        role === "classTeacher"
          ? `${EndPoints.TEACHER.GET_ATTENDANCE}?section=${teacherData?.sectionId}&startTime=${startTime}&endTime=${endTime}&session=${teacherData?.sessionId}`
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
              new Date(
                currentDate.getFullYear(),
                currentDate.getMonth(),
                i + 1,
              ),
            );

            const isDateSunday = new Date(dateKey).getDay() === 0;
            const isDateWorkday = !!currentWorkdays[dateKey];
            const isDateHoliday = !!currentHolidays[dateKey];

            let attendanceStatus = "";

            if (isDateHoliday) {
              attendanceStatus = "H";
            } else if (isDateSunday && !isDateWorkday) {
              attendanceStatus = "S";
            } else {
              attendanceStatus = attendanceByDate[dateKey] || "";
            }

            return {
              date: dateKey,
              attendance: attendanceStatus,
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

        setAttendanceData(updatedAttendanceData);
      }
    } catch (e) {
      toast.error(e);
    } finally {
      setLoading(false);
      isFetchingRef.current = false;
    }
  };

  /**
   * Calculate total attendance days for the current month (excluding holidays and Sundays).
   */
  useEffect(() => {
    if (!canEditAttendance && isEditable) {
      setIsEditable(false);
    }
  }, [canEditAttendance, isEditable]);

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
  }, [startTime, currentDate, holidays, workdays]);

  /**
   * Fetch holidays and workdays for the current month.
   * Returns the fetched maps for immediate use.
   */
  const fetchEvents = async () => {
    setLoading(true);
    let holidayMap = {};
    let workdayMap = {};

    try {
      const startTime = new Date(
        currentDate.getFullYear(),
        currentDate.getMonth(),
        1,
      ).getTime();
      const endTime = new Date(
        currentDate.getFullYear(),
        currentDate.getMonth() + 1,
        0,
        23,
        59,
        59,
        999,
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
            ? teacherData?.sessionId
            : role === "admin"
              ? classAndSectionData?.selectedSession?._id
              : "",
      });
      // console.log(res);

      if (res?.statusCode === 200) {
        holidayMap = res?.result?.reduce((acc, item) => {
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
            ? teacherData?.sessionId
            : role === "admin"
              ? classAndSectionData?.selectedSession?._id
              : "",
      });

      if (res2?.statusCode === 200) {
        workdayMap = res2?.result?.reduce((acc, item) => {
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

    return { holidayMap, workdayMap };
  };

  /**
   * Fetch events and attendance data when relevant state changes.
   */
  useEffect(() => {
    if (
      (role === "classTeacher" &&
        teacherData?.sectionId &&
        teacherData?.sessionId) ||
      (role === "admin" &&
        classAndSectionData?.selectedSession?.school &&
        classAndSectionData?.selectedSession?._id &&
        classAndSectionData?.sectionId &&
        classAndSectionData?.classId)
    ) {
      fetchEvents().then((data) => fetchMonthlyAttendance(data));
    }
  }, [
    currentDate,
    classAndSectionData?.selectedSession?._id,
    classAndSectionData?.selectedSession?.school,
    classAndSectionData?.sectionId,
    classAndSectionData?.classId,
    teacherData?.sessionId,
    teacherData?.sectionId,
  ]);

  /**
   * Download the attendance sheet as a PDF.
   * Uses jsPDF and jspdf-autotable for PDF generation.
   */
  const downloadAttendance = () => {
    try {
      if (loading) return;
      if (!attendanceData?.length) {
        toast.error("No attendance data to download");
        return;
      }
      setLoading(true);
      const doc = new jsPDF({
        orientation: "landscape", // required for many columns
        unit: "pt",
        format: "a4",
      });

      const monthYear = moment(currentDate).format("MMMM YYYY");

      // ===== Title =====
      doc.setFontSize(16);
      doc.text(
        `${role === "classTeacher" ? teacherData?.schoolName : role === "admin" ? data?.schoolName : ""}`,
        doc.internal.pageSize.getWidth() / 2,
        30,
        {
          align: "center",
        },
      );
      doc.text(
        "Monthly Attendance Sheet",
        doc.internal.pageSize.getWidth() / 2,
        50,
        {
          align: "center",
        },
      );

      doc.setFontSize(11);
      doc.text(
        `${classAndSectionData?.className || ""} - ${
          classAndSectionData?.sectionName || ""
        } | ${monthYear}`,
        doc.internal.pageSize.getWidth() / 2,
        65,
        { align: "center" },
      );

      // ===== Table Head =====
      const headRow = [
        "S.No",
        "Student Name",
        ...Array.from({ length: totalDays }, (_, i) => `${i + 1}`),
        "Total",
      ];

      // ===== Table Body =====
      const bodyRows = attendanceData.map((student, index) => {
        const totalPresent = student.attendances.filter(
          (a) => a.attendance === "P",
        ).length;

        return [
          index + 1,
          `${student.firstname || ""} ${student.lastname || ""}`,
          ...student.attendances.map((a) => a.attendance || ""),
          `${totalPresent}/${totalAttendanceDays}`,
        ];
      });

      // ===== AutoTable =====
      autoTable(doc, {
        startY: 80,
        head: [headRow],
        body: bodyRows,
        styles: {
          fontSize: 8,
          halign: "center",
          valign: "middle",
          cellPadding: 3,
        },
        headStyles: {
          fillColor: [40, 40, 40],
          textColor: 255,
          fontStyle: "bold",
        },
        alternateRowStyles: {
          fillColor: [245, 245, 245],
        },
        columnStyles: {
          0: { cellWidth: 40 }, // S.No
          1: { cellWidth: 120 }, // Name
        },
        didDrawPage: () => {
          doc.setFontSize(9);
          doc.text(
            `Generated on: ${moment().format("DD/MM/YYYY hh:mm A")}`,
            doc.internal.pageSize.getWidth() - 40,
            doc.internal.pageSize.getHeight() - 20,
            { align: "right" },
          );
        },
      });

      // ===== Save =====
      // doc.save(`Attendance_${monthYear}.pdf`);
      if (role === "admin") {
        doc.save(
          `Attendance_${classAndSectionData?.className}_${
            classAndSectionData?.sectionName
          }_${monthYear}.pdf`,
        );
      } else if (role === "classTeacher") {
        doc.save(
          `Attendance_${teacherData?.className}_${
            teacherData?.sectionName
          }_${monthYear}.pdf`,
        );
      }
    } catch (e) {
      toast.error("Failed to generate PDF");
    } finally {
      setTimeout(() => {
        setLoading(false);
      }, 2000);
    }
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
                      "please save the data before changing the month",
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
                      "please save the data before changing the month",
                    )
                  : changeMonth(1)
              }
            />
          </div>
          <div className={`text-white text-xl`}>Monthly Attendance</div>
          <div className={`flex flex-row w-[270px] justify-end`}>
            {isEditable ? (
              <button
                disabled={loading}
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
                  onClick={() => {
                    if (!canEditAttendance) {
                      toast.error(
                        sessionPermissions?.phase === "upcoming"
                          ? "Attendance cannot be created in upcoming session."
                          : "Previous session attendance is view only.",
                      );
                      return;
                    }

                    setIsEditable(true);
                  }}
                />
                <img
                  onClick={!loading ? downloadAttendance : undefined}
                  src={downloadw}
                  alt=""
                  className={`w-10 h-10 mx-4 transition-all duration-200 ease-in-out ${loading ? "opacity-50 cursor-not-allowed" : "cursor-pointer active:scale-90"}`}
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
          <div className="relative flex items-center">
            <div>
              <Breadcrumbs />
            </div>

            <div
              className={`absolute left-1/2 -translate-x-1/2 text-2xl font-poppins-regular ${
                isDarkMode ? "text-textPrimary" : "text-textBlack"
              }`}
            >
              Monthly Attendance Sheet
            </div>
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
                  (a) => a.attendance === "P",
                ).length;
                const totalAbsent = data.attendances.filter(
                  (a) => a.attendance === "A",
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
                      const attendance = value.attendance;
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
                              disabled={
                                !canEditAttendance ||
                                isSunday(value.date) ||
                                isHoliday(value.date)
                              }
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
                      student.attendances[dayIndex]?.attendance === "P",
                  ).length;
                  const totalAbsentForDay = attendanceData.filter(
                    (student) =>
                      student.attendances[dayIndex]?.attendance === "A",
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
