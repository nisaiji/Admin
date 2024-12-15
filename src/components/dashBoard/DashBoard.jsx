import React, { useEffect, useState } from "react";
import { Bar } from "react-chartjs-2";
import "chart.js/auto";
import eventBack from "../../assets/images/eventBack.png";
import noevents from "../../assets/images/noevents.png";
import ParentIcon from "../../assets/images/ParentIcon.png";
import DownIcon from "../../assets/images/Down.png";
import dashboardstudent from "../../assets/images/dashboardstudent.png";
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
  const [studentCountData, setStudentCountData] = useState(null);
  const [parentCount, setParentCount] = useState(0);
  const [calenderEvents, setCalenderEvents] = useState([]);
  const [chartData, setChartData] = useState(null);
  const [classList, setClassList] = useState([]);
  const [sectionList, setSectionList] = useState([]);
  const [selectedClass, setSelectedClass] = useState("");
  const [selectedSection, setSelectedSection] = useState("");
  const [eventLoading, setEventLoading] = useState(false);
  const [loading, setLoading] = useState(false);
  const [totalStudentClassSectionWise, setTotalStudentClassSectionWise] =
    useState(1);
  const [date, setDate] = useState({
    month: moment().month(),
    year: moment().year(),
  });

  const daysInMonth = new Date(date.year, date.month + 1, 0).getDate();

  // Centralized the axios request logic to reduce repetitive code.
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

  // student count api
  const getStudentCount = async () => {
    const url = isTeacher
      ? EndPoints.TEACHER.STUDENT_COUNT
      : EndPoints.ADMIN.STUDENT_COUNT;
    const today = new Date();
    const startTime = new Date(
      today.getFullYear(),
      today.getMonth(),
      today.getDate()
    ).getTime();
    const endTime = new Date(
      today.getFullYear(),
      today.getMonth(),
      today.getDate(),
      23,
      59,
      59,
      999
    ).getTime();
    const result = await fetchData(`${url}`, "post", { startTime, endTime });
    setStudentCountData(result?.totalCount);
    setStudentPresentCountData(result?.presentCount);
  };

  // parent count api
  const getParentCount = async () => {
    const url = isTeacher
      ? EndPoints.TEACHER.PARENT_COUNT
      : EndPoints.ADMIN.PARENT_COUNT;
    const result = await fetchData(`${url}`);

    if (result) setParentCount(result.parentCount);
  };

  // returns class and section list
  const getClassList = async () => {
    const result = await fetchData(EndPoints.COMMON.CLASS_LIST);

    if (result) {
      setClassList(result);
      const [firstClass] = result;
      setSectionList(firstClass?.section || []);
      setSelectedClass(firstClass?._id || "");
      setSelectedSection(firstClass?.section[0]?._id || "");
    }
  };

  useEffect(() => {
    getStudentCount();
    getParentCount();
    getClassList();
  }, []);

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

  // return startTime and endTime of current week
  function getCurrentWeekDates() {
    const currentDate = new Date();
    const dayOfWeek = currentDate.getDay();
    const diff = (dayOfWeek === 0 ? -6 : 1) - dayOfWeek;
    // Start date (Monday)
    const startTime = new Date(currentDate);
    startTime.setDate(currentDate.getDate() + diff);
    startTime.setHours(0, 0, 0, 0);
    // End date (Sunday)
    const endTime = new Date(startTime);
    endTime.setDate(startTime.getDate() + 6);
    endTime.setHours(23, 59, 59, 999);
    return {
      startTime: startTime.getTime(),
      endTime: endTime.getTime(),
    };
  }

  // Transform attendance data into array of 7 for weekly data
  const transformWeeklyData = (attendanceData) => {
    const weekData = Array(7).fill({ present: 0, absent: 0 });

    attendanceData.forEach((item) => {
      const dayIndex = new Date(item.date).getDay(); // Get day of the week (0-6)
      weekData[dayIndex] = {
        present: item.presentCount,
        absent: item.absentCount,
      };
    });

    return weekData;
  };

  // Transform attendance data into array for the full month
  const transformMonthlyData = (attendanceData, daysInMonth) => {
    const monthData = Array.from({ length: daysInMonth }, () => ({
      present: 0,
      absent: 0,
    }));

    attendanceData.forEach((item) => {
      const dayIndex = new Date(item.date).getDate() - 1; // Get day of the month (0-based index)
      monthData[dayIndex] = {
        present: item.presentCount,
        absent: item.absentCount,
      };
    });

    return monthData;
  };

  // api for monthly, weekly chart
  const getAttendanceChart = async (type) => {
    const currentDates =
      type === "Weekly"
        ? getCurrentWeekDates()
        : {
            startTime: new Date(date.year, date.month, 1).getTime(),
            endTime: new Date(
              date.year,
              date.month + 1,
              0,
              23,
              59,
              59,
              999
            ).getTime(),
          };
    setLoading(true);

    const result = await fetchData(
      `${EndPoints.ADMIN.DASHBOARD_ATTENDANCE_STATUS}/${selectedSection}`,
      "post",
      currentDates
    );

    if (result) {
      if (type === "Weekly")
        weeklyData(result?.sectionAttendance, result?.totalStudent);
      else monthlyData(result?.sectionAttendance, result?.totalStudent);
      setTotalStudentClassSectionWise(result?.totalStudent);
    }
    setLoading(false);
  };

  useEffect(() => {
    if (selectedSection) {
      getAttendanceChart(selectedOption);
    }
  }, [selectedSection, selectedOption]);

  const handleOptionChange = (event) => setSelectedOption(event.target.value);

  // Weekly data of chart
  const weeklyData = (attendanceData, total) => {
    const transformedData = transformWeeklyData(attendanceData);
    const absentData = transformedData.map((day) => day.absent);
    const presentData = transformedData.map((day) => day.present);

    const data = {
      labels: CONSTANT.WEEKDAYS,
      datasets: [
        {
          label: "Absent",
          data: absentData,
          backgroundColor: "#FE4040",
          barThickness: 50,
          borderRadius: 14,
        },
        {
          label: "Present",
          data: presentData,
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

  // Monthly data of chart
  const monthlyData = (attendanceData, total) => {
    const daysInMonth = new Date(date.year, date.month + 1, 0).getDate();
    const transformedData = transformMonthlyData(attendanceData, daysInMonth);
    const absentData = transformedData.map((day) => day.absent);
    const presentData = transformedData.map((day) => day.present);

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
          backgroundColor: "#E9EEF2",
          barThickness: 20,
        },
      ],
    };
    setChartData(data);
  };

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
              const startOfWeek = new Date(); // Replace with your starting date if needed
              const currentDate = new Date(
                startOfWeek.getFullYear(),
                startOfWeek.getMonth(),
                startOfWeek.getDate() + index
              );
              return currentDate.toLocaleDateString("en-GB"); // Format: dd/mm/yyyy
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

  const renderStudentCount = () => {
    if (studentCountData > 0) {
      return `${studentPresentCountData || 0}/${studentCountData || 0}`;
    } else {
      return "0";
    }
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

  return (
    <div className="relative w-full min-h-screen bg-[#93a3b6]/25">
      <Toaster position="top-center" reverseOrder={false} />
      <div className="container mx-[20px] py-[15px] justify-center">
        <div className="bg-[#fafafa] justify-center rounded-[16px] w-full mx-8">
          <h1 className="text-xl font-semibold p-3 pl-10 pt-6">
            {/* {t("dashboard.title")} */}
            {localStorage.getItem("schoolName") || schoolName}
          </h1>
          <hr className="mx-5" />
          {/* Grids */}
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6 mb-4 p-4 pl-10">
            <div className="flex items-center justify-between p-6 rounded-2xl bg-[#0F4189]/5 mb-2 mt-2">
              <div className="px-3">
                <p className="text-base font-medium text-[#9391A5]">
                  {t("dashboard.students")}
                </p>
                <p className="text-3xl mt-2 font-bold text-[#0F4189]">
                  {renderStudentCount()}
                </p>
              </div>
              <img src={dashboardstudent} className="w-12 h-12 mr-4" />
            </div>
            <div className="flex items-center justify-between p-6 rounded-2xl bg-[#FF793F]/5 mb-2 mt-2">
              <div className="px-3">
                <p className="text-base font-medium text-[#9391A5]">
                  {t("dashboard.parents")}
                </p>
                <p className="text-3xl mt-2 font-bold text-[#FF793F]">
                  {parentCount}
                </p>
              </div>
              <img
                src={ParentIcon}
                alt="User Graduate"
                className="w-12 h-12 mr-4"
              />
            </div>
          </div>
        </div>

        <div className="grid grid-rows-1 lg:grid-rows-1 gap-4">
          <div className="bg-[#fafafa] justify-center p-6 w-full rounded-[16px] relative mx-8">
            <div className="flex justify-between mb-2">
              <h2 className="text-xl font-semibold pl-5">
                {t("dashboard.attendance")}
              </h2>
              {/* Graph toggle button */}
              <div className="flex justify-evenly bg-[#E9EEF2] w-48 p-1 rounded-[12px] h-8">
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

              <div className="flex space-x-2 p-1 ">
                <select
                  className="px-4 w-25 h-[28px] border-2 border-[rgba(196, 196, 196, 0.40)] text-[14px] font-medium rounded-[8px] justify-center items-center"
                  value={selectedClass}
                  onChange={(e) => {
                    setSelectedClass(e.target.value);
                    const classData = classList.filter(
                      (itm) => itm["_id"] == e.target.value
                    );
                    setSectionList(classData[0]["section"]);
                    setSelectedSection("");
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
                  className="px-4 w-26 h-[28px] border-2 border-[rgba(196, 196, 196, 0.40)] text-[14px] font-medium rounded-[8px] justify-center items-center"
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
            </div>
            <hr />
            {/* Bar Graph */}
            {loading && (
              <div className="absolute inset-0 flex items-center justify-center bg-[#fafafa] bg-opacity-50 z-30 mx-8 w-full">
                <Spinner />
              </div>
            )}
            <div className="flex justify-center mb-4">
              <div
                className={`h-96 flex justify-center ${
                  selectedOption === "Weekly" ? "w-8/12" : "w-11/12"
                }`}
              >
                {renderChart()}
              </div>
            </div>
          </div>

          {/* Calender */}
          <div className="flex">
            <div className="bg-[#fafafa] p-6 w-7/12 rounded-[16px] mr-[25px] mx-8">
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
            <div className="bg-[#fafafa] py-2 px-8 w-5/12 rounded-[16px] relative">
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
                  {eventLoading && (
                    <div className="absolute inset-0 flex items-center justify-center bg-[#fafafa] bg-opacity-50 z-30">
                      <Spinner />
                    </div>
                  )}
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
