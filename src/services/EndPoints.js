const EndPoints = {
  ADMIN: {
    TEMP: "v2/admin/student",
    // ADMIN SECTION STUDENTS v3 api
    REGISTER_SECTION_STUDENT: "v3/student/admin", //v3
    GET_SECTION_STUDENTS: "v3/student/get/admin",
    UPDATE_SECTION_STUDENT: "v3/student/admin",
    DELETE_SECTION_STUDENT: "v3/student/admin",

    // ADMIN AUTH v2
    STATUS: "v2/admin/status",
    PASSWORD_UPDATE: "v2/admin/password",
    BASIC_INFO_UPDATE: "v2/admin/details",
    ADMIN_UPDATE_ADDRESS: "admin/address",
    LOGIN: "v2/admin/login",
    UPDATE_FCM_TOKEN: "admin/fcm-token",
    PHONE_TOKEN_VERIFY: "v2/admin/phone/verify",
    EMAIL_TOKEN_VERIFY: "v2/admin/email/verify",

    PASSWORD_RESET_PHONE_CHECK: "v2/admin/reset-password/phone",
    PASSWORD_RESET_PHONE_VERIFY: "v2/admin/reset-password/phone",
    PASSWORD_RESET_EMAIL_CHECK: "v2/admin/reset-password/email",
    PASSWORD_RESET_EMAIL_VERIFY: "v2/admin/reset-password/email",
    PASSWORD_RESET: "v2/admin/reset-password",

    // ADMIN AUTH
    ADMIN_REGISTER: "admin",
    ADMIN_UPDATE_DETAILS: "admin/details",
    REQUESTS: "change-password/admin",
    MODIFY_REQUEST: "change-password/admin",

    // ADMIN DASHBOARD
    STUDENT_COUNT: "admin-dashboard/present-students",
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
    DELETE_STUDENT: "student/admin",
    STUDENT_UPDATE: "v3/student/admin",
    SEARCH_STUDENT: "v3/student/admin",
    GET_DETAILED_STUDENT: "v3/student/admin/detail",

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
    GET_TEACHER_DEMO_EXCEL: "admin/teachers-excelsheet",
    UPLOAD_EXCEL: "v3/student/excel",
    UPLOAD_TEACHER_EXCEL: "teacher/bulk",
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

    // TC
    APPLY_TC: "transfer-certificate/admin/apply",
    GET_ISSUED_TC: "transfer-certificate/admin",

    // FEES
    CREATE_FEES_STRUCTURE: "fee-setup/fee-cycle",
    GET_FEES_STRUCTURE_OF_SCHOOL: "fee-setup/fee-cycle",
    UPDATE_FEES_STRUCTURE: "fee-setup/fee-cycle",
    
    CREATE_FEES_HEAD_OF_SCHOOL: "fee-setup/fee-head",
    GET_FEES_HEAD_OF_SCHOOL: "fee-setup/fee-head",
    UPDATE_FEES_HEAD_OF_SCHOOL: "fee-setup/fee-head",
    DELETE_FEES_HEAD_OF_SCHOOL: "fee-setup/fee-head",
    
    CREATE_CLASS_FEES_STRUCTURE: "fee-setup/fee-structure",
    GET_CLASS_FEES_STRUCTURE: "fee-setup/fee-structure/list",
    GET_SINGLE_CLASS_FEES_STRUCTURE: "fee-setup/fee-structure",
    UPDATE_CLASS_FEES_STRUCTURE: "fee-setup/fee-structure",

    VERIFY_FEES_STRUCTURE: "fee-setup/verify",

    GET_FEE_SUMMARY: "payment/fee-summary",
    GET_TRANSITION_HISTORY: "payment/admin/history",
    GET_STUDENT_DUES: "fee-setup/dues",

    // CREATE_FEES: "fee-structure/section-fee-structure",
    // GET_FEES: "fee-structure/section-fee-structure",
    // GET_SCHOOL_FEES: "fee-structure/school-fee-structure/session",

    // CREATE_REFUND: "payment/refund",

    // GET_FEE_SUMMARY: "payment/v2/dashboard/summary",
    // GET_TRANSITIONS: "payment/v2/dashboard/transactions",
    // GET_PAYMENT_BY_MODE: "payment/v2/dashboard/payment-modes-summary",
    // GET_DAILY_PAYMENT_SUMMARY: "payment/v2/dashboard/daywise-summary",
    // GET_CLASS_SECTIONS_REPORTS: "payment/v2/dashboard/sections-report",
    // GET_SECTIONS_REPORTS: "payment/v2/dashboard/section-students-report",

    // GET_MONTHLY_PAYMENT_SUMMARY: "payment/dashboard/monthwise-paid",
    // GET_CLASS_PAYMENT_SUMMARY: "payment/dashboard/class-paid",
    // GET_PAYMENT_TRANSITIIONS: "payment/dashboard/transactions",
    // SEND_PAYMENT_REMINDER: "payment/dashboard/parent-reminder",

    // GET_CLASS_WISE_SUMMARY: "payment/dashboard/reports/class-wise/summary",
    // GET_CLASS_WISE_CHART: "payment/dashboard/reports/class-wise/chart",
    // GET_CLASS_WISE_TRANSACTIONS:
    //   "payment/dashboard/reports/class-wise/transactions",

    // GET_PERIODICALLY_SUMMARY: "payment/dashboard/reports/periodically/summary",
    // GET_PERIODICALLY_CHART: "payment/dashboard/reports/periodically/chart",
    // GET_PERIODICALLY_TRANSACTIONS:
    //   "payment/dashboard/reports/periodically/transactions",

    // GET_PAYMENT_MODE_SUMMARY: "payment/dashboard/reports/payment-mode/summary",
    // GET_PAYMENT_MODE_TRANSACTIONS:"payment/dashboard/reports/payment-mode/transactions",

    // GET_REPORT_FEE_SUMMARY: "payment/dashboard/reports/fee/summary",
    // GET_REPORT_FEE_TRANSACTIONS: "payment/dashboard/reports/fee/transactions",
    // GET_REPORT_FEE_REMINDER: "payment/dashboard/parent-reminder",

    // GET_REFUND_AND_FAILED_SUMMARY: "payment/dashboard/reports/other/summary",
    // GET_REFUND_AND_FAILED_CHART: "payment/dashboard/reports/other/chart",
    // GET_REFUND_AND_FAILED_TRANSACTIONS:
    //   "payment/dashboard/reports/other/transactions",
  },
  TEACHER: {
    // LOGIN
    UPDATE_FCM_TOKEN: "teacher/fcm-token",
    // TEACHER DASHBOARD
    DASHBOARD_ATTENDANCE_STATUS: "teacher-dashboard/attendance-status",
    GET_EVENTS: "holiday-event/teacher",
    GET_SUNDAY_HOLIDAY: "workdays/teacher",

    // TEACHER SECTION STUDENTS
    REGISTER_SECTION_STUDENT: "v3/student/teacher",
    GET_SECTION_STUDENTS: "v3/student/get/teacher",
    GET_DETAILED_STUDENT: "v3/student/teacher/detail",
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
