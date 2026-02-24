import React, { useEffect, useState } from "react";
import { useTranslation } from "react-i18next";
import DownIconw from "../../assets/images/dropdown.png";
import DownIcon from "../../assets/images/darkmode/downArrow.png";
import moment from "moment";
import Spinner from "../Spinner";
import { FormControl, InputLabel, MenuItem, Select } from "@mui/material";
import { ArcElement, Chart, Legend, Tooltip } from "chart.js";
import { Bar, Doughnut } from "react-chartjs-2";
import "chart.js/auto";
import CONSTANT from "../../utils/constants";
import { axiosClient } from "../../services/axiosClient";
import EndPoints from "../../services/EndPoints";
import toast from "react-hot-toast";
import { setClassAndSectionData } from "../../store/AppAuthSlice";
import { useDispatch } from "react-redux";

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

      return newTime;
    });
  };

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
            ? isDarkMode
              ? ["#4CBC9A", "#FE404026", "#384A714D"]
              : ["#FF793F", "#D9E2E9", "#E9EEF2"]
            : ["gray"],
          borderWidth: 2,
        },
      ],
    };

    const options = {
      cutout: "70%", // Makes the pie chart hollow (controls the doughnut size)
      plugins: {
        legend: {
          display: true,
          position: "top",
          labels: {
            font: {
              size: 14,
            },
            color: "#333", // Legend text color
          },
        },
        tooltip: {
          enabled: hasAttendance, // Disable tooltip when no attendance
        },
        // Custom plugin to show totalStudents at the center
        centerText: {
          display: true,
          text: `Attendance ${studentPresentCountData}/${totalStudentClassSectionWise}`,
          color: "#333",
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

  return (
    <div
      className={`${
        isDarkMode
          ? "bg-gradient-to-r from-fromColor1 to-toColor1"
          : "bg-whiteBackground"
      } justify-center mx-5 mt-5 rounded-[16px] relative`}
    >
      <div className={`flex justify-between items-center py-3 px-5`}>
        <h2
          className={`text-2xl ${
            isDarkMode ? "text-textPrimary" : "text-textBlack"
          } font-semibold pl-5`}
        >
          {t("dashboard.attendance")}
        </h2>
        {/* Graph toggle button */}
        <div
          className={`flex justify-evenly bg-[#68686826] p-2 rounded-[20px]`}
        >
          <button
            className={`px-5 py-1 rounded-[14px] font-medium text-[16px] ${
              selectedOption === "Daily"
                ? "bg-[#0F4189] text-textPrimary"
                : isDarkMode
                  ? "text-textPrimary"
                  : "text-textBlack"
            }`}
            onClick={() => handleOptionChange({ target: { value: "Daily" } })}
          >
            {t("dashboard.daily")}
          </button>
          <button
            className={`px-5 py-1 rounded-[14px] font-medium text-[16px] ${
              selectedOption === "Weekly"
                ? "bg-[#0F4189] text-textPrimary"
                : isDarkMode
                  ? "text-textPrimary"
                  : "text-textBlack"
            }`}
            onClick={() => handleOptionChange({ target: { value: "Weekly" } })}
          >
            {t("dashboard.weekly")}
          </button>
          <button
            className={`px-5 py-1 rounded-[14px] font-medium text-[16px] ${
              selectedOption === "Monthly"
                ? "bg-[#0F4189] text-textPrimary"
                : isDarkMode
                  ? "text-textPrimary"
                  : "text-textBlack"
            }`}
            onClick={() => handleOptionChange({ target: { value: "Monthly" } })}
          >
            {t("dashboard.monthly")}
          </button>
        </div>
        {/* date change buttons */}
        <div
          className={`flex justify-between items-center space-x-2 w-[270px]`}
        >
          <img
            src={isDarkMode ? DownIcon : DownIconw}
            onClick={() => handleChangeDate("previous")}
            alt=""
            className={`h-7 w-7 rotate-90 object-contain cursor-pointer`}
          />
          <div
            className={`text-base ${
              isDarkMode ? "text-textPrimary" : "text-textBlack"
            } font-poppins-regular`}
          >
            {selectedOption === "Daily"
              ? moment(attendanceTime.day.startTime).format("dddd, DD MMM YYYY")
              : selectedOption === "Weekly"
                ? `${moment(attendanceTime.week.startTime).format(
                    "D MMM YYYY",
                  )} - ${moment(attendanceTime.week.endTime).format(
                    "D MMM YYYY",
                  )}`
                : moment(attendanceTime.month.startTime).format("MMMM YYYY")}
          </div>
          {!(
            selectedOption === "Daily" &&
            attendanceTime.day.startTime === moment().startOf("day").valueOf()
          ) &&
          !(
            selectedOption === "Weekly" &&
            attendanceTime.week.startTime === moment().startOf("week").valueOf()
          ) &&
          !(
            selectedOption === "Monthly" &&
            attendanceTime.month.startTime ===
              moment().startOf("month").valueOf()
          ) ? (
            <img
              src={isDarkMode ? DownIcon : DownIconw}
              onClick={() => handleChangeDate("next")}
              alt=""
              className={`h-7 w-7 -rotate-90 object-contain cursor-pointer`}
            />
          ) : (
            <img
              src={isDarkMode ? DownIcon : DownIconw}
              alt=""
              className={`h-7 w-7 -rotate-90 object-contain opacity-30 cursor-not-allowed`}
            />
          )}
        </div>
      </div>
      <hr
        className={`border ${
          isDarkMode ? "border-borderLine" : "border-borderWhite3"
        }`}
      />
      {loading && (
        <div
          className={`absolute inset-0 flex items-center justify-center bg-[#fafafa] bg-opacity-50 z-30 w-full`}
        >
          <Spinner />
        </div>
      )}
      {/* class and section list */}
      <div className={`flex justify-end items-center py-3`}>
        {/* class and section dropdoown */}
        {role === "admin" && (
          <div className={`flex space-x-2 p-1`}>
            {/* Class dropdown */}
            <FormControl
              size="small"
              sx={{
                width: "150px",
                border: "1px solid #2b2e4a40",
                borderRadius: "14px",
                backgroundColor: isDarkMode ? "" : "white",
                "& .MuiOutlinedInput-notchedOutline": {
                  border: "none",
                },
                "& .Mui-focused .MuiOutlinedInput-notchedOutline": {
                  borderColor: "white !important",
                },
                "& .MuiInputBase-root": {
                  color: isDarkMode ? "#E3E8F3" : "black",
                },
                "& .MuiSvgIcon-root": {
                  color: isDarkMode ? "#E3E8F3" : "black",
                },
              }}
            >
              <InputLabel
                id="class-select-label"
                sx={{
                  zIndex: 1,
                  backgroundColor: isDarkMode ? "" : "white",
                  color: isDarkMode ? "#E3E8F3" : "black",
                  fontSize: 14,
                  px: 0.5,
                }}
              >
                {t("dashboard.selectClass")}
              </InputLabel>
              <Select
                labelId="class-select-label"
                id="class-select"
                value={selectedClass}
                onChange={(e) => {
                  setSelectedClass(e.target.value);
                  const classData = classList.filter(
                    (itm) => itm["_id"] === e.target.value,
                  );
                  setSectionList(classData[0]?.section);
                  setSelectedSection(classData[0]?.section[0]?._id || "");
                  setStartTime(classData[0]?.section[0]?.startTime || "");
                }}
                MenuProps={{
                  PaperProps: {
                    sx: {
                      backgroundColor: isDarkMode ? "#1a1a1a" : "white",
                      color: isDarkMode ? "#E3E8F3" : "black",
                    },
                  },
                }}
              >
                <MenuItem value="">{t("dashboard.selectClass")}</MenuItem>
                {classList?.map((itm) => (
                  <MenuItem
                    key={itm["_id"]}
                    value={itm["_id"]}
                    sx={{
                      backgroundColor: isDarkMode ? "#1a1a1a" : "white",
                      color: isDarkMode ? "#E3E8F3" : "black",
                      "&:hover": {
                        backgroundColor: isDarkMode ? "#2a2a2a" : "#E9EEF2",
                      },
                    }}
                  >
                    {itm?.name}
                  </MenuItem>
                ))}
              </Select>
            </FormControl>

            {/* Section dropdown */}
            <FormControl
              size="small"
              sx={{
                width: "150px",
                border: "1px solid #2b2e4a40",
                borderRadius: "14px",
                backgroundColor: isDarkMode ? "" : "white",
                "& .MuiOutlinedInput-notchedOutline": {
                  border: "none",
                },
                "& .Mui-focused .MuiOutlinedInput-notchedOutline": {
                  borderColor: "white !important",
                },
                "& .MuiInputBase-root": {
                  color: isDarkMode ? "#E3E8F3" : "black",
                },
                "& .MuiSvgIcon-root": {
                  color: isDarkMode ? "#E3E8F3" : "black",
                },
              }}
            >
              <InputLabel
                id="section-select-label"
                sx={{
                  zIndex: 1,
                  backgroundColor: isDarkMode ? "" : "white",
                  color: isDarkMode ? "#E3E8F3" : "black",
                  fontSize: 14,
                  px: 0.5,
                }}
              >
                {t("dashboard.selectSection")}
              </InputLabel>
              <Select
                labelId="section-select-label"
                id="section-select"
                value={selectedSection}
                disabled={!selectedClass}
                onChange={(e) => setSelectedSection(e.target.value)}
                MenuProps={{
                  PaperProps: {
                    sx: {
                      backgroundColor: isDarkMode ? "#1a1a1a" : "white",
                      color: isDarkMode ? "#E3E8F3" : "black",
                      cursor: selectedClass ? "pointer" : "none",
                    },
                  },
                }}
              >
                <MenuItem value="">{t("dashboard.selectSection")}</MenuItem>
                {sectionList?.map((itm) => (
                  <MenuItem
                    key={itm["_id"]}
                    value={itm["_id"]}
                    sx={{
                      backgroundColor: isDarkMode ? "#1a1a1a" : "white",
                      color: isDarkMode ? "#E3E8F3" : "black",
                      "&:hover": {
                        backgroundColor: isDarkMode ? "#2a2a2a" : "#E9EEF2",
                      },
                    }}
                  >
                    {itm?.name}
                  </MenuItem>
                ))}
              </Select>
            </FormControl>
          </div>
        )}
      </div>

      {/* Pie/Bar charts */}
      <div className={`flex justify-center pb-5`}>
        <div
          className={`h-96 flex justify-center ${
            selectedOption === "Weekly" ? "w-8/12" : "w-11/12"
          }`}
        >
          {selectedOption === "Daily" ? renderPieChart() : renderChart()}
        </div>
      </div>
    </div>
  );
}
