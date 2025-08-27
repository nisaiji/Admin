# StudentList Component Documentation

This component displays and manages a list of students.  
Features include student search, pagination, filtering by class/section, and CRUD actions.

## Features

- View students in a table with pagination
- Filter students by class and section
- Search students by name (debounced search)
- Add, edit, view, and delete students
- Supports Admin roles
- Dark mode support
- Toast notifications for feedback
- Persistent class/section filters using localStorage

## Main Functionalities

1. Fetches class list and student data on mount (based on Admin role)
2. Handles filters:
   - Class dropdown
   - Section dropdown (based on selected class)
   - Name search bar
   - Clear filters button
3. Displays students with details:
   - Full name
   - Gender
   - Parent phone
   - Parent email
   - Guardian name
4. Pagination:
   - Change page
   - Change items per page
   - Shows range and total count
5. Student Actions:
   - Edit student (navigates to update form)
   - View details (opens info modal)
   - Delete student (confirmation popup)

## Key API Calls

- GET class list: EndPoints.COMMON.CLASS_LIST
- GET student list:
   - Admin: EndPoints.ADMIN.SEARCH_STUDENT
- DELETE student:
   - Admin: EndPoints.ADMIN.DELETE_STUDENT

## State Management

- Uses Redux to get:
   - User role (teacher/admin)
   - Class and section data
   - Dark mode setting
- Local component state for:
   - Pagination (pageNo, limit, totalStudentCount)
   - Filters (searchClass, searchSection, name)
   - Data lists (studentList, classList, sectionList)
   - Modals (info, delete)
   - Loading indicator

## Behaviour

- Filters are saved to localStorage (class/section)
- Name search uses debounce (1 second)
- Dark mode updates styles dynamically
- Deleting a student refreshes the list
- Spinner shows during API calls
- When no students, shows a “no data” illustration and message

## Navigation

- Add Student: /add-student
- Edit Student: /student-information-system/student-update
