import { Routes, Route } from "react-router-dom";
import DashBoard from "./components/dashBoard/DashBoard";
import NotRequireUser from "./components/NotRequireUser";
import RequireUser from "./components/RequireUser";
import Home from "./pages/Home";
import Login from "./pages/Login";
import Signup from "./pages/Signup";
import ClassSetup from "./components/classSetup/ClassSetup";
import TeacherPage from "./components/teacherSetup/Teacher";
import Event from "./components/eventSetup/Event";
import Addsection from "./components/classSetup/Addsection";
import Studentlist from "./components/studentSetup/Studentlist";
import StudentSection from "./components/classSetup/sectionStudents/StudentSection";
import { useSelector } from "react-redux";
import TeacherUpdate from "./components/teacherSetup/TeacherUpdate";
import StudentUpdate from "./components/studentSetup/StudentUpdate";
import AdminProfile from "./components/admin/AdminProfile";
import SchoolDetailSignup from "./pages/SchoolDetailSignup";
import i18n from "./assets/locale/i18n";
import { I18nextProvider } from "react-i18next";

function App() {
  const role = useSelector((state) => state.appAuth.role);
  // console.log('role',role);

  return (
    <>
      <I18nextProvider i18n={i18n}>
        <Routes>
          <Route element={<RequireUser />}>
            <Route path="/" element={<Home />}>
              {role === "teacher" ? (
                <>
                  {/* <Route path="" element={<DashBoard />} /> */}
                  {/* <Route path="" element={<StudentSection />} /> */}
                  <Route path="student-section" element={<StudentSection />} />
                  <Route path="event" element={<Event />} />
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
                </>
              )}
            </Route>
          </Route>
          <Route element={<NotRequireUser />}>
            <Route path="/login" element={<Login />} />
            {/* <Route path="/signup" element={<SchoolDetailSignup />} /> */}
            <Route path="/signup" element={<Signup />} />
          </Route>
        </Routes>
      </I18nextProvider>
    </>
  );
}

export default App;
