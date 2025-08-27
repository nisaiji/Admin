# TeacherProfile Component Documentation

This component allows teachers to view and update their personal profile information.

## Features

- Fetch teacher details from the server and populate form.
- Update teacher profile with validation.
- Fields: First Name, Last Name, Date of Birth, Gender, Blood Group, University, Degree, Phone.
- Dark and light theme support.
- Real-time validation and feedback using Formik + Yup.
- Loading spinner and toast notifications for feedback.

## State and Hooks

- `teacher`: stores fetched teacher data.
- `loading`: controls loading spinner visibility.
- `isDarkMode`: theme setting from Redux.
- Uses `useEffect` to fetch data on mount.
- `Formik` manages form state, validation, and submission.
- `Yup` enforces validation rules.

## Validation Rules

- First and Last Name: required, only alphabets, max length 15.
- Date of Birth: required, cannot be future date.
- Gender: required.
- Blood Group: required.
- University: required.
- Degree (Qualification): required.
- Phone: required, exactly 10 digits.

## Key Functions

1. `getTeacher()`

   - Fetches teacher data via API.
   - Populates Formik values.

2. `onSubmit(values)`
   - Sends updated profile data to server.
   - Shows success/error toast and refreshes data.

## API Endpoints

- `GET_TEACHER`: Fetch teacher profile.
- `PROFILE_UPDATE`: Update teacher profile.


## UI Structure

- `Breadcrumbs` for navigation context.
- `Form inputs` for each field.
- `DatePicker` for DOB selection.
- `Dropdowns` for Gender and Blood Group.
- `Submit button` to save changes.
- `Spinner overlay` during API calls.
- `Toasts` for success/error messages.

## Behaviour

- Automatically fetches data on mount.
- Prevents invalid characters in name fields.
- Prevents typing future DOB (date picker restricted).
- Validates fields before submission.
- Shows loader while fetching/saving.
- Updates Redux-based dark/light mode styling.
