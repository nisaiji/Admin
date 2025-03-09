import React, { useEffect, useState } from "react";
import { Bar, Doughnut } from "react-chartjs-2";
import "chart.js/auto";
import { Chart, ArcElement, Tooltip, Legend } from "chart.js";
import noevents from "../../assets/images/noevents.png";
import DownIcon from "../../assets/images/Down.png";
import CalendarComponent from "./CalendarComponent.jsx";
import { useSelector } from "react-redux";
import EndPoints from "../../services/EndPoints.js";
import moment from "moment";
import { axiosClient } from "../../services/axiosClient";
import Spinner from "../Spinner.jsx";
import { useTranslation } from "react-i18next";
import toast, { Toaster } from "react-hot-toast";
import CONSTANT from "../../utils/constants.js";

const Dashboard = () => {
  const [t] = useTranslation();
  const isTeacher = useSelector((state) => state.appAuth.role) === "teacher";
  const schoolName = useSelector((state) => state.appAuth.schoolName);
  const [selectedOption, setSelectedOption] = useState("Monthly");
  const [studentPresentCountData, setStudentPresentCountData] = useState(null);
  const [studentAbsentCountData, setStudentAbsentCountData] = useState(null);
  const [calenderEvents, setCalenderEvents] = useState([]);
  const [chartData, setChartData] = useState(null);
  const [classList, setClassList] = useState([]);
  const [sectionList, setSectionList] = useState([]);
  const [selectedClass, setSelectedClass] = useState("");
  const [selectedSection, setSelectedSection] = useState("");
  const [startTime, setStartTime] = useState("");
  const [eventLoading, setEventLoading] = useState(false);
  const [loading, setLoading] = useState(false);
  const [totalStudentClassSectionWise, setTotalStudentClassSectionWise] =
    useState(1);
  const [date, setDate] = useState({
    month: moment().month(),
    year: moment().year(),
  });
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

  const daysInMonth = new Date(date.year, date.month + 1, 0).getDate();

  /**
   * Helper function to fetch data from an API.
   *
   * @param {string} url - The API endpoint.
   * @param {string} method - HTTP method (default is 'get').
   * @param {object} data - Request payload for POST or PUT requests.
   * @returns {Promise<any>} - Returns the fetched data or null if there's an error.
   */
  const fetchData = async (url, method = "get", data = null) => {
    try {
      const response = await axiosClient[method](
        url,
        data ? { ...data } : null
      );

      if (response?.statusCode === 200) {
        return response.result;
      }
    } catch (e) {
      toast.error(e);
    }
    return null;
  };

  /**
   * Fetches and sets the student count for present, absent, and total students
   * based on the selected time range (day).
   */
  const getStudentCount = async () => {
    const url = isTeacher
      ? EndPoints.TEACHER.STUDENT_COUNT
      : EndPoints.ADMIN.STUDENT_COUNT;
    const result = await fetchData(`${url}`, "post", {
      startTime: attendanceTime.day.startTime,
      endTime: attendanceTime.day.endTime,
    });
    setStudentAbsentCountData(result?.absentCount || 0);
    setStudentPresentCountData(result?.presentCount || 0);
    setTotalStudentClassSectionWise(result?.totalCount || 0);
  };

  /**
   * Fetches and sets the list of available classes and their corresponding sections.
   */
  const getClassList = async () => {
    const result = await fetchData(EndPoints.COMMON.CLASS_LIST);

    if (result) {
      // Filter out classes without sections and then sort them.
      const filteredSortedClasses = result
        .filter((cls) => cls?.section?.length > 0)
        .sort((a, b) => {
          const aIndex = classOptions.indexOf(a.name);
          const bIndex = classOptions.indexOf(b.name);
          return aIndex - bIndex;
        });

      setClassList(filteredSortedClasses);
      const [firstClass] = filteredSortedClasses;
      setSectionList(firstClass?.section || []);
    }
  };

  useEffect(() => {
    getClassList();
  }, []);

  /**
   * Fetches calendar events based on the selected month.
   */
  const getCalenderEvents = async () => {
    const startTime = new Date(date.year, date.month, 1).getTime();
    const endTime = new Date(
      date.year,
      date.month + 1,
      0,
      23,
      59,
      59,
      999
    ).getTime();
    setEventLoading(true);
    const result = await fetchData(EndPoints.COMMON.GET_EVENTS, "post", {
      startTime,
      endTime,
    });

    if (result) setCalenderEvents(result);
    setEventLoading(false);
  };

  useEffect(() => {
    getCalenderEvents();
  }, [date]);

  /**
   * Transforms weekly attendance data into an array of 7 days.
   *
   * @param {Array} attendanceData - The attendance data for the week.
   * @returns {Array} - Transformed weekly attendance data.
   */
  const transformWeeklyData = (attendanceData) => {
    const weekData = Array(7).fill({ present: 0, absent: 0, na: 0 });

    attendanceData.forEach((item) => {
      const dayIndex = new Date(item.date).getDay() % 7;
      weekData[dayIndex] = {
        present: item.presentCount,
        absent: item.absentCount,
        na:
          totalStudentClassSectionWise - (item.presentCount + item.absentCount),
      };
    });

    return weekData;
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
      const dayIndex = new Date(item.date).getDate() - 1; // Get day of the month (0-based index)
      monthData[dayIndex] = {
        present: item.presentCount,
        absent: item.absentCount,
        na:
          totalStudentClassSectionWise - (item.presentCount + item.absentCount),
      };
    });

    return monthData;
  };

  /**
   * Fetches daily attendance chart data for the teacher or specific section.
   */
  const getDailyAttendanceChart = async () => {
    try {
      const url = isTeacher
        ? EndPoints.TEACHER.DASHBOARD_ATTENDANCE_STATUS
        : `${EndPoints.ADMIN.DASHBOARD_ATTENDANCE_STATUS}/${selectedSection}`;
      setLoading(true);
      const response = await axiosClient.post(url, {
        startTime: attendanceTime.day.startTime,
        endTime: attendanceTime.day.endTime,
      });
      const result = response?.result;
      if (response?.statusCode === 200) {
        setStudentAbsentCountData(
          result?.sectionAttendance[0]?.absentCount || 0
        );
        setStudentPresentCountData(
          result?.sectionAttendance[0]?.presentCount || 0
        );
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
    setLoading(true);

    const result = await fetchData(
      `${EndPoints.ADMIN.DASHBOARD_ATTENDANCE_STATUS}`,
      "post",
      currentDates
    );

    if (result) {
      if (type === "Weekly") {
        weeklyData(result?.attendances, result?.totalStudent);
      } else {
        monthlyData(result?.attendances, result?.totalStudent);
      }
      setTotalStudentClassSectionWise(result?.totalStudents);
    }
    setLoading(false);
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
      setLoading(true);
      const url = isTeacher
        ? EndPoints.TEACHER.DASHBOARD_ATTENDANCE_STATUS
        : `${EndPoints.ADMIN.DASHBOARD_ATTENDANCE_STATUS}/${selectedSection}`;

      const response = await axiosClient.post(url, currentDates);

      const result = response.result;
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

  useEffect(() => {
    const fetchChartData = () => {
      if (selectedOption === "Daily") {
        if (isTeacher || selectedSection) {
          getDailyAttendanceChart();
        } else {
          getStudentCount();
        }
      } else {
        if (selectedSection) {
          getAttendanceChart(selectedOption);
        } else {
          isTeacher
            ? getAttendanceChart(selectedOption)
            : getSchoolAttendanceChart(selectedOption);
        }
      }
    };
    fetchChartData();
  }, [selectedSection, selectedOption, attendanceTime]);

  const handleOptionChange = (event) => setSelectedOption(event.target.value);

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
          label: "Absent",
          data: absentData,
          backgroundColor: "#FF793F",
          barThickness: 50,
          borderRadius: 14,
        },
        {
          label: "Present",
          data: presentData,
          backgroundColor: "#D9E2E9",
          barThickness: 50,
          borderRadius: 14,
        },
        {
          label: "NA",
          data: NAData,
          backgroundColor: "#E9EEF2",
          barThickness: 50,
          borderRadius: 14,
        },
      ],
    };
    setChartData(data);
  };

  // Empty weekly data
  const emptyWeeklyChartView = {
    labels: CONSTANT.WEEKDAYS,
    datasets: [
      {
        label: "Absent",
        data: [],
        backgroundColor: "#FF793F",
        barThickness: 50,
        borderRadius: 14,
      },
      {
        label: "Present",
        data: [],
        backgroundColor: "#E9EEF2",
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
        label: "Absent",
        data: [],
        backgroundColor: "#FF793F",
        barThickness: 20,
      },
      {
        label: "Present",
        data: [],
        backgroundColor: "#E9EEF2",
        barThickness: 20,
      },
    ],
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
          label: "Absent",
          data: absentData,
          backgroundColor: "#FF793F",
          barThickness: 20,
        },
        {
          label: "Present",
          data: presentData,
          backgroundColor: "#D9E2E9",
          barThickness: 20,
        },
        {
          label: "NA",
          data: NAData,
          backgroundColor: "#E9EEF2",
          barThickness: 20,
        },
      ],
    };
    setChartData(data);
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

  // Register required chart elements
  Chart.register(ArcElement, Tooltip, Legend);
  const renderPieChart = () => {
    const hasAttendance =
      studentPresentCountData > 0 || studentAbsentCountData > 0;
    const totalStudents = studentPresentCountData + studentAbsentCountData;

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
            ? ["#D9E2E9", "#FF793F", "#E9EEF2"]
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

  // Function to render the clock with current time
  const Clock = () => {
    const [currentTime, setCurrentTime] = useState(
      moment().format("DD-MM-YYYY hh:mm:ss A")
    );

    useEffect(() => {
      const timer = setInterval(() => {
        setCurrentTime(moment().format("DD-MM-YYYY hh:mm:ss A"));
      }, 1000); // Update every second

      return () => clearInterval(timer); // Cleanup on unmount
    }, []);

    return <div className="text-xl font-poppins-regular">{currentTime}</div>;
  };

  return (
    <div className="relative w-full min-h-screen bg-[#93a3b6]/25 select-none">
      <Toaster position="top-center" reverseOrder={false} />
      <div className="container mx-[20px] py-[15px] justify-center">
        <div className="grid grid-rows-1 lg:grid-rows-1 gap-3">
          <div className="bg-[#fafafa] flex justify-between rounded-[16px] w-full mx-8 px-8 p-5">
            <h1 className="text-xl font-semibold">
              {localStorage.getItem("schoolName") || schoolName}
            </h1>
            <Clock />
          </div>
          <hr className="mx-5" />
          <div className="bg-[#fafafa] justify-center p-6 w-full rounded-[16px] relative mx-8">
            <div className="flex justify-between mb-2">
              <h2 className="text-xl font-semibold pl-5">
                {t("dashboard.attendance")}
              </h2>
              {/* Graph toggle button */}
              <div className="flex justify-evenly bg-[#E9EEF2] w-64 p-1 rounded-[12px] h-8">
                <button
                  className={`px-5 py-1 rounded-[8px] font-medium text-[12px] ${
                    selectedOption === "Daily"
                      ? "bg-[#0F4189] h-6 text-[#fafafa]"
                      : " text-[#040320]"
                  }`}
                  onClick={() =>
                    handleOptionChange({ target: { value: "Daily" } })
                  }
                >
                  {t("dashboard.daily")}
                </button>
                <button
                  className={`px-5 py-1 rounded-[8px] font-medium text-[12px] ${
                    selectedOption === "Weekly"
                      ? "bg-[#0F4189] h-6 text-[#fafafa]"
                      : " text-[#040320]"
                  }`}
                  onClick={() =>
                    handleOptionChange({ target: { value: "Weekly" } })
                  }
                >
                  {t("dashboard.weekly")}
                </button>
                <button
                  className={`px-5 py-1 rounded-[8px] font-medium text-[12px] ${
                    selectedOption === "Monthly"
                      ? "bg-[#0F4189] h-6 text-[#fafafa]"
                      : " text-[#040320]"
                  }`}
                  onClick={() =>
                    handleOptionChange({ target: { value: "Monthly" } })
                  }
                >
                  {t("dashboard.monthly")}
                </button>
              </div>
              {/* date change buttons */}
              <div className="flex justify-between items-center space-x-2 w-[270px]">
                <img
                  src={DownIcon}
                  onClick={() => handleChangeDate("previous")}
                  alt=""
                  className="h-3 w-5 rotate-90 object-contain cursor-pointer"
                />
                <div className="text-base font-poppins-regular">
                  {selectedOption === "Daily"
                    ? moment(attendanceTime.day.startTime).format(
                        "dddd, DD MMM YYYY"
                      )
                    : selectedOption === "Weekly"
                    ? `${moment(attendanceTime.week.startTime).format(
                        "D MMM YYYY"
                      )} - ${moment(attendanceTime.week.endTime).format(
                        "D MMM YYYY"
                      )}`
                    : moment(attendanceTime.month.startTime).format(
                        "MMMM YYYY"
                      )}
                </div>
                {!(
                  selectedOption === "Daily" &&
                  attendanceTime.day.startTime ===
                    moment().startOf("day").valueOf()
                ) &&
                !(
                  selectedOption === "Weekly" &&
                  attendanceTime.week.startTime ===
                    moment().startOf("week").valueOf()
                ) &&
                !(
                  selectedOption === "Monthly" &&
                  attendanceTime.month.startTime ===
                    moment().startOf("month").valueOf()
                ) ? (
                  <img
                    src={DownIcon}
                    onClick={() => handleChangeDate("next")}
                    alt=""
                    className="h-3 w-5 -rotate-90 object-contain cursor-pointer"
                  />
                ) : (
                  <img
                    src={DownIcon}
                    alt=""
                    className="h-3 w-5 -rotate-90 object-contain opacity-5 cursor-not-allowed"
                  />
                )}
              </div>
            </div>
            <hr />
            {/* Bar Graph */}
            {loading && (
              <div className="absolute inset-0 flex items-center justify-center bg-[#fafafa] bg-opacity-50 z-30 mx-8 w-full">
                <Spinner />
              </div>
            )}
            <div className="flex justify-end items-center py-3">
              {/* class and section dropdoown */}
              {!isTeacher && (
                <div className="flex space-x-2 p-1 ">
                  <select
                    className="px-4 w-25 h-[28px] border-2 border-[rgba(196, 196, 196, 0.40)] text-[14px] bg-[#E9EEF2]/50 hover:bg-[#E9EEF2] font-medium rounded-[8px] justify-center items-center"
                    value={selectedClass}
                    onChange={(e) => {
                      setSelectedClass(e.target.value);
                      const classData = classList.filter(
                        (itm) => itm["_id"] == e.target.value
                      );
                      setSectionList(classData[0]?.section);
                      setSelectedSection(classData[0]?.section[0]?._id || "");
                      setStartTime(classData[0]?.section[0]?.startTime || "");
                    }}
                  >
                    <option value="">{t("dashboard.selectClass")}</option>
                    {classList.map((itm) => {
                      return (
                        <option key={itm["_id"]} value={itm["_id"]}>
                          {itm.name}
                        </option>
                      );
                    })}
                  </select>

                  <select
                    className="px-4 w-26 h-[28px] border-2 border-[rgba(196, 196, 196, 0.40)] bg-[#E9EEF2]/50 hover:bg-[#E9EEF2] text-[14px] font-medium rounded-[8px] justify-center items-center"
                    value={selectedSection}
                    onChange={(e) => setSelectedSection(e?.target?.value)}
                  >
                    <option value="">{t("dashboard.selectSection")}</option>
                    {sectionList &&
                      sectionList.map((itm) => {
                        return (
                          <option key={itm["_id"]} value={itm["_id"]}>
                            {itm.name}
                          </option>
                        );
                      })}
                  </select>
                </div>
              )}
            </div>
            {/* Pie/Bar charts */}
            <div className="flex justify-center mb-4">
              <div
                className={`h-96 flex justify-center ${
                  selectedOption === "Weekly" ? "w-8/12" : "w-11/12"
                }`}
              >
                {selectedOption === "Daily" ? renderPieChart() : renderChart()}
              </div>
            </div>
          </div>

          {/* Calender component */}
          <div className="flex flex-row w-full mx-8 space-x-8">
            <div className="bg-[#fafafa] p-6 w-7/12 rounded-[16px]">
              <h2 className="text-xl font-semibold pl-6">
                {t("dashboard.calendar")}
              </h2>
              <hr className="mt-2" />
              <div className="flex justify-center mt-2">
                <div className="w-full h-screen. rounded-lg ">
                  <CalendarComponent
                    events={calenderEvents}
                    updateDate={(newDate) => setDate(newDate)}
                  />
                </div>
              </div>
            </div>

            {/* event list */}
            <div className="bg-[#fafafa] w-5/12 py-2 px-8 rounded-[16px]">
              <h2 className="text-xl font-semibold my-2 pl-6 mt-4">
                {t("dashboard.holidayAndEvents")}
              </h2>
              <hr className="mb-6" />
              {calenderEvents.length === 0 ? (
                <div className="relative w-full h-full">
                  <img
                    src={noevents}
                    alt="Event Background"
                    className="absolute inset-0 w-auto h-auto object-cover"
                  />
                </div>
              ) : (
                <div>
                  {/* event loading */}
                  {eventLoading && (
                    <div className="absolute inset-0 flex items-center justify-center bg-[#fafafa] bg-opacity-50 z-30">
                      <Spinner />
                    </div>
                  )}
                  {/* event list */}
                  <div className="overflow-y-auto max-h-screen">
                    {calenderEvents.map((itm, index) => (
                      <div
                        key={index}
                        className="mb-4 ml-6 rounded-lg overflow-hidden border-l-8 border-[#0F4189]"
                      >
                        <div className="flex h-0 justify-between items-center bg-[#fafafa] text-[#0F4189] font-poppins mt-2 px-2 text-lg">
                          <div className="font-medium text-sm mt-4 mb-2 ml-2">
                            {moment(itm?.date).format("DD MMMM YYYY, ddd")}
                          </div>
                        </div>
                        <div className="bg-[#fafafa] mt-4">
                          <div className="flex py-0 justify-between items-center">
                            <div
                              className={`${
                                false ? "bg-[#102945] text-white" : ""
                              } py-0 px-2 ml-2 text-xs font-semibold`}
                            >
                              {itm.title}
                            </div>
                          </div>
                          <div className="flex justify-between items-center">
                            <div
                              className={`${
                                false ? "bg-[#102945] text-white" : ""
                              } py-0 px-2 ml-2 text-xs font-poppins-regular`}
                            >
                              {itm.description}
                            </div>
                            <div className="flex">
                              {itm.holiday && (
                                <div className="py-1 px-3 mr-6 rounded-3xl bg-[#FE4040]/5 text-[#FE4040] text-xs font-bold">
                                  {t("dashboard.holiday")}
                                </div>
                              )}
                              {itm.event && (
                                <div className="py-1 mr-6 text-center text-[14px] font-bold rounded-3xl text-[#0F4189] ">
                                  {t("dashboard.Event")}
                                </div>
                              )}
                            </div>
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Dashboard;
