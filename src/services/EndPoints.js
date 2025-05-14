const EndPoints = {
  ADMIN: {
    // ADMIN AUTH v2
    STATUS: "v2/admin/status",
    PHONE_VERIFY: "v2/admin/phoneVerify",
    RESEND_OTP: "v2/admin/phoneVerify/resend-otp",
    PHONE_OTP_VERIFY: "v2/admin/phoneVerify",
    EMAIL_VERIFY: "v2/admin/emailVerify",
    EMAIL_OTP_VERIFY: "v2/admin/emailVerify",
    PASSWORD_UPDATE: "v2/admin/password",
    BASIC_INFO_UPDATE: "v2/admin/details",
    ADMIN_UPDATE_ADDRESS: "admin/address",
    LOGIN: "v2/admin/login",

    // ADMIN AUTH
    ADMIN_REGISTER: "admin",
    GET_DEACTIVATE_ADMIN: "admin/deactivate",
    ADMIN_UPDATE_DETAILS: "admin/details",
    ADMIN_LOGIN: "admin/login",
    REQUESTS: "change-password/admin",
    MODIFY_REQUEST: "change-password/admin",

    // ADMIN DASHBOARD
    STUDENT_COUNT: "admin-dashboard/present-students",
    PARENT_COUNT: "admin-dashboard/parent-count",
    DASHBOARD_ATTENDANCE_STATUS: "admin-dashboard/attendance-status",
    GET_EVENTS: "holiday-event",
    GET_SUNDAY_HOLIDAY: "workdays",
    PHOTO_UPLOAD: "admin/photo-upload",

    // ADMIN TEACHER SETUP
    REGISTER_TEACHER: "teacher",
    TEACHER_LIST: "teacher/all",
    UPDATE_TEACHER: "teacher/admin",
    DELETE_TEACHER: "teacher",

    // ADMIN STUDENT SETUP
    GET_STUDENT_LIST: "student/admin",
    DELETE_STUDENT: "student/admin",
    STUDENT_UPDATE: "v2/student/admin",
    SEARCH_STUDENT: "v2/student/admin",

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
    UPLOAD_EXCEL: "v2/student/bulk",
    GET_ATTENDANCE: "attendance/admin",
    UPDATE_ATTENDANCE: "attendance/admin/bulk-mark",

    // ADMIN SECTION STUDENTS
    GET_SECTION_STUDENTS: "v2/student/admin-get",
    REGISTER_SECTION_STUDENT: "v2/student/admin", //v2
    UPDATE_SECTION_STUDENT: "v2/student/admin",
    DELETE_SECTION_STUDENT: "v2/student/admin",

    // ADMIN EVENT SECTION
    REMOVE_SUNDAY_HOLIDAY: "workdays/register",
    UPDATE_SUNDAY_HOLIDAY: "workdays",
    DELETE_SUNDAY_HOLIDAY: "workdays",
    REGISTER_EVENT: "holiday-event/v2/register",
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
    GET_EVENTS: "holiday-event/teacher",
    GET_SUNDAY_HOLIDAY: "workdays/teacher",

    // TEACHER STUDENT SETUP
    GET_STUDENT_LIST: "student/teacher",
    DELETE_STUDENT: "dashboard/parent-count",

    // TEACHER SECTION STUDENTS
    GET_SECTION_STUDENTS: "v2/student/teacher-get",
    // GET_SECTION_STUDENTS: "student/teacher",
    REGISTER_SECTION_STUDENT: "v2/student/teacher",
    UPDATE_SECTION_STUDENT: "v2/student/teacher",
    DELETE_SECTION_STUDENT: "v2/student/teacher",
    GET_ATTENDANCE: "attendance/teacher",
    UPDATE_ATTENDANCE: "attendance/teacher/bulk-mark",

    // TEACHER PROFILE
    TEACHER_LOGIN: "teacher/login",
    GET_TEACHER: "teacher",
    PROFILE_UPDATE: "teacher",
  },
  COMMON: {
    CLASS_LIST: "class/all",
  },
};

export default EndPoints;
