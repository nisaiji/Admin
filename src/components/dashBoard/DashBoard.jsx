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
  const { t } = useTranslation();
  const isTeacher = useSelector((state) => state.appAuth.role) === "teacher";
  const [selectedOption, setSelectedOption] = useState("Monthly");
  const [studentCountData, setStudentCountData] = useState();
  const [parentCount, setParentCount] = useState(0);
  const [calenderEvents, setCalenderEvents] = useState([]);
  const [chartData, setChartData] = useState();
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
  const daysInMonth = new Date(date.year, date.month, 0).getDate();

  const getStudentCount = async () => {
    let url;
    if (isTeacher) url = EndPoints.TEACHER.STUDENT_COUNT;
    else url = EndPoints.ADMIN.STUDENT_COUNT;
    try {
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
      const response = await axiosClient.post(`${url}`, { startTime, endTime });
      if (response?.statusCode === 200) {
        const { presentCount, totalCount } = response?.result;
        setStudentCountData({ presentCount, totalCount });
      }
    } catch (e) {
      toast.error(e);
    }
  };

  const getParentCount = async () => {
    let url;
    if (isTeacher) url = EndPoints.TEACHER.PARENT_COUNT;
    else url = EndPoints.ADMIN.PARENT_COUNT;
    try {
      const response = await axiosClient.get(`${url}`);
      if (response?.statusCode === 200) {
        const { parentCount } = response?.result;
        setParentCount(parentCount);
      }
    } catch (e) {
      toast.error(e);
    }
  };

  const getClassList = async () => {
    try {
      const response = await axiosClient.get(EndPoints.COMMON.CLASS_LIST);
      if (response?.statusCode === 200) {
        const { result } = response;
        setClassList(result);
        setSectionList(result[0]?.section);
        setSelectedClass(result[0]?._id);
        setSelectedSection(result[0]?.section[0]?._id);
      }
    } catch (e) {
      toast.error(e);
    }
  };

  useEffect(() => {
    getStudentCount();
    getParentCount();
    getClassList();
  }, []);

  const getCalenderEvents = async () => {
    let url;
    if (isTeacher) url = EndPoints.TEACHER.DASHBOARD_CALENDER_EVENTS;
    else url = EndPoints.COMMON.GET_EVENTS;
    try {
      const startTime = new Date(date.year, date.month, 1).getTime();
      const endTime = new Date(date.year, date.month + 1, 0).getTime();
      setEventLoading(true);
      const response = await axiosClient.post(url, { startTime, endTime });
      if (response?.statusCode === 200) {
        setCalenderEvents(response?.result);
      }
    } catch (e) {
      toast.error(e);
    } finally {
      setEventLoading(false);
    }
  };

  useEffect(() => {
    getCalenderEvents();
  }, [date]);

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

  const getWeeklyChart = async () => {
    let url;
    if (isTeacher) url = EndPoints.TEACHER.DASHBOARD_WEEKLY_ATTENDANCE;
    else url = EndPoints.ADMIN.DASHBOARD_ATTENDANCE_STATUS;
    try {
      const { startTime, endTime } = getCurrentWeekDates();
      setLoading(true);
      const response = await axiosClient.post(`${url}/${selectedSection}`, {
        startTime,
        endTime,
      });
      // console.log("r", response);
      if (response?.statusCode === 200) {
        const { sectionAttendance, totalStudent } = response?.result;
        weeklyData(sectionAttendance, totalStudent);
        setTotalStudentClassSectionWise(totalStudent);
      }
    } catch (e) {
      toast.error(e);
    } finally {
      setLoading(false);
    }
  };

  const getMonthlyChart = async () => {
    let url;
    if (isTeacher) url = EndPoints.TEACHER.DASHBOARD_MONTHLY_ATTENDANCE;
    else url = EndPoints.ADMIN.DASHBOARD_ATTENDANCE_STATUS;
    try {
      const currentDate = new Date();
      const startTime = new Date(
        currentDate.getFullYear(),
        currentDate.getMonth(),
        1
      ).getTime();
      const endTime = new Date(
        currentDate.getFullYear(),
        currentDate.getMonth() + 1,
        0
      ).getTime();
      setLoading(true);
      const response = await axiosClient.post(`${url}/${selectedSection}`, {
        startTime,
        endTime,
      });
      // console.log("r", response);

      if (response?.statusCode === 200) {
        const { sectionAttendance, totalStudent } = response?.result;
        monthlyData(sectionAttendance, totalStudent);
        setTotalStudentClassSectionWise(totalStudent);
      }
    } catch (e) {
      toast.error(e);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (selectedSection !== "") {
      if (selectedOption === "Weekly") getWeeklyChart();
      else getMonthlyChart();
    }
  }, [selectedSection, selectedOption]);

  const handleOptionChange = (event) => {
    setSelectedOption(event.target.value);
  };

  const weeklyData = (attendanceData, total) => {
    let result = attendanceData.reduce((acc, curr) => {
      acc.push(total - curr);
      return acc;
    }, []);
    const data = {
      labels: CONSTANT.WEEKDAYS,
      datasets: [
        {
          label: "Absent",
          data: result,
          backgroundColor: "#DD1B10",
          barThickness: 50,
          borderRadius: 10,
        },
        {
          label: "Present",
          data: attendanceData,
          backgroundColor: "#7B79FF33",
          barThickness: 50,
          borderRadius: 10,
        },
      ],
    };
    setChartData(data);
  };

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

  const monthlyData = (attendanceData, total) => {
    let result = attendanceData.reduce((acc, curr) => {
      acc.push(total - curr);
      return acc;
    }, []);
    const data = {
      labels: Array.from({ length: attendanceData?.length }, (_, i) => i + 1),
      datasets: [
        {
          label: "Absent",
          data: result,
          backgroundColor: "#DD1B10",
          barThickness: 20,
        },
        {
          label: "Present",
          data: attendanceData,
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
      x: {
        stacked: true,
        grid: {
          display: false,
        },
      },
      y: {
        min: 0,
        max: totalStudentClassSectionWise,
        ticks: {
          stepSize: Math.ceil(totalStudentClassSectionWise / 10),
        },
        stacked: true,
        grid: {
          display: false,
        },
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

  const renderChart = () => {
    if (selectedOption === "Weekly") {
      return (
        <Bar data={chartData || emptyWeeklyChartView} options={chartOptions} />
      );
    } else {
      return (
        <Bar data={chartData || emptyMonthlyChartView} options={chartOptions} />
      );
    }
  };

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
