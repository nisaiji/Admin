const EndPoints = {
  ADMIN: {
    // ADMIN SECTION STUDENTS v3 api
    REGISTER_SECTION_STUDENT: "v3/student/admin", //v3
    GET_SECTION_STUDENTS: "v3/student/get/admin",
    UPDATE_SECTION_STUDENT: "v3/student/admin",
    DELETE_SECTION_STUDENT: "v3/student/admin",

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
    UPDATE_FCM_TOKEN: "admin/fcm-token",
    PHONE_TOKEN_VERIFY: "v2/admin/phone/verify",
    EMAIL_TOKEN_VERIFY: "v2/admin/email/verify",
    PHONE_AND_EMAIL_TOKEN_VERIFY: "v2/admin/reset-password-request",
    PASSWORD_RESET: "v2/admin/reset-password",

    // ADMIN AUTH
    ADMIN_REGISTER: "admin",
    GET_DEACTIVATE_ADMIN: "admin/deactivate",
    ADMIN_UPDATE_DETAILS: "admin/details",
    // ADMIN_LOGIN: "admin/login",
    REQUESTS: "change-password/admin",
    MODIFY_REQUEST: "change-password/admin",

    // ADMIN DASHBOARD
    GET_ALL_SESSION: "session",
    STUDENT_COUNT: "admin-dashboard/present-students",
    // PARENT_COUNT: "admin-dashboard/parent-count",
    DASHBOARD_ATTENDANCE_STATUS: "admin-dashboard/attendance-status",
    GET_EVENTS: "holiday-event",
    GET_SUNDAY_HOLIDAY: "workdays",
    PHOTO_UPLOAD: "admin/photo-upload",
    GET_SESSION: "session",
    CREATE_SESSION: "session",
    MARK_SESSION_COMPLETE: "session/test/mark-complete",

    // NOTICE
    ADD_NOTICE: "announcement/admin",
    GET_NOTICE: "announcement/admin",
    UPDATE_NOTICE: "announcement/admin",
    DELETE_NOTICE: "announcement/admin",

    // ADMIN TEACHER SETUP
    REGISTER_TEACHER: "teacher",
    TEACHER_LIST: "teacher/all",
    UPDATE_TEACHER: "teacher/admin",
    DELETE_TEACHER: "teacher",

    // ADMIN STUDENT SETUP
    GET_STUDENT_LIST: "student/admin",
    DELETE_STUDENT: "student/admin",
    STUDENT_UPDATE: "v3/student/admin",
    SEARCH_STUDENT: "v3/student/admin",

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
    UPLOAD_EXCEL: "v3/student/excel",
    GET_ATTENDANCE: "attendance/admin",
    UPDATE_ATTENDANCE: "attendance/admin/bulk-mark",

    // ADMIN EVENT SECTION
    REMOVE_SUNDAY_HOLIDAY: "workdays/register",
    UPDATE_SUNDAY_HOLIDAY: "workdays",
    DELETE_SUNDAY_HOLIDAY: "workdays",
    REGISTER_EVENT: "holiday-event/v2/register",
    UPDATE_EVENT: "holiday-event",
    DELETE_EVENT: "holiday-event",
    GET_LEAVES: "leave/admin",
    UPDATE_LEAVE: "leave/admin",

    // TAGS
    GET_TAGS: "tag/get-admin",

    // ADMIN PROFILE
    GET_ADMIN: "admin",
    PROFILE_UPDATE: "admin",
    SOCIAL_PROFILE_UPDATE: "admin/social",

    // SUBJECTS
    GET_SUBJECT: "subject/admin",
    ASSIGN_SUBJECT_TO_TEACHER: "teacher-subject-section",
    GET_ASSIGN_SUBJECTS: "teacher-subject-section/admin",
    UPDATE_ASSIGN_TEACHER_OF_SUBJECT: "teacher-subject-section/admin",
    DELETE_ASSIGN_TEACHER_OF_SUBJECT: "teacher-subject-section/admin",

    // exam
    CREATE_EXAM: "exam",
    GET_EXAM_OF_SECTION: "exam",
    GET_STUDENTS_BY_EXAM: "student-exam-result/section-student-marks",
    UPDATE_STUDENT_MARKS_BULK: "student-exam-result/admin",
    PUBLISH_RESULT: "exam",
  },
  TEACHER: {
    // LOGIN
    UPDATE_FCM_TOKEN: "teacher/fcm-token",
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
    REGISTER_SECTION_STUDENT: "v3/student/teacher",
    GET_SECTION_STUDENTS: "v3/student/get/teacher",
    UPDATE_SECTION_STUDENT: "v3/student/teacher",
    DELETE_SECTION_STUDENT: "v3/student/teacher",
    GET_ATTENDANCE: "attendance/teacher",
    UPDATE_ATTENDANCE: "attendance/teacher/bulk-mark",

    // TEACHER PROFILE
    TEACHER_LOGIN: "teacher/login",
    GET_TEACHER: "teacher",
    PROFILE_UPDATE: "teacher",

    // SUBJECTS
    GET_ASSIGN_SUBJECTS: "teacher-subject-section/class-teacher",
  },
  COMMON: {
    CLASS_LIST: "class/session",
  },
};

export default EndPoints;
