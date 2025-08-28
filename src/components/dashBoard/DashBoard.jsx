import React, { useEffect, useRef, useState } from "react";
import { Bar, Doughnut } from "react-chartjs-2";
import "chart.js/auto";
import { Chart, ArcElement, Tooltip, Legend } from "chart.js";
import noeventsw from "../../assets/images/noevents.png";
import noevents from "../../assets/images/darkmode/noevents.png";
import DownIconw from "../../assets/images/dropdown.png";
import DownIcon from "../../assets/images/darkmode/downArrow.png";
import school from "../../assets/images/darkmode/school.png";
import edit from "../../assets/images/darkmode/editimg.png";
import editPhotow from "../../assets/images/darkmode/editPhotow.png";
import editPhoto from "../../assets/images/darkmode/editPhoto.png";
import CalendarComponent from "./CalendarComponent.jsx";
import { useDispatch, useSelector } from "react-redux";
import EndPoints from "../../services/EndPoints.js";
import moment from "moment";
import { axiosClient } from "../../services/axiosClient";
import Spinner from "../Spinner.jsx";
import { useTranslation } from "react-i18next";
import toast, { Toaster } from "react-hot-toast";
import CONSTANT from "../../utils/constants.js";
import {
  Chip,
  FormControl,
  InputLabel,
  MenuItem,
  Select,
  Typography,
} from "@mui/material";
import {
  fetchAdmin,
  fetchTeacher,
  setClassAndSectionData,
  updateAdminData,
} from "../../store/AppAuthSlice.jsx";
import { Box } from "@mui/system";

const Dashboard = () => {
  const [t] = useTranslation();
  const dispatch = useDispatch();
  const { classAndSectionData, classAndSectionDataOfTeacher } = useSelector(
    (state) => state.appAuth
  );
  const isTeacher = useSelector((state) => state.appAuth.role) === "teacher";
  const schoolName = useSelector((state) => state.appAuth.schoolName);
  const { data, teacherData } = useSelector((state) => state.appAuth);
  const isDarkMode = useSelector((state) => state.appConfig.isDarkMode);
  const [selectedOption, setSelectedOption] = useState("Monthly");
  const [studentPresentCountData, setStudentPresentCountData] = useState(null);
  const [studentAbsentCountData, setStudentAbsentCountData] = useState(null);
  const [calenderEvents, setCalenderEvents] = useState([]);
  const [workdays, setWorkdays] = useState([]);
  const [chartData, setChartData] = useState(null);
  const [classList, setClassList] = useState([]);
  const [sectionList, setSectionList] = useState([]);
  const [selectedClass, setSelectedClass] = useState("");
  const [selectedSection, setSelectedSection] = useState("");
  const [session, setSession] = useState([]);
  const [startTime, setStartTime] = useState("");
  const [eventLoading, setEventLoading] = useState(false);
  const [loading, setLoading] = useState(false);
  const fileInputRef = useRef(null);
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
   * Fetches calendar events based on the selected month.
   */
  const getSession = async () => {
    let url = isTeacher ? "" : EndPoints.ADMIN.GET_SESSION;
    const result = await fetchData(url, "get");
    if (result) {
      dispatch(setClassAndSectionData({ session: result }));
    }
  };

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
      sessionId: isTeacher
        ? classAndSectionDataOfTeacher?.sessionId
        : classAndSectionData?.session?.[0]?._id,
    });
    setStudentAbsentCountData(result?.absentCount || 0);
    setStudentPresentCountData(result?.presentCount || 0);
    setTotalStudentClassSectionWise(result?.totalCount || 0);
  };

  /**
   * Fetches and sets the list of available classes and their corresponding sections.
   */
  const getClassList = async () => {
    try {
      const res = await axiosClient.get(
        `${EndPoints.COMMON.CLASS_LIST}/${classAndSectionData?.session?.[0]?._id}`
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
        const [firstClass] = filteredSortedClasses;
        setSectionList(firstClass?.section || []);
      }
    } catch (e) {
      // toast.error(e);
    }
  };

  useEffect(() => {
    if (!isTeacher) {
      getSession();
      getClassList();
    }
  }, [classAndSectionData?.session?.[0]?._id]);

  useEffect(() => {
    if (isTeacher) {
      dispatch(fetchTeacher());
    } else {
      dispatch(fetchAdmin());
    }
  }, [dispatch]);

  const resizeImage = (
    file,
    maxSizeMB = 1,
    maxWidth = 1000,
    maxHeight = 1000
  ) => {
    return new Promise((resolve, reject) => {
      const image = new Image();
      const reader = new FileReader();

      reader.onload = (e) => {
        image.src = e.target.result;
      };

      image.onload = () => {
        const canvas = document.createElement("canvas");
        let width = image.width;
        let height = image.height;

        if (width > maxWidth || height > maxHeight) {
          if (width > height) {
            height *= maxWidth / width;
            width = maxWidth;
          } else {
            width *= maxHeight / height;
            height = maxHeight;
          }
        }

        canvas.width = width;
        canvas.height = height;

        const ctx = canvas.getContext("2d");
        ctx.drawImage(image, 0, 0, width, height);

        canvas.toBlob(
          (blob) => {
            const reader2 = new FileReader();
            reader2.readAsDataURL(blob);
            reader2.onloadend = () => resolve(reader2.result);
          },
          "image/jpeg",
          0.8 // adjust quality (0.0 - 1.0)
        );
      };

      reader.onerror = reject;
      image.onerror = reject;
      reader.readAsDataURL(file);
    });
  };

  const uploadPhoto = async (e) => {
    const file = e.target.files[0];
    if (!file) return;
    // console.log(
    //   `Original file size: ${(file.size / 1024 / 1024).toFixed(2)} MB`
    // );
    try {
      let base64Image;

      if (file.size > 1024 * 1024) {
        // Resize if greater than 1MB
        base64Image = await resizeImage(file);
        // const sizeInBytes =
        //   base64Image.length * (3 / 4) -
        //   (base64Image.endsWith("==") ? 2 : base64Image.endsWith("=") ? 1 : 0);
        // console.log(
        //   `Resized image size: ${(sizeInBytes / 1024 / 1024).toFixed(2)} MB`
        // );
      } else {
        // Convert to Base64
        const toBase64 = (file) =>
          new Promise((resolve, reject) => {
            const reader = new FileReader();
            reader.readAsDataURL(file);
            reader.onload = () => resolve(reader.result);
            reader.onerror = (error) => reject(error);
          });

        base64Image = await toBase64(file);
      }

      // Upload the image
      const res = await axiosClient.put(EndPoints.ADMIN.PHOTO_UPLOAD, {
        photo: base64Image,
        method: "POST",
      });

      if (res?.statusCode === 200) {
        dispatch(updateAdminData({ photo: base64Image }));
        toast.success(res?.result);
      }
    } catch (error) {
      console.error("Photo upload failed", error);
      toast.error("Photo upload failed.");
    }
  };

  /**
   * Fetches all session.
   */
  // const getSessions = async () => {
  //   let url = isTeacher
  //     ? EndPoints.TEACHER.GET_EVENTS
  //     : EndPoints.ADMIN.GET_ALL_SESSION;
  //   const res = await axiosClient.get(url);
  //   if (res?.statusCode === 200) {
  //     setSession(res?.result);
  //   }
  // };

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
    let url = isTeacher
      ? EndPoints.TEACHER.GET_EVENTS
      : EndPoints.ADMIN.GET_EVENTS;
    const result = await fetchData(url, "post", {
      startTime,
      endTime,
      sessionId: isTeacher
        ? classAndSectionDataOfTeacher?.sessionId
        : classAndSectionData?.session?.[0]?._id,
    });

    if (result) setCalenderEvents(result);

    url = isTeacher
      ? EndPoints.TEACHER.GET_SUNDAY_HOLIDAY
      : EndPoints.ADMIN.GET_SUNDAY_HOLIDAY;
    const res = await axiosClient.post(url, {
      startTime,
      endTime,
      sessionId: isTeacher
        ? classAndSectionDataOfTeacher?.sessionId
        : classAndSectionData?.session?.[0]?._id,
    });

    if (res?.statusCode === 200) {
      setWorkdays(res?.result);
    }
    setEventLoading(false);
  };

  useEffect(() => {
    // getSessions();
    getCalenderEvents();
  }, [date, classAndSectionData?.session?.[0]?._id]);

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
        // sessionId: classAndSectionData?.session[0]?._id,
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
  }, [
    selectedSection,
    selectedOption,
    attendanceTime,
    classAndSectionData?.session?.[0]?._id,
  ]);

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
      moment().format("hh:mm:ss A")
    );

    useEffect(() => {
      const timer = setInterval(() => {
        setCurrentTime(moment().format("hh:mm:ss A"));
      }, 1000); // Update every second

      return () => clearInterval(timer); // Cleanup on unmount
    }, []);

    return (
      <div
        className={`flex items-center justify-between  rounded-full px-6 py-2 shadow-md w-fit ${
          isDarkMode ? "bg-[#68686826] text-textPrimary" : "bg-whiteBackground"
        }`}
      >
        {/* Date Section */}
        <div
          className={`flex flex-col items-start pr-6 border-r border-gray-500`}
        >
          <span className={`text-xs text-gray-400`}>Date</span>
          <span className={`text-lg font-medium`}>
            {moment().format("DD-MM-YYYY")}
          </span>
        </div>

        {/* Time Section */}
        <div className={`flex flex-col items-start px-6`}>
          <span className={`text-xs text-gray-400`}>Time</span>
          <span className={`text-lg font-medium`}>{currentTime}</span>
        </div>

        {/* Edit Icon */}
        <img src={edit} alt="Edit" className={`w-10 h-10 ml-4`} />
      </div>
    );
  };

  return (
    <div
      className={`relative w-full ${
        isDarkMode ? "bg-background2" : "bg-whiteBackground2"
      } select-none`}
    >
      <Toaster position="top-center" reverseOrder={false} />
      {/* <FormControl sx={{ bgcolor: "#1e1e1e", borderRadius: 3 }}>
          <Select
            value={session}
            onChange={(e) =>
              dispatch(
                setClassAndSectionData({ selectedSession: e?.target?.value })
              )
            }
            displayEmpty
            sx={{
              color: "#fff",
              fontSize: 16,
              fontWeight: "bold",
              borderRadius: 14,
              ".MuiSelect-select": {
                display: "flex",
                alignItems: "center",
                justifyContent: "space-between",
              },
              "& .MuiOutlinedInput-notchedOutline": {
                border: "none",
              },
              ".MuiSelect-icon": {
                color: isDarkMode ? "#fff" : "#000",
              },
              bgcolor: "#1e1e1e",
            }}
            renderValue={(selected) => (
              <Box
                display="flex"
                justifyContent="space-between"
                alignItems="center"
                gap={1}
                width="100%"
              >
                <Typography fontWeight="bold">{selected}</Typography>
                {selected && (
                  <Chip
                    label="Active"
                    size="small"
                    sx={{
                      bgcolor: "#4CBC9A26",
                      color: "#4CBC9A",
                      fontWeight: "bold",
                      fontSize: 14,
                      p: 2,
                    }}
                  />
                )}
              </Box>
            )}
            MenuProps={{
              PaperProps: {
                sx: {
                  bgcolor: "#1e1e1e",
                  color: "#fff",
                  borderRadius: 3,
                  mt: 1,
                },
              },
            }}
          >
            {session?.map((data, index) => (
              <MenuItem
                key={index}
                value={`TY-${data?.academicStartYear}-${String(
                  data?.academicEndYear
                ).slice(-2)}`}
                sx={{
                  fontWeight: "bold",
                  "&:hover": {
                    bgcolor: "#333",
                  },
                }}
              >
                TY-{data?.academicStartYear}-
                {String(data?.academicEndYear).slice(-2)}
              </MenuItem>
            ))}
          </Select>
        </FormControl> */}
      {/* section 1 */}
      <div
        className={`${
          isDarkMode
            ? "bg-gradient-to-r from-fromColor1 to-toColor1"
            : "bg-whiteBackground"
        } flex items-center w-full p-4 shadow-lg`}
      >
        {isTeacher ? (
          <img
            src={teacherData?.photo || school}
            alt="School Logo"
            className="w-[300px] h-[200px] rounded-lg object-cover"
          />
        ) : (
          <div className="relative inline-block">
            <img
              src={data?.photo || school}
              alt="School Logo"
              className="w-[300px] h-[200px] rounded-xl  object-cover border-2 border-borderLine"
            />
            <img
              src={isDarkMode ? editPhotow : editPhoto}
              alt="Edit"
              className={`absolute size-10 bottom-0 right-0 cursor-pointer`}
              onClick={() => fileInputRef?.current?.click()}
            />
          </div>
        )}
        <input
          type="file"
          ref={fileInputRef}
          className="hidden"
          accept="image/*"
          onChange={uploadPhoto}
        />
        <div className={`flex flex-col justify-center flex-grow px-4`}>
          <h1
            className={`text-3xl font-bold ${
              isDarkMode ? "text-textPrimary" : "text-textBlack"
            }`}
          >
            {localStorage.getItem("schoolName") || schoolName}
          </h1>
          <span className={`text-textGray`}>Welcome to School Dashboard!</span>
        </div>

        <Clock />
      </div>

      {/* section 2 Attendance */}
      <div
        className={`${
          isDarkMode
            ? "bg-gradient-to-r from-fromColor1 to-toColor1"
            : "bg-whiteBackground"
        } justify-center m-5 rounded-[16px] relative`}
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
              onClick={() =>
                handleOptionChange({ target: { value: "Weekly" } })
              }
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
              onClick={() =>
                handleOptionChange({ target: { value: "Monthly" } })
              }
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
                ? moment(attendanceTime.day.startTime).format(
                    "dddd, DD MMM YYYY"
                  )
                : selectedOption === "Weekly"
                ? `${moment(attendanceTime.week.startTime).format(
                    "D MMM YYYY"
                  )} - ${moment(attendanceTime.week.endTime).format(
                    "D MMM YYYY"
                  )}`
                : moment(attendanceTime.month.startTime).format("MMMM YYYY")}
            </div>
            {!(
              selectedOption === "Daily" &&
              attendanceTime.day.startTime === moment().startOf("day").valueOf()
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
        {/* Bar Graph */}
        {loading && (
          <div
            className={`absolute inset-0 flex items-center justify-center bg-[#fafafa] bg-opacity-50 z-30 w-full`}
          >
            <Spinner />
          </div>
        )}
        <div className={`flex justify-end items-center py-3`}>
          {/* class and section dropdoown */}
          {!isTeacher && (
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
                      (itm) => itm["_id"] === e.target.value
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
                  {classList.map((itm) => (
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
                      {itm.name}
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
                      {itm.name}
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

      {/* Calender component */}
      <div className={`flex flex-row mx-5 pb-5 space-x-5`}>
        <div
          className={`${
            isDarkMode
              ? "bg-gradient-to-l from-fromColor1 to-toColor1"
              : "bg-whiteBackground"
          }  p-6 w-[60%] rounded-[16px]`}
        >
          <h2
            className={`text-xl font-semibold pl-6 ${
              isDarkMode ? "text-textPrimary" : "text-textBlack"
            }`}
          >
            {t("dashboard.calendar")}
          </h2>
          <hr
            className={`mt-2 border-t ${
              isDarkMode ? "border-borderLine" : "border-borderWhite3"
            }`}
          />
          <div className={`flex justify-center mt-2`}>
            <div className={`w-full h-screen `}>
              <CalendarComponent
                events={calenderEvents}
                workdays={workdays}
                updateDate={(newDate) => setDate(newDate)}
              />
            </div>
          </div>
        </div>

        {/* event list */}
        <div
          className={`${
            isDarkMode
              ? "bg-gradient-to-l from-fromColor1 to-toColor1"
              : "bg-whiteBackground"
          } w-[40%] py-2 px-8 rounded-[16px]`}
        >
          <h2
            className={`text-xl font-semibold my-2 pl-6 mt-4 ${
              isDarkMode ? "text-textPrimary" : "text-textBlack"
            }`}
          >
            {t("dashboard.holidayAndEvents")}
          </h2>
          <hr
            className={`mb-6 border-t ${
              isDarkMode ? "border-borderLine" : "border-borderWhite3"
            }`}
          />
          {calenderEvents.length === 0 && workdays.length === 0 ? (
            <div className={`relative w-full`}>
              <img
                src={isDarkMode ? noevents : noeventsw}
                alt="Event Background"
                className={`absolute inset-0 w-auto h-auto object-cover`}
              />
            </div>
          ) : (
            <div>
              {/* event loading */}
              {eventLoading && (
                <div
                  className={`absolute inset-0 flex items-center justify-center bg-[#fafafa] bg-opacity-50 z-30`}
                >
                  <Spinner />
                </div>
              )}
              {/* event list */}
              <div className={`overflow-y-auto max-h-screen`}>
                {workdays.map((itm, index) => (
                  <div
                    key={index}
                    className={`mb-4 ml-6 rounded-lg overflow-hidden border-l-8 border-borderBlue`}
                  >
                    <div
                      className={`flex h-0 justify-between items-center bg-transparent text-textBlue font-poppins mt-2 px-2 text-lg`}
                    >
                      <div className={`font-medium text-sm mt-4 mb-2 ml-2`}>
                        {moment(itm?.date).format("DD MMMM YYYY, ddd")}
                      </div>
                    </div>
                    <div className={`bg-transparent mt-4`}>
                      <div className={`flex py-0 justify-between items-center`}>
                        <div
                          className={`${
                            isDarkMode ? "text-textPrimary" : "text-textBlack"
                          } py-0 px-2 ml-2 text-base font-semibold`}
                        >
                          {itm.title}
                        </div>
                      </div>
                      <div className={`flex justify-between items-center`}>
                        <div
                          className={`${
                            isDarkMode ? "text-textPrimary" : "text-textBlack"
                          } py-0 px-2 ml-2 text-xs font-poppins-regular`}
                        >
                          {itm.description}
                        </div>
                        <div className={`flex`}>
                          <div
                            className={`py-1 mr-6 rounded-3xl text-textRed text-xs font-bold`}
                          >
                            {t("dashboard.workday")}
                          </div>
                        </div>
                      </div>
                    </div>
                  </div>
                ))}
                {calenderEvents.map((itm, index) => (
                  <div
                    key={index}
                    className={`mb-4 ml-6 rounded-lg overflow-hidden border-l-8 border-borderBlue`}
                  >
                    <div
                      className={`flex h-0 justify-between items-center bg-transparent text-textBlue font-poppins mt-2 px-2 text-lg`}
                    >
                      <div className={`font-medium text-sm mt-4 mb-2 ml-2`}>
                        {moment(itm?.date).format("DD MMMM YYYY, ddd")}
                      </div>
                    </div>
                    <div className={`bg-transparent mt-4`}>
                      <div className={`flex py-0 justify-between items-center`}>
                        <div
                          className={`${
                            isDarkMode ? "text-textPrimary" : "text-textBlack"
                          } py-0 px-2 ml-2 text-base font-semibold`}
                        >
                          {itm.title}
                        </div>
                      </div>
                      <div className={`flex justify-between items-center`}>
                        <div
                          className={`${
                            isDarkMode ? "text-textPrimary" : "text-textBlack"
                          } py-0 px-2 ml-2 text-xs font-poppins-regular`}
                        >
                          {itm.description}
                        </div>
                        <div className={`flex`}>
                          <div
                            className={`py-1 mr-6 text-textRed text-xs font-bold`}
                          >
                            {t("dashboard.holiday")}
                          </div>
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
  );
};

export default Dashboard;
