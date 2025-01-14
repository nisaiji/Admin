const EndPoints = {
  ADMIN: {
    // ADMIN AUTH
    ADMIN_REGISTER: "admin",
    ADMIN_LOGIN: "admin/login",
    REQUESTS: "change-password/admin",
    MODIFY_REQUEST: "change-password/admin",

    // ADMIN DASHBOARD
    STUDENT_COUNT: "admin-dashboard/present-students",
    PARENT_COUNT: "admin-dashboard/parent-count",
    DASHBOARD_ATTENDANCE_STATUS: "admin-dashboard/attendance-status",

    // ADMIN TEACHER SETUP
    REGISTER_TEACHER: "teacher",
    TEACHER_LIST: "teacher/all",
    UPDATE_TEACHER: "teacher/admin",
    DELETE_TEACHER: "teacher",

    // ADMIN STUDENT SETUP
    GET_STUDENT_LIST: "student/admin",
    DELETE_STUDENT: "student/admin",
    STUDENT_UPDATE: "student/admin",

    // ADMIN CLASS AND SECTION SETUP
    REGISTER_CLASS: "class",
    DELETE_CLASS: "class",
    CLASS_SECTION: "class",
    REGISTER_SECTION: "section",
    DELETE_SECTION: "section",
    GET_SECTION: "section",
    UNASSIGNED_TEACHER: "teacher/unassigned",
    REPLACE_TEACHER: "section/replace-teacher",
    SECTION_INFO: "section",
    GET_DEMO_EXCEL: "admin/students-excelsheet",
    UPLOAD_EXCEL: "student/excel",
    GET_ATTENDANCE: "attendance/admin",
    UPDATE_ATTENDANCE: "attendance/admin/bulk-mark",

    // ADMIN SECTION STUDENTS
    GET_SECTION_STUDENTS: "student/admin",
    REGISTER_SECTION_STUDENT: "student/admin",
    UPDATE_SECTION_STUDENT: "student/admin",
    DELETE_SECTION_STUDENT: "student/admin",

    // ADMIN EVENT SECTION
    REGISTER_EVENT: "holiday-event/register",
    UPDATE_EVENT: "holiday-event",
    DELETE_EVENT: "holiday-event",
    GET_LEAVES: "leave/admin",
    UPDATE_LEAVE: "leave/admin",

    // ADMIN PROFILE
    GET_ADMIN: "admin",
    PROFILE_UPDATE: "admin",
    SOCIAL_PROFILE_UPDATE: "admin/social",
  },
  TEACHER: {
    // TEACHER DASHBOARD
    DASHBOARD_CALENDER_EVENTS: "dashboard/holiday-events",
    DASHBOARD_WEEKLY_ATTENDANCE: "dashboard/weekly-attendance",
    DASHBOARD_MONTHLY_ATTENDANCE: "dashboard/monthly-attendance",

    // ADMIN DASHBOARD
    DASHBOARD_ATTENDANCE_STATUS: "teacher-dashboard/attendance-status",

    // TEACHER STUDENT SETUP
    GET_STUDENT_LIST: "student/teacher",
    DELETE_STUDENT: "dashboard/parent-count",

    // TEACHER SECTION STUDENTS
    GET_SECTION_STUDENTS: "student/teacher",
    REGISTER_SECTION_STUDENT: "student/teacher",
    UPDATE_SECTION_STUDENT: "student/teacher",
    DELETE_SECTION_STUDENT: "student/teacher",
    GET_ATTENDANCE: "attendance/teacher",
    UPDATE_ATTENDANCE: "attendance/teacher/bulk-mark",

    // TEACHER PROFILE
    TEACHER_LOGIN: "teacher/login",
    GET_TEACHER: "teacher",
    PROFILE_UPDATE: "teacher",
  },
  COMMON: {
    CLASS_LIST: "class/all",
    GET_EVENTS: "holiday-event",
  },
};

export default EndPoints;
