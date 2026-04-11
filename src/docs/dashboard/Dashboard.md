# Dashboard

`Dashboard` is the main component for the school management system's Admin, Class Teacher and Subject teacher dashboard.  
It provides an overview of attendance, session management, calendar events, and class/section data, with interactive charts and controls.

## Features

- **Session Management (Admin Only):**

  - View current and past academic sessions
  - Create new session for the upcoming year
  - Mark session as complete
  - Switch between sessions

- **Attendance Analytics (Admin and Class Teacher):**

  - View attendance data (Daily, Weekly, Monthly)
  - Pie chart for daily attendance
  - Bar chart for weekly/monthly attendance
  - Toggle between attendance views
  - Class and section dropdowns for filtering (admin only)

- **Calendar & Events (Admin, Class Teacher and Subject Teacher):**

  - Monthly calendar view with holidays and workdays
  - List of holidays and workdays for the selected month

- **Profile & School Info:**

  - School logo and name display
  - Admin can upload/change school photo
  - Teacher/class teacher profile photo display
  - Welcome message

## Data Model

### Session

```ts
{
  _id: string;
  academicStartYear: number;
  academicEndYear: number;
  isCurrent: boolean;
}
```

### Attendance Data

```ts
{
  presentCount: number;
  absentCount: number;
  totalCount: number;
  sectionAttendance?: Array<{
    date: string;
    presentCount: number;
    absentCount: number;
  }>;
}
```

### Calendar Event

```ts
{
  _id: string;
  title: string;
  description: string;
  date: number; // timestamp
  holiday?: boolean;
}
```

### Workday

```ts
{
  _id: string;
  title: string;
  description: string;
  date: number; // timestamp
  workday: boolean;
}
```

## Main Flows

- **Session Management:**

  - Fetch sessions on mount
  - Show "Create Session" button if next session does not exist
  - Select session from dropdown

- **Attendance Analytics:**

  - Fetch attendance data for selected time range and section
  - Transform data for chart display
  - Render pie/bar charts based on selected view
  - Handle date navigation (previous/next day/week/month)

- **Class & Section Selection:**

  - Fetch class list for selected session
  - Filter sections based on selected class
  - Update attendance and chart data on selection

- **Calendar & Events:**

  - Fetch calendar events and workdays for selected month and session
  - Display events and workdays in calendar and list
  - Show loading spinner during fetch

- **Profile & School Info:**
  - Display school/teacher photo
  - Allow admin to upload/change school photo
  - Show school name and welcome message
  - Display real-time clock

## API Endpoints

- **GET** `ADMIN.GET_SESSION` — fetch all sessions
- **POST** `ADMIN.CREATE_SESSION` — create new session
- **GET** `ADMIN.MARK_SESSION_COMPLETE/:sessionId` — mark session complete
- **GET** `COMMON.CLASS_LIST/:sessionId` — fetch class list for session
- **POST** `ADMIN.STUDENT_COUNT` — fetch student attendance count
- **POST** `ADMIN.DASHBOARD_ATTENDANCE_STATUS` — fetch attendance analytics
- **POST** `ADMIN.GET_EVENTS` — fetch calendar events
- **POST** `ADMIN.GET_SUNDAY_HOLIDAY` — fetch workdays
- **PUT** `ADMIN.PHOTO_UPLOAD` — upload/change school photo

## Component Structure

- **Session Controls:**

  - Create/mark session buttons
  - Session dropdown

- **Attendance Section:**

  - Attendance view toggle (Daily/Weekly/Monthly)
  - Date navigation buttons
  - Attendance charts (Pie/Bar)
  - Class/section dropdowns (admin only)

- **Calendar Section:**

  - CalendarComponent for month view
  - List of holidays and workdays

- **Profile Section:**
  - School/teacher photo
  - School name and welcome message
  - Real-time clock

## 📌 Notes

- All API calls are handled via `axiosClient` and endpoints from `EndPoints.js`.
- Redux is used for global state management (`appAuth`, `appConfig`).
- Charts are rendered using Chart.js and react-chartjs-2.
- Tailwind CSS and MUI are used for styling and UI components.
