/**
 * DashBoard.jsx
 *
 * This component displays the main dashboard for the school admin, class teacher, or teacher.
 * It provides an overview of attendance statistics (daily, weekly, monthly), a calendar with events and holidays,
 * and controls for session management and school profile photo upload.
 *
 * Main features:
 * - Attendance statistics with pie/bar charts (daily, weekly, monthly)
 * - Calendar view with holidays and workdays
 * - Session management (create, toggle active session)
 * - School profile photo upload and preview
 * - Class and section selection for attendance filtering
 * - Responsive and dark mode support
 *
 * Technologies used:
 * - React hooks for state and lifecycle management
 * - Redux for global state (school, session, teacher, config)
 * - Chart.js for attendance visualization
 * - Material UI for styled controls and dropdowns
 * - Moment.js for date manipulation
 * - Toast notifications for feedback
 * - API integration for data fetching and updates
 *
 * Props: None
 * State:
 *   - Attendance data, chart data, calendar events, workdays, session info, class/section selection, loading states
 *   - File input ref for photo upload
 *   - Date and attendance time ranges for filtering
 *
 * Functions:
 *   - getSession: Fetches session list and sets active session
 *   - getClassList: Fetches class and section list for the selected session
 *   - getStudentCount, getDailyAttendanceChart, getAttendanceChart, getSchoolAttendanceChart: Attendance data fetchers
 *   - getCalenderEvents: Fetches calendar events and workdays
 *   - uploadPhoto: Handles school profile photo upload and resizing
 *   - handleCreateSession, handleMarkSessionComplete: Session management actions
 *   - transformWeeklyData, transformMonthlyData: Attendance data transformers for chart display
 *   - renderPieChart, renderChart: Chart rendering functions
 *   - handleChangeDate: Handles navigation between attendance time ranges
 *   - Clock: Displays current date and time
 *
 * UI Structure:
 *   - School info and session controls (top section)
 *   - Attendance statistics with chart and class/section filters (middle section)
 *   - Calendar component and event/holiday list (bottom section)
 */
import React, { useEffect, useState } from "react";
import { useDispatch, useSelector } from "react-redux";
import EndPoints from "../../services/EndPoints.js";
import moment from "moment";
import { axiosClient } from "../../services/axiosClient";
import { useTranslation } from "react-i18next";
import { Toaster } from "react-hot-toast";
import {
  fetchAdmin,
  fetchTeacher,
  updatefcmtoken,
} from "../../store/AppAuthSlice.js";
import { generateToken } from "../../notifications/firebaseConfig.js";
import EventData from "./EventData.jsx";
import AttendanceData from "./AttendanceData.jsx";
import SectionData from "./SectionData.jsx";
import { motion, AnimatePresence } from "motion/react";
import {
  Users,
  BookOpen,
  DollarSign,
  ChevronDown,
  ChevronRight,
  ChevronLeft,
  CalendarDays,
  CheckCircle2,
  UserCheck,
  Clock,
  School,
  RefreshCw,
} from "lucide-react";
import { C } from "../../utils/constants.js";

const Dashboard = () => {
  const [t] = useTranslation();
  const dispatch = useDispatch();
  const { classAndSectionData, data, teacherData, isFCMToken } = useSelector(
    (state) => state.appAuth,
  );
  const role = useSelector((state) => state.appAuth.role);
  const isDarkMode = useSelector((state) => state.appConfig.isDarkMode);

  const [date, setDate] = useState({
    month: moment().month(),
    year: moment().year(),
  });

  const updateFCMToken = async () => {
    try {
      const fcmToken = await generateToken();
      const url =
        role === "admin"
          ? EndPoints.ADMIN.UPDATE_FCM_TOKEN
          : EndPoints.TEACHER.UPDATE_FCM_TOKEN;
      const res = await axiosClient.put(url, {
        fcmToken,
      });
      if (res?.statusCode === 200) {
        dispatch(updatefcmtoken());
      }
    } catch (e) {
      // console.log(e);
    }
  };

  useEffect(() => {
    if (!isFCMToken) {
      updateFCMToken();
    }
  }, []);

  // fetch user details based on role
  useEffect(() => {
    if (role === "classTeacher" || role === "teacher") {
      dispatch(fetchTeacher());
    } else if (role === "admin") {
      dispatch(fetchAdmin());
    }
  }, [dispatch]);

  return (
    <div style={{ minHeight: "100vh", background: C.bg, color: C.text }}>
      <main style={{ padding: "24px 32px 40px" }}>
        <Toaster position="top-center" reverseOrder={false} />

        {/* section 1 */}
        <SectionData
          isDarkMode={isDarkMode}
          role={role}
          teacherData={teacherData}
          classAndSectionData={classAndSectionData}
          data={data}
          date={date}
        />

        {/* section 2 Attendance */}
        {(role === "admin" || role === "classTeacher") && (
          <AttendanceData
            isDarkMode={isDarkMode}
            role={role}
            teacherData={teacherData}
            classAndSectionData={classAndSectionData}
            date={date}
          />
        )}

        {/* Calender component */}
        <EventData
          isDarkMode={isDarkMode}
          role={role}
          teacherData={teacherData}
          classAndSectionData={classAndSectionData}
          date={date}
          setDate={setDate}
        />
      </main>
    </div>
  );
};

export default Dashboard;
