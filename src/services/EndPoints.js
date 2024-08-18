const EndPoints = {
  ADMIN: {
    // STUDENT_DELETE: "student/admin-delete",
    // STUDENT_UPDATE: "student/admin-update",
    // UPDATE_STUDENT: "student/admin-update",

    // ADMIN DASHBOARD
    STUDENT_COUNT: "admin-dashboard/present-students",
    PARENT_COUNT: "admin-dashboard/parent-count",
    DASHBOARD_CALENDER_EVENTS: "admin-dashboard/holiday-events",
    DASHBOARD_WEEKLY_ATTENDANCE: "admin-dashboard/weekly-attendance",
    DASHBOARD_MONTHLY_ATTENDANCE: "admin-dashboard/monthly-attendance",

    // ADMIN TEACHER SETUP
    REGISTER_TEACHER: "teacher/register",
    TEACHER_LIST: "teacher/all",
    UPDATE_TEACHER: "teacher/admin-class-teacher",
    DELETE_TEACHER: "teacher",

    // ADMIN STUDENT SETUP
    ALL_STUDENT_LIST: "student/all-students",
    STUDENT_LIST_SEARCH_WISE: "student/admin-search",
    STUDENT_LIST_SECTION_WISE: "student/admin-section-students",
    DELETE_STUDENT: "student/admin-delete",
    STUDENT_UPDATE: "student/student-parent-update",

    // ADMIN CLASS AND SECTION SETUP
    REGISTER_CLASS: "class/register",
    DELETE_CLASS: "class",
    REGISTER_SECTION: "section/register",
    DELETE_SECTION: "section",
    GET_SECTION: "section",
    UNASSIGNED_TEACHER: "teacher/unassigned-teachers",
    REPLACE_TEACHER: "section/replace-teacher",
    SECTION_INFO: "section/section-info",

    // ADMIN SECTION STUDENTS
    GET_SECTION_STUDENTS: "student/admin-section-students",
    REGISTER_SECTION_STUDENT: "student/admin-register",
    UPDATE_SECTION_STUDENT: "student/admin-update",
    DELETE_SECTION_STUDENT: "student/admin-delete",

    // ADMIN EVENT SECTION
    REGISTER_EVENT: "holiday-event/register",
    UPDATE_EVENT: "holiday-event",
    DELETE_EVENT: "holiday-event",

    // ADMIN PROFILE
    GET_ADMIN:'admin/profile',
    PROFILE_UPDATE:'admin/profile',
    SOCIAL_PROFILE_UPDATE:'admin/social-profile',

    // ADMIN PROFILE
    ADMIN_LOGIN:'admin/login',
  },
  TEACHER: {
    // STUDENT_DELETE: "student/delete",
    // STUDENT_UPDATE: "student/update",
    // UPDATE_STUDENT: "dashboard/present-students",

    // TEACHER DASHBOARD
    DASHBOARD_CALENDER_EVENTS: "dashboard/holiday-events",
    DASHBOARD_WEEKLY_ATTENDANCE: "dashboard/weekly-attendance",
    DASHBOARD_MONTHLY_ATTENDANCE: "dashboard/monthly-attendance",

    // TEACHER STUDENT SETUP
    ALL_STUDENT_LIST: "student/all-students",
    STUDENT_LIST_SEARCH_WISE: "student/search",
    STUDENT_LIST_SECTION_WISE: "student/section-students",
    DELETE_STUDENT: "dashboard/parent-count",

    // TEACHER SECTION STUDENTS
    GET_SECTION_STUDENTS: "student/section-students",
    REGISTER_SECTION_STUDENT: "student/register",
    UPDATE_SECTION_STUDENT: "student/update",
    DELETE_SECTION_STUDENT: "student/delete",

    // ADMIN PROFILE
    TEACHER_LOGIN:'teacher/login',

  },
  COMMON: {
    CLASS_LIST: "class/class-list",
    GET_EVENTS: "holiday-event",
  },
};

export default EndPoints;
