import React, { useEffect, useState } from "react";
import { Bar } from "react-chartjs-2";
import "chart.js/auto";
import eventBack from "../../assets/images/eventBack.png";
import Studenthat from "../../assets/images/Studenthat.png";
import ParentIcon from "../../assets/images/ParentIcon.png";
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
  const [selectedOption, setSelectedOption] = useState("Monthly");
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

    if (result) setStudentCountData(result.presentCount, result.totalCount);
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
    const endTime = new Date(date.year, date.month + 1, 0).getTime();
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
            endTime: new Date(date.year, date.month + 1, 0).getTime(),
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
    const absentData = transformedData.map((day) => total - day.present);
    const presentData = transformedData.map((day) => day.present);

    const data = {
      labels: CONSTANT.WEEKDAYS,
      datasets: [
        {
          label: "Absent",
          data: absentData,
          backgroundColor: "#DD1B10",
          barThickness: 50,
          borderRadius: 10,
        },
        {
          label: "Present",
          data: presentData,
          backgroundColor: "#7B79FF33",
          barThickness: 50,
          borderRadius: 10,
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
        backgroundColor: "#DD1B10",
        barThickness: 50,
        borderRadius: 10,
      },
      {
        label: "Present",
        data: [],
        backgroundColor: "#7B79FF33",
        barThickness: 50,
        borderRadius: 10,
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
        backgroundColor: "#DD1B10",
        barThickness: 20,
      },
      {
        label: "Present",
        data: [],
        backgroundColor: "#7B79FF33",
        barThickness: 20,
      },
    ],
  };

  // Monthly data of chart
  const monthlyData = (attendanceData, total) => {
    const daysInMonth = new Date(date.year, date.month + 1, 0).getDate();
    const transformedData = transformMonthlyData(attendanceData, daysInMonth);
    const absentData = transformedData.map((day) => total - day.present);
    const presentData = transformedData.map((day) => day.present);

    const data = {
      labels: Array.from({ length: daysInMonth }, (_, i) => i + 1),
      datasets: [
        {
          label: "Absent",
          data: absentData,
          backgroundColor: "#DD1B10",
          barThickness: 20,
        },
        {
          label: "Present",
          data: presentData,
          backgroundColor: "#7B79FF33",
          barThickness: 20,
        },
      ],
    };
    setChartData(data);
  };

  const chartOptions = {
    maintainAspectRatio: false,
    scales: {
      x: { stacked: true, grid: { display: false } },
      y: {
        min: 0,
        max: totalStudentClassSectionWise,
        ticks: { stepSize: Math.ceil(totalStudentClassSectionWise / 10) },
        stacked: true,
        grid: { display: false },
      },
    },
  };

  const renderStudentCount = () => {
    if (studentCountData?.totalCount > 0) {
      return `${studentCountData?.presentCount || 0}/${
        studentCountData?.totalCount || 0
      }`;
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
    <div className="relative w-full min-h-screen bg-white bg-gradient-to-t from-[rgba(138,137,250,0.1)] to-[rgba(138,137,250,0.1)]">
      <Toaster position="top-center" reverseOrder={false} />
      <div className="container mx-auto p-8">
        <div className="bg-white rounded-2xl">
          <h1 className="text-3xl font-bold mb-0 p-3 pl-10 pt-8">
            {t("dashboard.title")}
          </h1>

          {/* Grids */}
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6 mb-10 p-4 pl-10">
            <div className="flex items-center justify-between p-3 rounded-2xl bg-[#7B79FF1A] mb-4">
              <div className="px-3">
                <p className="text-base font-poppins-regular text-[#686868]">
                  {t("dashboard.students")}
                </p>
                <p className="text-3xl mt-3 font-bold text-[#7B79FF]">
                  {renderStudentCount()}
                </p>
              </div>
              <img src={Studenthat} className="w-12 h-12 mr-4" />
            </div>
            <div className="flex items-center justify-between p-4 rounded-2xl bg-[#4CBC9A1A] mb-4">
              <div className="px-3">
                <p className="text-base font-poppins-regular text-[#686868]">
                  {t("dashboard.parents")}
                </p>
                <p className="text-3xl mt-3 font-bold text-[#4CBC9A]">
                  {parentCount}
                </p>
              </div>
              <img
                src={ParentIcon}
                alt="User Graduate"
                className="w-10 h-10 mr-4"
              />
            </div>
          </div>
        </div>

        <div className="grid grid-rows-1 lg:grid-rows-1 gap-6 mb-10">
          <div className="bg-white p-6 rounded-lg shadow-lg relative">
            <div className="flex justify-between mb-10">
              <h2 className="text-2xl font-semibold pl-5">
                {t("dashboard.attendance")}
              </h2>
              {/* Graph toggle button */}
              <div className="flex justify-evenly bg-[#f2f2f4] w-56 p-2 rounded-full">
                <button
                  className={`px-5 py-1 rounded-full font-poppins-regular ${
                    selectedOption === "Weekly"
                      ? "bg-[#05022B] text-[#fafafa]"
                      : " text-[#05022B]"
                  }`}
                  onClick={() =>
                    handleOptionChange({ target: { value: "Weekly" } })
                  }
                >
                  {t("dashboard.weekly")}
                </button>
                <button
                  className={`px-5 py-1 rounded-full font-poppins-regular ${
                    selectedOption === "Monthly"
                      ? "bg-[#05022B] text-[#fafafa]"
                      : " text-[#05022B]"
                  }`}
                  onClick={() =>
                    handleOptionChange({ target: { value: "Monthly" } })
                  }
                >
                  {t("dashboard.monthly")}
                </button>
              </div>

              <div className="flex space-x-2 ">
                <select
                  className="px-2 border-2 border-[#05022B99] rounded-xl"
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
                  className="px-2 border-2 border-[#05022B99] rounded-xl"
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

            {/* Bar Graph */}
            {loading && (
              <div className="absolute inset-0 flex items-center justify-center bg-white bg-opacity-50 z-30">
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
            <div className="bg-white p-6 w-8/12 rounded-lg shadow-lg mr-4">
              <h2 className="text-xl font-semibold">
                {t("dashboard.calendar")}
              </h2>
              <hr className="mt-5" />
              <div className="flex justify-center">
                <div className="w-full h-screen rounded-lg ">
                  <CalendarComponent
                    events={calenderEvents}
                    updateDate={(newDate) => setDate(newDate)}
                  />
                </div>
              </div>
            </div>

            {/* event list */}
            <div className="bg-white py-4 px-8 w-4/12 rounded-lg shadow-lg relative">
              <h2 className="text-xl font-semibold mb-4 mt-4">
                {t("dashboard.holidayAndEvents")}
              </h2>
              {calenderEvents.length === 0 ? (
                <div className="relative w-full h-full">
                  <img
                    src={eventBack}
                    alt="Event Background"
                    className="absolute inset-0 w-auto h-auto object-cover"
                  />
                </div>
              ) : (
                <div>
                  {eventLoading && (
                    <div className="absolute inset-0 flex items-center justify-center bg-white bg-opacity-50 z-30">
                      <Spinner />
                    </div>
                  )}
                  <div className="overflow-y-auto max-h-screen">
                    {calenderEvents.map((itm, index) => (
                      <div
                        key={index}
                        className="mb-5 shadow-sm rounded-lg overflow-hidden border-l-8 border-red-600"
                      >
                        <div className="flex h-5 justify-between items-center bg-[#ffffff] text-red-500 font-poppins px-2 text-lg">
                          <div className="font-poppins-bold text-xl mt-4 mb-2 ml-4">
                            {moment(itm?.date).format("DD MMMM YYYY, ddd")}
                          </div>
                        </div>
                        <div className="bg-[#ffffff] mt-2">
                          <div className="flex py-1 justify-between items-center">
                            <div
                              className={`${
                                false ? "bg-[#102945] text-white" : ""
                              } py-0 px-2 ml-4 text-base font-semibold`}
                            >
                              {itm.title}
                            </div>
                          </div>
                          <div className="flex pb-3 justify-between items-center">
                            <div
                              className={`${
                                false ? "bg-[#102945] text-white" : ""
                              } py-0 px-2 ml-4 text-xs font-poppins-regular`}
                            >
                              {itm.description}
                            </div>
                            <div className="flex">
                              {itm.holiday && (
                                <div className="px-3 py-1 mr-3 rounded-3xl bg-[#d91111] text-white text-sm">
                                  {t("dashboard.holiday")}
                                </div>
                              )}
                              {itm.event && (
                                <div className="px-3 py-1 mr-3 text-center text-sm font-medium rounded-3xl bg-[#464590] text-white">
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
