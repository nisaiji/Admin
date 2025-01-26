import { Routes, Route } from "react-router-dom";
import DashBoard from "./components/dashBoard/DashBoard";
import NotRequireUser from "./components/NotRequireUser";
import RequireUser from "./components/RequireUser";
import Home from "./pages/Home";
import Login from "./pages/Login";
import ClassSetup from "./components/classSetup/ClassSetup";
import TeacherPage from "./components/teacherSetup/Teacher";
import Event from "./components/eventSetup/Event";
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
import { useEffect, useState } from "react";
import { setAuthData } from "./store/AppAuthSlice";
import SchoolDetailSignup from "./pages/SchoolDetailSignup";
import Requests from "./components/dashBoard/Request";
import Leaves from "./components/dashBoard/Leaves";
import TeacherProfile from "./components/admin/TeacherProfile";
import desktop from "./assets/images/desktop.png";

function App() {
  const dispatch = useDispatch();
  const role = useSelector((state) => state.appAuth.role);
  const [isMobile, setIsMobile] = useState(false);

  useEffect(() => {
    const userAgent = navigator.userAgent || navigator.vendor || window.opera;
    // console.log({ userAgent });

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

  if (isMobile) {
    return (
      <div className="flex flex-col items-center justify-center min-h-screen bg-gray-100 text-center px-4">
        <h1 className="text-4xl text-red-500 font-bold uppercase mb-4">
          Please open in desktop view
        </h1>
        <img src={desktop} alt="" className="size-12" />
        {/* <p className="text-lg text-gray-700 max-w-md leading-relaxed">
          This content is not accessible on mobile devices. Please use a desktop
          browser for the best experience.
        </p>
        <p className="text-sm text-gray-600 mt-4">
          If you believe this is an error, contact support for assistance.
        </p> */}
      </div>
    );
  }

  return (
    <>
      <I18nextProvider i18n={i18n}>
        <Routes>
          <Route element={<RequireUser />}>
            <Route path="/" element={<Home />}>
              {role === "teacher" ? (
                <>
                  <Route path="" element={<DashBoard />} />
                  <Route path="student-section" element={<StudentSection />} />
                  <Route path="teacher-profile" element={<TeacherProfile />} />
                </>
              ) : (
                <>
                  <Route path="" element={<DashBoard />} />
                  <Route path="student-list" element={<Studentlist />} />
                  <Route path="student" element={<Studentlist />} />
                  <Route path="teacher" element={<TeacherPage />} />
                  <Route path="teacher-update" element={<TeacherUpdate />} />
                  <Route path="class-setup" element={<ClassSetup />} />
                  <Route path="event" element={<Event />} />
                  <Route path="add-section" element={<Addsection />} />
                  <Route path="student-section" element={<StudentSection />} />
                  <Route path="student-update" element={<StudentUpdate />} />
                  <Route path="admin-profile" element={<AdminProfile />} />
                  <Route path="requests" element={<Requests />} />
                  <Route path="leave" element={<Leaves />} />
                </>
              )}
            </Route>
          </Route>
          <Route element={<NotRequireUser />}>
            <Route path="/login" element={<Login />} />
            <Route path="/signup" element={<SchoolDetailSignup />} />
          </Route>
        </Routes>
      </I18nextProvider>
    </>
  );
}

export default App;
