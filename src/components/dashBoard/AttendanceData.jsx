import React, { useEffect, useState } from "react";
import { useTranslation } from "react-i18next";
import DownIconw from "../../assets/images/dropdown.png";
import DownIcon from "../../assets/images/darkmode/downArrow.png";
import moment from "moment";
import Spinner from "../Spinner";
import { FormControl, InputLabel, MenuItem, Select } from "@mui/material";
import { ArcElement, Chart, Legend, Tooltip } from "chart.js";
import { Doughnut } from "react-chartjs-2";
import "chart.js/auto";
import CONSTANT, { C } from "../../utils/constants";
import { axiosClient } from "../../services/axiosClient";
import EndPoints from "../../services/EndPoints";
import toast from "react-hot-toast";
import { setClassAndSectionData } from "../../store/AppAuthSlice";
import { useDispatch } from "react-redux";
import { ChevronRight, ChevronLeft, ChevronDown } from "lucide-react";
import { motion, AnimatePresence } from "motion/react";

/* ─── Chart Dropdown ─────────────────────────────────────────── */
function ChartDropdown({ value, options, onChange }) {
    const [open, setOpen] = useState(false);
    const ref = React.useRef(null);
    useEffect(() => {
        if (!open) return;
        const h = (e) => { if (ref.current && !ref.current.contains(e.target)) setOpen(false); };
        document.addEventListener("mousedown", h);
        return () => document.removeEventListener("mousedown", h);
    }, [open]);
    return (
        <div ref={ref} style={{ position: "relative" }}>
            <button onClick={() => setOpen(p => !p)} style={{
                display: "flex", alignItems: "center", gap: 6, padding: "6px 12px", borderRadius: "8px",
                background: open ? "rgba(255,255,255,0.1)" : "rgba(255,255,255,0.05)",
                border: `1px solid ${open ? "rgba(255,255,255,0.18)" : "rgba(255,255,255,0.1)"}`,
                color: C.text, fontSize: "13px", fontWeight: 600, cursor: "pointer", transition: "all 0.15s",
            }}>
                {value}
                <ChevronDown size={13} color={C.textSub} style={{ transform: open ? "rotate(180deg)" : "none", transition: "transform 0.2s" }} />
            </button>
            <AnimatePresence>
                {open && (
                    <motion.div initial={{ opacity: 0, y: -6 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -6 }}
                        transition={{ duration: 0.15 }}
                        style={{
                            position: "absolute", top: "calc(100% + 6px)", right: 0, zIndex: 200, background: "#1a1d28",
                            border: "1px solid rgba(255,255,255,0.12)", borderRadius: "10px", overflow: "hidden",
                            minWidth: "120px", boxShadow: "0 8px 24px rgba(0,0,0,0.4)"
                        }}>
                        {options.map(opt => (
                            <button key={opt} onClick={() => { onChange(opt); setOpen(false); }} style={{
                                display: "block", width: "100%", textAlign: "left", padding: "9px 14px",
                                background: opt === value ? C.blueDim : "transparent", border: "none",
                                color: opt === value ? "#7EB3FF" : C.text, fontSize: "13px",
                                fontWeight: opt === value ? 600 : 400, cursor: "pointer", transition: "all 0.1s",
                            }}
                                onMouseEnter={e => { if (opt !== value) e.currentTarget.style.background = "rgba(255,255,255,0.04)"; }}
                                onMouseLeave={e => { if (opt !== value) e.currentTarget.style.background = "transparent"; }}>
                                {opt}
                            </button>
                        ))}
                    </motion.div>
                )}
            </AnimatePresence>
        </div>
    );
}

/* ─── Chart Tooltip ──────────────────────────────────────────── */
function ChartTooltip({ data, x, y, viewMode, date }) {
    let dayName = "";
    if (viewMode === "Weekly") {
        dayName = data.day;
    } else {
        const currentDate = new Date(date.year, date.month, data.day);
        dayName = currentDate.toLocaleDateString("en-IN", { weekday: "short" });
    }
    return (
        <div style={{
            position: "fixed", left: x + 12, top: y - 10, zIndex: 999,
            background: "#111315", border: "1px solid rgba(104,104,104,0.35)",
            borderRadius: "10px", padding: "11px 14px", pointerEvents: "none",
            boxShadow: "0 8px 24px rgba(0,0,0,0.5)", minWidth: "160px",
        }}>
            <p style={{ margin: "0 0 8px", fontSize: "12px", fontWeight: 700, color: C.text }}>
                {viewMode === "Monthly" ? `${dayName}, ${data.day} ${moment().month(date.month).format("MMM")} ${date.year}` : dayName}
            </p>
            <div style={{ display: "flex", alignItems: "center", gap: 6, marginBottom: 4 }}>
                <span style={{ width: 9, height: 9, borderRadius: "50%", background: C.red, flexShrink: 0, display: "block" }} />
                <span style={{ fontSize: "12px", color: C.text }}>{data.absent} Absent</span>
            </div>
            <div style={{ display: "flex", alignItems: "center", gap: 6 }}>
                <span style={{ width: 9, height: 9, borderRadius: "50%", background: C.green, flexShrink: 0, display: "block" }} />
                <span style={{ fontSize: "12px", color: C.text }}>{data.present} Present</span>
            </div>
        </div>
    );
}

export default function AttendanceData({
  isDarkMode,
  role,
  teacherData,
  classAndSectionData,
  date,
}) {
  const [t] = useTranslation();
  const dispatch = useDispatch();
  const [selectedOption, setSelectedOption] = useState("Monthly");
  const [loading, setLoading] = useState(false);
  const [selectedClass, setSelectedClass] = useState("");
  const [classList, setClassList] = useState([]);
  const [sectionList, setSectionList] = useState([]);
  const [selectedSection, setSelectedSection] = useState("");
  const [startTime, setStartTime] = useState("");
  const [studentPresentCountData, setStudentPresentCountData] = useState(null);
  const [studentAbsentCountData, setStudentAbsentCountData] = useState(null);
  const [totalStudentClassSectionWise, setTotalStudentClassSectionWise] =
    useState(1);
  const [chartData, setChartData] = useState(null);
  const [hovered, setHovered] = useState(null);

  const daysInMonth = new Date(date.year, date.month + 1, 0).getDate();

  const handleOptionChange = (event) => setSelectedOption(event.target.value);

  const classOptions = [
    "preNursery",
    "nursery",
    "LKG",
    "UKG",
    "one",
    "two",
    "three",
    "four",
    "five",
    "six",
    "seven",
    "eight",
    "nine",
    "ten",
    "eleven",
    "twelve",
  ].map((key) => t(`options.${key}`));

  // Gets the start and end of the current day
  const getStartEndOfDay = () => ({
    startTime: moment().startOf("day").valueOf(),
    endTime: moment().endOf("day").valueOf(),
  });

  // Gets the start and end of the current week
  const getStartEndOfWeek = () => ({
    startTime: moment().startOf("Week").valueOf(),
    endTime: moment().endOf("Week").valueOf(),
  });

  // Gets the start and end of the current month
  const getStartEndOfMonth = () => ({
    startTime: moment().startOf("month").valueOf(),
    endTime: moment().endOf("month").valueOf(),
  });

  /**
   * State initialization for attendance times (day, week, month)
   */
  const [attendanceTime, setAttendanceTime] = useState({
    day: getStartEndOfDay(),
    week: getStartEndOfWeek(),
    month: getStartEndOfMonth(),
  });

  // Function to handle date changes (previous/next)
  const handleChangeDate = (direction) => {
    setAttendanceTime((prev) => {
      const newTime = { ...prev };

      if (selectedOption === "Daily") {
        newTime.day.startTime = moment(prev.day.startTime)
          .add(direction === "next" ? 1 : -1, "days")
          .startOf("day")
          .valueOf();

        newTime.day.endTime = moment(prev.day.endTime)
          .add(direction === "next" ? 1 : -1, "days")
          .endOf("day")
          .valueOf();
      } else if (selectedOption === "Weekly") {
        newTime.week.startTime = moment(prev.week.startTime)
          .add(direction === "next" ? 1 : -1, "week")
          .startOf("week")
          .valueOf();

        newTime.week.endTime = moment(prev.week.endTime)
          .add(direction === "next" ? 1 : -1, "week")
          .endOf("week")
          .valueOf();
      } else if (selectedOption === "Monthly") {
        newTime.month.startTime = moment(prev.month.startTime)
          .add(direction === "next" ? 1 : -1, "month")
          .startOf("month")
          .valueOf();

        newTime.month.endTime = moment(prev.month.endTime)
          .add(direction === "next" ? 1 : -1, "month")
          .endOf("month")
          .valueOf();
      }

      const sessionStartYear = classAndSectionData?.selectedSession?.academicStartYear;
      const sessionEndYear = classAndSectionData?.selectedSession?.academicEndYear;

      if (sessionStartYear && sessionEndYear) {
        const minDate = new Date(sessionStartYear, 3, 1).getTime();
        const maxDate = new Date(sessionEndYear, 2, 31, 23, 59, 59, 999).getTime();

        if (selectedOption === "Daily" && (newTime.day.startTime > maxDate || newTime.day.endTime < minDate)) {
          return prev;
        }
        if (selectedOption === "Weekly" && (newTime.week.startTime > maxDate || newTime.week.endTime < minDate)) {
          return prev;
        }
        if (selectedOption === "Monthly" && (newTime.month.startTime > maxDate || newTime.month.endTime < minDate)) {
          return prev;
        }
      }

      return newTime;
    });
  };

  /**
   * Adjust attendance time when the session changes so that it stays
   * within the start and end year boundaries.
   */
  useEffect(() => {
    if (classAndSectionData?.selectedSession) {
      const sessionStartYear = classAndSectionData.selectedSession.academicStartYear;
      const sessionEndYear = classAndSectionData.selectedSession.academicEndYear;
      if (sessionStartYear && sessionEndYear) {
        const currentDate = new Date();
        const minDate = new Date(sessionStartYear, 3, 1); // April 1st
        const maxDate = new Date(sessionEndYear, 2, 31, 23, 59, 59); // March 31st

        let targetDate = currentDate;
        if (currentDate < minDate) {
          targetDate = minDate;
        } else if (currentDate > maxDate) {
          targetDate = maxDate;
        }

        setAttendanceTime({
          day: {
            startTime: moment(targetDate).startOf("day").valueOf(),
            endTime: moment(targetDate).endOf("day").valueOf(),
          },
          week: {
            startTime: moment(targetDate).startOf("week").valueOf(),
            endTime: moment(targetDate).endOf("week").valueOf(),
          },
          month: {
            startTime: moment(targetDate).startOf("month").valueOf(),
            endTime: moment(targetDate).endOf("month").valueOf(),
          },
        });
      }
    }
  }, [classAndSectionData?.selectedSession]);

  // Register required chart elements
  Chart.register(ArcElement, Tooltip, Legend);
  const renderPieChart = () => {
    const hasAttendance =
      studentPresentCountData > 0 || studentAbsentCountData > 0;

    const data = {
      labels: hasAttendance ? ["Present", "Absent", "NA"] : ["No Attendance"],
      datasets: [
        {
          data: hasAttendance
            ? [
              studentPresentCountData,
              studentAbsentCountData,
              totalStudentClassSectionWise -
              (studentPresentCountData + studentAbsentCountData),
            ]
            : [1],
          backgroundColor: hasAttendance
            ? [C.green, "rgba(254,64,64,0.4)", "rgba(56,74,113,0.3)"]
            : ["rgba(255,255,255,0.05)"],
          borderWidth: 0,
        },
      ],
    };

    const options = {
      cutout: "70%", // Makes the pie chart hollow (controls the doughnut size)
      plugins: {
        legend: {
          display: false,
        },
        tooltip: {
          enabled: hasAttendance, // Disable tooltip when no attendance
        },
        // Custom plugin to show totalStudents at the center
        centerText: {
          display: true,
          text: `Attendance ${studentPresentCountData}/${totalStudentClassSectionWise}`,
          color: C.text,
          font: {
            size: "18px",
            weight: "bold",
          },
        },
      },
      maintainAspectRatio: false,
      responsive: true,
    };

    // Define the plugin for showing center text
    Chart.register({
      id: "centerText",
      beforeDraw(chart) {
        if (chart.config.options.plugins.centerText?.display) {
          const { width } = chart;
          const { height } = chart;
          const ctx = chart.ctx;
          const text = chart.config.options.plugins.centerText.text;
          const fontSize = chart.config.options.plugins.centerText.font.size;
          const fontWeight =
            chart.config.options.plugins.centerText.font.weight;
          const color = chart.config.options.plugins.centerText.color;

          ctx.save();
          ctx.font = `${fontWeight} ${fontSize} sans-serif`;
          ctx.fillStyle = color;
          ctx.textAlign = "center";
          ctx.textBaseline = "middle";
          ctx.fillText(text, width / 2, height / 2);
          ctx.restore();
        }
      },
    });

    return (
      <div style={{ width: "100%", height: "100%" }}>
        <Doughnut data={data} options={options} />
      </div>
    );
  };

  // Empty weekly data
  const emptyWeeklyChartView = {
    labels: CONSTANT.WEEKDAYS,
    datasets: [
      {
        label: "Present",
        data: [],
        backgroundColor: isDarkMode ? "#4CBC9A" : "#FF793F",
        barThickness: 50,
        borderRadius: 14,
      },
      {
        label: "Absent",
        data: [],
        backgroundColor: isDarkMode ? "#FE404026" : "#D9E2E9",
        barThickness: 50,
        borderRadius: 14,
      },
    ],
  };

  // Empty monthly data
  const emptyMonthlyChartView = {
    labels: Array.from({ length: daysInMonth }, (_, i) => i + 1),
    datasets: [
      {
        label: "Present",
        data: [],
        backgroundColor: isDarkMode ? "#4CBC9A" : "#FF793F",
        barThickness: 20,
      },
      {
        label: "Absent",
        data: [],
        backgroundColor: isDarkMode ? "#FE404026" : "#D9E2E9",
        barThickness: 20,
      },
    ],
  };

  // Chart options for customizing the chart display
  const chartOptions = {
    maintainAspectRatio: false,
    scales: {
      x: {
        stacked: true,
        grid: { display: false },
      },
      y: {
        min: 0,
        max: totalStudentClassSectionWise,
        ticks: { stepSize: Math.ceil(totalStudentClassSectionWise / 10) },
        stacked: true,
        grid: { display: false },
      },
    },
    plugins: {
      tooltip: {
        callbacks: {
          title: (tooltipItems) => {
            if (!tooltipItems || tooltipItems.length === 0) return "";

            const index = tooltipItems[0].dataIndex;

            // Calculate the date for Weekly or Monthly view
            if (selectedOption === "Weekly") {
              // Assuming the week starts on the current date
              const currentDate = moment(attendanceTime.week.startTime)
                .startOf("day")
                .day(index)
                .valueOf();
              return moment(currentDate).format("DD/MM/yyyy"); // Format: dd/mm/yyyy
            } else if (selectedOption === "Monthly") {
              const year = date.year; // Year from your data
              const month = date.month; // Month from your data (0-indexed)
              const currentDate = new Date(year, month, index + 1);
              return currentDate.toLocaleDateString("en-GB"); // Format: dd/mm/yyyy
            }
            return "";
          },
          label: (tooltipItem) => {
            if (!tooltipItem) return "";
            const dataset = tooltipItem.dataset || {};
            const value = dataset.data?.[tooltipItem.dataIndex] || 0;
            return `${dataset.label || "Value"}: ${value}`;
          },
        },
      },
    },
  };

  // render charts of weekly and monthly
  const renderChart = () => (
    <Bar
      data={
        chartData ||
        (selectedOption === "Weekly"
          ? emptyWeeklyChartView
          : emptyMonthlyChartView)
      }
      options={chartOptions}
    />
  );

  /**
   * Fetches and sets the list of available classes and their corresponding sections.
   */
  const getClassList = async () => {
    try {
      if (!classAndSectionData?.selectedSession?._id) {
        return;
      }
      const res = await axiosClient.get(
        `${EndPoints.COMMON.CLASS_LIST}/${classAndSectionData?.selectedSession?._id}`,
      );

      if (res?.statusCode === 200) {
        // Filter out classes without sections and then sort them.
        const filteredSortedClasses = res?.result
          .filter((cls) => cls?.section?.length > 0)
          .sort((a, b) => {
            const aIndex = classOptions.indexOf(a.name);
            const bIndex = classOptions.indexOf(b.name);
            return aIndex - bIndex;
          });

        setClassList(filteredSortedClasses);
        // console.log(filteredSortedClasses);
        dispatch(setClassAndSectionData({ classList: filteredSortedClasses }));
        const [firstClass] = filteredSortedClasses;
        setSectionList(firstClass?.section || []);
      }
    } catch (e) {
      // toast.error(e);
    }
  };

  // fetch classlist when mount and session changes for admin
  useEffect(() => {
    if (role === "admin" && classAndSectionData?.selectedSession?._id) {
      getClassList();
    }
  }, [classAndSectionData?.selectedSession?._id]);

  /**
   * Fetches daily attendance chart data for the teacher or specific section.
   */
  const getDailyAttendanceChart = async () => {
    try {
      const url = EndPoints.ADMIN.DASHBOARD_ATTENDANCE_STATUS;
      const payload = {
        startTime: attendanceTime.day.startTime,
        endTime: attendanceTime.day.endTime,
        sessionId: classAndSectionData?.selectedSession?._id,
      };
      setLoading(true);
      const response = await axiosClient.post(url, payload);

      const result = response?.result;
      if (response?.statusCode === 200) {
        setStudentAbsentCountData(
          result?.sectionAttendance?.[0]?.absentCount || 0,
        );
        setStudentPresentCountData(
          result?.sectionAttendance?.[0]?.presentCount || 0,
        );
        setTotalStudentClassSectionWise(result?.totalStudent);
      }
    } catch (e) {
      toast.error(e);
    } finally {
      setLoading(false);
    }
  };

  /**
   * Fetches and sets the student count for present, absent, and total students
   * based on the selected time range (day).
   */
  const getStudentCount = async () => {
    try {
      const url =
        role === "classTeacher"
          ? EndPoints.TEACHER.STUDENT_COUNT
          : role === "admin"
            ? EndPoints.ADMIN.STUDENT_COUNT
            : "";
      const res = await axiosClient.post(url, {
        startTime: attendanceTime.day.startTime,
        endTime: attendanceTime.day.endTime,
        sessionId:
          role === "classTeacher"
            ? teacherData?.sessionId
            : role === "admin"
              ? classAndSectionData?.selectedSession?._id
              : "",
      });
      if (res?.statusCode === 200) {
        setStudentAbsentCountData(res?.result?.absentCount || 0);
        setStudentPresentCountData(res?.result?.presentCount || 0);
        setTotalStudentClassSectionWise(res?.result?.totalCount || 0);
      }
    } catch (e) {
      // console.log(e);
    }
  };

  /**
   * Transforms weekly attendance data into an array of 7 days.
   *
   * @param {Array} attendanceData - The attendance data for the week.
   * @returns {Array} - Transformed weekly attendance data.
   */
  const transformWeeklyData = (attendanceData) => {
    const weekData = Array(7).fill({ present: 0, absent: 0, na: 0 });

    attendanceData.forEach((item) => {
      const dayIndex = new Date(item?.date).getDay() % 7;
      weekData[dayIndex] = {
        present: item.presentCount,
        absent: item.absentCount,
        na:
          totalStudentClassSectionWise -
          (item?.presentCount + item?.absentCount),
      };
    });

    return weekData;
  };

  // Weekly data of chart
  const weeklyData = (attendanceData, total) => {
    const transformedData = transformWeeklyData(attendanceData);

    const absentData = transformedData.map((day) => day.absent);
    const presentData = transformedData.map((day) => day.present);
    const NAData = transformedData.map((day) => day.na);

    const data = {
      labels: CONSTANT.WEEKDAYS,
      datasets: [
        {
          label: "Present",
          data: presentData,
          backgroundColor: isDarkMode ? "#4CBC9A" : "#FF793F",
          barThickness: 50,
          borderRadius: 14,
        },
        {
          label: "Absent",
          data: absentData,
          backgroundColor: isDarkMode ? "#FE404026" : "#D9E2E9",
          barThickness: 50,
          borderRadius: 14,
        },
        {
          label: "NA",
          data: NAData,
          backgroundColor: isDarkMode ? "#384A714D" : "#E9EEF2",
          barThickness: 50,
          borderRadius: 14,
        },
      ],
    };
    setChartData(data);
  };

  /**
   * Transforms monthly attendance data into an array for the full month.
   *
   * @param {Array} attendanceData - The attendance data for the month.
   * @param {number} daysInMonth - Number of days in the current month.
   * @returns {Array} - Transformed monthly attendance data.
   */
  const transformMonthlyData = (attendanceData, daysInMonth) => {
    const monthData = Array.from({ length: daysInMonth }, () => ({
      present: 0,
      absent: 0,
      na: 0,
    }));

    attendanceData.forEach((item) => {
      const dayIndex = new Date(item?.date).getDate() - 1; // Get day of the month (0-based index)
      monthData[dayIndex] = {
        present: item?.presentCount,
        absent: item?.absentCount,
        na:
          totalStudentClassSectionWise -
          (item?.presentCount + item?.absentCount),
      };
    });

    return monthData;
  };

  // Function to process and display monthly attendance data
  const monthlyData = (attendanceData, total) => {
    const daysInMonth = moment(attendanceTime.month.startTime).daysInMonth();
    const transformedData = transformMonthlyData(attendanceData, daysInMonth);
    // Extract absent, present, and NA data
    const absentData = transformedData.map((day) => day.absent);
    const presentData = transformedData.map((day) => day.present);
    const NAData = transformedData.map((day) => day.na);
    const data = {
      labels: Array.from({ length: daysInMonth }, (_, i) => i + 1),
      datasets: [
        {
          label: "Present",
          data: presentData,
          backgroundColor: isDarkMode ? "#4CBC9A" : "#FF793F",
          barThickness: 20,
        },
        {
          label: "Absent",
          data: absentData,
          backgroundColor: isDarkMode ? "#FE404026" : "#D9E2E9",
          barThickness: 20,
        },
        {
          label: "NA",
          data: NAData,
          backgroundColor: isDarkMode ? "#384A714D" : "#E9EEF2",
          barThickness: 20,
        },
      ],
    };
    setChartData(data);
  };

  // api for monthly, weekly chart
  const getAttendanceChart = async (type) => {
    try {
      const currentDates =
        type === "Weekly"
          ? {
            startTime: attendanceTime.week.startTime,
            endTime: attendanceTime.week.endTime,
          }
          : {
            startTime: attendanceTime.month.startTime,
            endTime: attendanceTime.month.endTime,
          };
      if (role === "admin") {
        currentDates.sessionId = classAndSectionData?.selectedSession?._id;
      }
      setLoading(true);
      const url =
        role === "classTeacher"
          ? EndPoints.TEACHER.DASHBOARD_ATTENDANCE_STATUS
          : role === "admin"
            ? `${EndPoints.ADMIN.DASHBOARD_ATTENDANCE_STATUS}/${selectedSection}`
            : "";

      const response = await axiosClient.post(url, currentDates);

      const result = response?.result;
      if (response?.statusCode === 200) {
        if (type === "Weekly")
          weeklyData(result?.sectionAttendance, result?.totalStudent);
        else monthlyData(result?.sectionAttendance, result?.totalStudent);
        setTotalStudentClassSectionWise(result?.totalStudent);
      }
    } catch (e) {
      toast.error(e);
    } finally {
      setLoading(false);
    }
  };

  // api for monthly, weekly chart for school
  const getSchoolAttendanceChart = async (type) => {
    try {
      let currentDates =
        type === "Weekly"
          ? {
            startTime: attendanceTime.week.startTime,
            endTime: attendanceTime.week.endTime,
          }
          : {
            startTime: attendanceTime.month.startTime,
            endTime: attendanceTime.month.endTime,
          };
      if (role === "admin") {
        currentDates.sessionId = classAndSectionData?.selectedSession?._id;
      }

      setLoading(true);

      const res = await axiosClient.post(
        `${EndPoints.ADMIN.DASHBOARD_ATTENDANCE_STATUS}`,
        currentDates,
      );

      if (res?.statusCode === 200) {
        if (type === "Weekly") {
          weeklyData(res?.result?.attendances, res?.result?.totalStudent);
        } else {
          monthlyData(res?.result?.attendances, res?.result?.totalStudent);
        }
        setTotalStudentClassSectionWise(res?.result?.totalStudents);
      }
    } catch (e) {
      // console.log(e);
    } finally {
      setLoading(false);
    }
  };

  // fetch attendance data based on selectedOption
  useEffect(() => {
    const fetchChartData = () => {
      if (selectedOption === "Daily") {
        if (role === "classTeacher" || selectedSection) {
          getDailyAttendanceChart();
        } else if (role === "admin") {
          getStudentCount();
        }
      } else {
        if (selectedSection) {
          getAttendanceChart(selectedOption);
        } else {
          role === "classTeacher"
            ? getAttendanceChart(selectedOption)
            : role === "admin"
              ? getSchoolAttendanceChart(selectedOption)
              : "";
        }
      }
    };
    fetchChartData();
  }, [
    selectedSection,
    selectedOption,
    attendanceTime,
    classAndSectionData?.selectedSession?._id,
  ]);

  const sessionStartYear = classAndSectionData?.selectedSession?.academicStartYear;
  const sessionEndYear = classAndSectionData?.selectedSession?.academicEndYear;

  const minDate = sessionStartYear ? new Date(sessionStartYear, 3, 1).getTime() : 0;
  const maxDate = sessionEndYear ? new Date(sessionEndYear, 2, 31, 23, 59, 59, 999).getTime() : Infinity;

  let isPrevDisabled = false;
  let isNextDisabled = false;

  if (selectedOption === "Daily") {
    isPrevDisabled = attendanceTime.day.startTime <= minDate;
    isNextDisabled = attendanceTime.day.endTime >= maxDate;
  } else if (selectedOption === "Weekly") {
    isPrevDisabled = attendanceTime.week.startTime <= minDate;
    isNextDisabled = attendanceTime.week.endTime >= maxDate;
  } else if (selectedOption === "Monthly") {
    isPrevDisabled = attendanceTime.month.startTime <= minDate;
    isNextDisabled = attendanceTime.month.endTime >= maxDate;
  }

  const getCustomChartData = () => {
    let raw = [];
    if (selectedOption === "Weekly" || selectedOption === "Monthly") {
         if (chartData && chartData.labels && chartData.datasets.length >= 3) {
             raw = chartData.labels.map((lbl, idx) => ({
                 day: lbl,
                 present: chartData.datasets[0].data[idx] || 0,
                 absent: chartData.datasets[1].data[idx] || 0,
                 na: chartData.datasets[2].data[idx] || 0,
                 total: totalStudentClassSectionWise || 1
             }));
         } else {
             const labels = selectedOption === "Weekly" ? CONSTANT.WEEKDAYS : Array.from({length: daysInMonth}, (_,i)=>i+1);
             raw = labels.map(lbl => ({ day: lbl, present: 0, absent: 0, na: 0, total: 1 }));
         }
    }
    return raw;
  };

  const customChartData = getCustomChartData();
  const MAX_H = 220;
  const rawMax = totalStudentClassSectionWise || 1;
  const step = Math.ceil(rawMax / 5) || 1;
  const MAX_AXIS = step * 5;
  
  let yLabels = [];
  for (let i = 5; i >= 0; i--) yLabels.push(i * step);

  const classOptionsNames = classList.map(c => c.name);
  const selectedClassName = classList.find(c => c._id === selectedClass)?.name || "Select Class";
  const sectionOptionsNames = sectionList?.map(s => s.name) || [];
  const selectedSectionName = sectionList?.find(s => s._id === selectedSection)?.name || "Select Section";

  const handleClassDropdown = (v) => {
    const selectedObj = classList.find(c => c.name === v);
    if (selectedObj) {
        setSelectedClass(selectedObj._id);
        setSectionList(selectedObj.section);
        if (selectedObj.section && selectedObj.section.length > 0) {
            setSelectedSection(selectedObj.section[0]._id);
            setStartTime(selectedObj.section[0].startTime || "");
        } else {
            setSelectedSection("");
            setStartTime("");
        }
    }
  };

  const handleSectionDropdown = (v) => {
    const selectedObj = sectionList.find(c => c.name === v);
    if (selectedObj) setSelectedSection(selectedObj._id);
  };

  const displayedDateStr = selectedOption === "Daily"
    ? moment(attendanceTime.day.startTime).format("dddd, D MMM YYYY")
    : selectedOption === "Weekly"
    ? `${moment(attendanceTime.week.startTime).format("D MMM")} - ${moment(attendanceTime.week.endTime).format("D MMM YYYY")}`
    : moment(attendanceTime.month.startTime).format("MMMM YYYY");

  return (
    <div style={{ background: C.card, border: `1px solid ${C.border}`, borderRadius: "16px", overflow: "hidden", marginBottom: "20px", display: "flex", flexDirection: "column", minHeight: "360px", position: "relative" }}>
      {/* Header */}
      <div style={{ padding: "18px 24px 14px", borderBottom: `1px solid ${C.borderSoft}`, display: "flex", alignItems: "center", gap: "12px", flexWrap: "wrap", justifyContent: "space-between" }}>
        <span style={{ fontSize: "18px", fontWeight: 700, color: C.text }}>{t("dashboard.attendance")}</span>
        
        <div style={{ display: "flex", alignItems: "center", gap: "12px", flexWrap: "wrap" }}>
            <div style={{ display: "flex", gap: "4px", padding: "4px", background: "rgba(255,255,255,0.05)", border: `1px solid ${C.border}`, borderRadius: "10px" }}>
                {(["Daily", "Weekly", "Monthly"]).map(m => (
                    <button key={m} onClick={() => handleOptionChange({ target: { value: m } })} style={{
                        padding: "5px 16px", borderRadius: "7px", background: selectedOption === m ? C.blue : "transparent",
                        border: "none", color: selectedOption === m ? "#fff" : C.textSub, fontSize: "13px", fontWeight: 600,
                        cursor: "pointer", transition: "all 0.2s",
                    }}>{t(`dashboard.${m.toLowerCase()}`)}</button>
                ))}
            </div>

            {role === "admin" && (
              <div style={{ display: "flex", gap: "8px" }}>
                <ChartDropdown value={selectedClassName} options={classOptionsNames} onChange={handleClassDropdown} />
                <ChartDropdown value={selectedSectionName} options={sectionOptionsNames} onChange={handleSectionDropdown} />
              </div>
            )}
        </div>
      </div>

      {loading && (
        <div style={{ position: "absolute", inset: 0, display: "flex", alignItems: "center", justifyContent: "center", background: "rgba(11, 13, 20, 0.5)", zIndex: 10 }}>
          <Spinner />
        </div>
      )}

      {/* Date Navigator */}
      <div style={{ padding: "14px 24px 0", display: "flex", alignItems: "center", gap: "14px" }}>
        <button onClick={!isPrevDisabled ? () => handleChangeDate("previous") : undefined} style={{ width: 28, height: 28, borderRadius: "50%", background: "rgba(255,255,255,0.06)", border: `1px solid ${C.border}`, color: C.textSub, display: "flex", alignItems: "center", justifyContent: "center", cursor: isPrevDisabled ? "not-allowed" : "pointer", opacity: isPrevDisabled ? 0.3 : 1 }}>
            <ChevronLeft size={14} />
        </button>
        <span style={{ fontSize: "15px", fontWeight: 600, color: "rgba(227,232,243,0.75)", minWidth: "200px", textAlign: "center" }}>{displayedDateStr}</span>
        <button onClick={!isNextDisabled ? () => handleChangeDate("next") : undefined} style={{ width: 28, height: 28, borderRadius: "50%", background: "rgba(255,255,255,0.06)", border: `1px solid ${C.border}`, color: C.textSub, display: "flex", alignItems: "center", justifyContent: "center", cursor: isNextDisabled ? "not-allowed" : "pointer", opacity: isNextDisabled ? 0.3 : 1 }}>
            <ChevronRight size={14} />
        </button>

        <div style={{ marginLeft: "auto", display: "flex", gap: "16px", alignItems: "center" }}>
            {[{ color: "rgba(254,64,64,0.4)", label: "Absent" }, { color: C.green, label: "Present" }, { color: "rgba(56,74,113,0.3)", label: "NA" }].map(l => (
                <div key={l.label} style={{ display: "flex", alignItems: "center", gap: 5 }}>
                    <span style={{ width: 10, height: 10, borderRadius: "50%", background: l.color, display: "block" }} />
                    <span style={{ fontSize: "12px", color: C.textSub }}>{l.label}</span>
                </div>
            ))}
        </div>
      </div>

      {/* Chart Section */}
      <div style={{ padding: "16px 24px 20px", display: "flex", gap: "12px", flex: 1, minHeight: "260px" }}>
        {selectedOption === "Daily" ? (
            <div style={{ width: "100%", height: "100%", display: "flex", justifyContent: "center" }}>
              <div style={{ height: "240px", width: "240px" }}>
                 {renderPieChart()}
              </div>
            </div>
        ) : (
            <>
                <div style={{ display: "flex", flexDirection: "column", justifyContent: "space-between", height: MAX_H + 4, paddingBottom: "4px", flexShrink: 0 }}>
                    {yLabels.map(v => <span key={v} style={{ fontSize: "12px", color: "#686868", lineHeight: 1, textAlign: "right", width: "24px" }}>{v}</span>)}
                </div>
                <div style={{ flex: 1, overflow: "hidden" }}>
                    <div style={{ position: "relative", height: MAX_H }}>
                        {yLabels.slice(0, -1).map((v, i) => (
                            <div key={v} style={{ position: "absolute", left: 0, right: 0, top: `${(i / (yLabels.length - 1)) * 100}%`, borderTop: "1px solid rgba(104,104,104,0.12)" }} />
                        ))}
                        <div style={{ position: "absolute", inset: 0, display: "flex", alignItems: "flex-end", gap: selectedOption === "Monthly" ? "4px" : "30px", paddingBottom: "1px" }}>
                            {customChartData.map((d, i) => {
                                const totalH = (d.total / MAX_AXIS) * MAX_H;
                                const presentH = (d.present / MAX_AXIS) * MAX_H;
                                const absentH = (d.absent / MAX_AXIS) * MAX_H;
                                const naH = (d.na / MAX_AXIS) * MAX_H;
                                const domId = `chart-bar-${i}`;
                                const isHov = hovered?.id === domId;
                                return (
                                    <div key={i} style={{ flex: selectedOption === "Monthly" ? "1 0 0" : "0 0 45px", maxWidth: selectedOption === "Monthly" ? "24px" : "45px", height: `${totalH}px`, position: "relative", cursor: "pointer" }}
                                        onMouseEnter={e => { const r = e.currentTarget.getBoundingClientRect(); setHovered({ id: domId, data: d, x: r.right, y: r.top }); }}
                                        onMouseLeave={() => setHovered(null)}>
                                        <div style={{ position: "absolute", bottom: `${presentH + absentH}px`, left: 0, right: 0, height: `${naH}px`, background: isHov ? "rgba(56,74,113,0.55)" : "rgba(56,74,113,0.3)", borderRadius: "4px 4px 0 0", transition: "background 0.15s" }} />
                                        <div style={{ position: "absolute", bottom: `${presentH}px`, left: 0, right: 0, height: `${absentH}px`, background: isHov ? C.red : "rgba(254,64,64,0.4)", borderRadius: presentH === 0 && naH === 0 ? "4px" : naH === 0 ? "4px 4px 0 0" : "0", transition: "background 0.15s" }} />
                                        <div style={{ position: "absolute", bottom: 0, left: 0, right: 0, height: `${presentH}px`, background: C.green, borderRadius: absentH === 0 && naH === 0 ? "4px" : "0 0 4px 4px", opacity: isHov ? 1 : 0.85, transition: "opacity 0.15s" }} />
                                    </div>
                                );
                            })}
                        </div>
                    </div>
                    <div style={{ display: "flex", alignItems: "flex-end", gap: selectedOption === "Monthly" ? "4px" : "30px", paddingTop: "8px" }}>
                        {customChartData.map((d, i) => (
                            <div key={i} style={{ flex: selectedOption === "Monthly" ? "1 0 0" : "0 0 45px", maxWidth: selectedOption === "Monthly" ? "24px" : "45px", textAlign: "center", fontSize: "11px", color: "#686868" }}>
                                {selectedOption === "Monthly" ? (d.day % 5 === 1 || d.day === 1 ? d.day : "") : d.day}
                            </div>
                        ))}
                    </div>
                </div>
            </>
        )}
      </div>

      <AnimatePresence>
        {hovered && hovered.data && (
            <motion.div initial={{ opacity: 0, scale: 0.95 }} animate={{ opacity: 1, scale: 1 }} exit={{ opacity: 0, scale: 0.95 }} transition={{ duration: 0.1 }}>
                <ChartTooltip data={hovered.data} x={hovered.x} y={hovered.y} viewMode={selectedOption} date={date} />
            </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
