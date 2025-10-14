import { Routes, Route } from "react-router-dom";
import DashBoard from "./components/dashBoard/DashBoard";
import NotRequireUser from "./components/NotRequireUser";
import RequireUser from "./components/RequireUser";
import Home from "./pages/Home";
import Login from "./pages/Login";
import ClassSetup from "./components/classSetup/ClassSetup";
import TeacherPage from "./components/teacherSetup/Teacher";
import Event from "./components/eventSetup/Event";
// import TransferCertificate from "./components/transferCertificate/TransferCertificate";
import Addsection from "./components/classSetup/Addsection";
import Studentlist from "./components/studentSetup/Studentlist";
import StudentSection from "./components/classSetup/sectionStudents/StudentSection";
import { useDispatch, useSelector } from "react-redux";
import TeacherUpdate from "./components/teacherSetup/TeacherUpdate";
import StudentUpdate from "./components/studentSetup/StudentUpdate";
import AdminProfile from "./components/admin/AdminProfile";
import i18n from "./assets/locale/i18n";
import { I18nextProvider } from "react-i18next";
import { getItem } from "./services/LocalStorageManager";
import React, { useEffect, useState } from "react";
import { setAuthData } from "./store/AppAuthSlice";
import Requests from "./components/dashBoard/Request";
import Leaves from "./components/dashBoard/Leaves";
import TeacherProfile from "./components/admin/TeacherProfile";
import desktop from "./assets/images/desktop.png";
import Register from "./pages/Register";
// import TransferCertificateApply from "./components/transferCertificate/TransferCertificateApply";
import AddStudentForm from "./components/studentSetup/AddStudentForm";
import Notice from "./components/notice/Notice";
import StudentMenu from "./components/classSetup/sectionStudents/StudentMenu";
import AttendancePopup from "./components/AttendancePopup";
import Subjects from "./components/classSetup/subjects/Subjects";
import Marksheet from "./components/classSetup/marksheet/Marksheet";

/**
 * Main application component for handling routes and rendering views.
 */
function App() {
  const dispatch = useDispatch();
  /**
   * Role of the logged-in user, fetched from the Redux store.
   * @type {string|null} role - User role (e.g., "teacher", "admin").
   */
  const role = useSelector((state) => state.appAuth.role);
  /**
   * State to detect if the user is accessing the app on a mobile device.
   * @type {boolean} isMobile
   */
  const [isMobile, setIsMobile] = useState(false);

  /**
   * Effect to handle initial app setup, such as detecting the device type and setting authentication data if a token is present.
   */
  useEffect(() => {
    const userAgent = navigator.userAgent || navigator.vendor || window.opera;
    // Detect if the device is mobile
    if (
      /android|iPad|iPhone|iPod|windows phone/i.test(userAgent.toLowerCase())
    ) {
      setIsMobile(true);
    }
    const token = getItem("access_token");
    if (token) {
      dispatch(setAuthData(token));
    }
  }, [dispatch]);

  // If the user is on a mobile device, render a message prompting them to switch to desktop view
  if (isMobile) {
    return (
      <div className="flex flex-col items-center justify-center min-h-screen bg-gray-100 text-center px-4">
        <h1 className="text-4xl text-red-500 font-bold uppercase mb-4">
          Please open in desktop view
        </h1>
        <img src={desktop} alt="" className="size-12" />
      </div>
    );
  }

  return (
    <>
      <I18nextProvider i18n={i18n}>
        <Routes>
          {/* Routes that require user authentication */}
          <Route element={<RequireUser />}>
            <Route path="/" element={<Home />}>
              {role === "admin" ? (
                <>
                  {/* Routes available for admin users */}
                  <Route path="" element={<DashBoard />} />
                  <Route
                    path="student-information-system"
                    element={<Studentlist />}
                  />
                  <Route path="teacher" element={<TeacherPage />} />
                  <Route
                    path="teacher/edit-teacher"
                    element={<TeacherUpdate />}
                  />
                  <Route path="class-setup" element={<ClassSetup />} />
                  <Route path="event" element={<Event />} />
                  {/* <Route
                    path="transfer-certificate"
                    element={<TransferCertificate />}
                  />
                  <Route
                    path="transfer-certificate-apply"
                    element={<TransferCertificateApply />}
                  /> */}
                  <Route path="add-section" element={<Addsection />} />
                  <Route
                    path="class-setup/student-menu"
                    element={<StudentMenu />}
                  />
                  <Route
                    path="class-setup/student-menu/student-section"
                    element={<StudentSection />}
                  />
                  <Route
                    path="class-setup/student-menu/attendance"
                    element={<AttendancePopup />}
                  />
                  <Route
                    path="class-setup/student-menu/subjects"
                    element={<Subjects />}
                  />
                  <Route
                    path="class-setup/student-menu/marksheet"
                    element={<Marksheet />}
                  />
                  <Route
                    path="student-information-system/student-update"
                    element={<StudentUpdate />}
                  />
                  <Route path="admin-profile" element={<AdminProfile />} />
                  <Route
                    path="password-reset-requests"
                    element={<Requests />}
                  />
                  <Route path="teacher-leave-requests" element={<Leaves />} />
                  <Route path="add-student" element={<AddStudentForm />} />
                  <Route path="notice" element={<Notice />} />
                </>
              ) : role === "classTeacher" ? (
                <>
                  {/* Routes available for teacher users */}
                  <Route path="" element={<DashBoard />} />
                  <Route path="student-menu" element={<StudentMenu />} />
                  <Route
                    path="student-menu/student-section"
                    element={<StudentSection />}
                  />
                  <Route
                    path="student-menu/attendance"
                    element={<AttendancePopup />}
                  />
                  <Route path="student-menu/subjects" element={<Subjects />} />
                  <Route path="teacher-profile" element={<TeacherProfile />} />
                </>
              ) : role === "teacher" ? (
                <>
                  <Route path="" element={<DashBoard />} />
                  <Route path="teacher-profile" element={<TeacherProfile />} />
                </>
              ) : (
                <></>
              )}
            </Route>
          </Route>
          {/* Routes that do not require user authentication */}
          <Route element={<NotRequireUser />}>
            <Route path="/login" element={<Login />} />
            <Route path="/signup" element={<Register />} />
          </Route>
        </Routes>
      </I18nextProvider>
    </>
  );
}

export default App;
