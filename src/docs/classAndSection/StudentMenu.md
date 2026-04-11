# StudentMenu Component Documentation

This component provides a menu interface for admin and class teachers, allowing quick navigation to key sections such as Classroom, Attendance, and Calendar.

## Features

- Displays class and section name dynamically.
- Different behavior for admin/class teacher.
- Quick navigation buttons (Classroom, Attendance, Calendar).
- Dark mode and light mode support.
- Loading spinner overlay during data fetch (controlled by local state).
- Breadcrumb navigation for context.

## State and Hooks
- `loading (useState)`: Controls spinner visibility.
- `role (Redux)`: Determines if logged-in user is a admin, classTeacher or teacher.
- `classAndSectionData / teacherData (Redux)`: Class and section info.
- `isDarkMode (Redux)`: Theme mode.
- `useNavigate (react-router)`: Handles route navigation.

## Navigation Paths

- Teacher: `/student-menu/student-section`
- Student: `/class-setup/student-menu/student-section`
- Attendance: `/class-setup/student-menu/attendance`
- Calendar: (static tile, no click in current code).

## UI Structure

- `Breadcrumbs` at top for navigation.
- `Header`: Class and section name.
- `Menu Tiles`:
  - Classroom (navigates to student section)
  - Attendance
  - Calendar (display only)
- Tiles have icons and labels.

## Behavior

- Spinner overlays entire screen when `loading` is true.
- Adjusts theme styles based on `isDarkMode`.
- Displays appropriate class info for teacher.
- Navigation triggered by tile clicks.
- Placeholder commented-out code for academic year selection (not active).

## Dependencies

- `Spinner`: Loading indicator.
- `Breadcrumbs`: Navigation trail.
- `Redux`: Role, class data, theme.
- `react-router-dom`: Navigation.
- `Images`: classroom.png, attendance.png, calendarimg.png.

