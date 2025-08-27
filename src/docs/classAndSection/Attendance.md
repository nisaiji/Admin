# Attendance Component Documentation

This component manages monthly attendance records for Admin and Teacher roles. It includes data fetching, editing, saving, and PDF export features.

## Features

- View monthly attendance for students.
- Switch months (restricted to session start and current month).
- Toggle between view and edit mode.
- Mark attendance (P - Present, A - Absent).
- Handle Sundays (S) and holidays (H).
- Save attendance to the server with validation.
- Fetch holidays and workdays dynamically.
- Export attendance as a PDF.
- Supports light/dark mode.

## State and Hooks

- `isEditable`: toggle between editing and viewing.
- `attendanceData`: student attendance array.
- `currentDate`: selected month and year.
- `holidays`, `workdays`: mark special days.
- `totalAttendanceDays`: number of valid working days.
- `loading`, `toastDisplayed`: UI states.
- `isTeacher`: determines API endpoints and permissions.
- Uses `Redux selectors` to get class/section info.
- `useEffect` triggers fetch events and attendance on month change.

## Key Functions

1. `isSunday / isHoliday(dateIndex)`  
   Check if a date is Sunday or a holiday.

2. `changeMonth(increment)`  
   Navigate months with validation and toasts.

3. `handleInputChange(studentIndex, dateIndex, value)`  
   Edit attendance for a specific student/date.

4. `handleSaveAttendance()`  
   Validates attendance (all filled or empty per day) and saves to backend.

5. `fetchMonthlyAttendance()`  
   Fetch attendance data for the month and map it to students.

6. `fetchEvents()`  
   Fetch holiday and Sunday overrides.

7. `downloadAttendance()`  
   Generate PDF with student attendance, totals, and color-coded statuses.

## API Endpoints

`Teacher`
- GET_ATTENDANCE
- UPDATE_ATTENDANCE
- GET_EVENTS
- GET_SUNDAY_HOLIDAY

`Admin`
- GET_ATTENDANCE
- UPDATE_ATTENDANCE
- GET_EVENTS
- GET_SUNDAY_HOLIDAY

## PDF Export Details

- Title includes class, section, month, year.
- Columns: S.No, Student Name, Day-wise attendance, Total.
- Colors:
  - P: Blue
  - A: Red
  - S/H: Orange
- Horizontal and vertical totals included.

## UI Structure

- `Header`: month navigation, title, edit/save, download button.
- `Table`: student rows with attendance cells.
- `Editable cells`: dropdown for P/A.
- `Totals`: horizontal per student, vertical per day.

## Behaviour

- Cannot edit attendance outside session start and current day.
- Toast messages for invalid actions.
- Dark and light theme support.
- Data sorted by first name, then last name.
