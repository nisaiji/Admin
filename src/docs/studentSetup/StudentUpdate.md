# StudentUpdate Component Documentation

This component allows Admin users to update existing student details.  
It provides a pre-filled form, validation, and an API call to update student data.

## Features

- Pre-fills form fields with existing student data
- Validation using Yup
- Input cleaning (capitalize names, lowercase email)
- Dynamic dropdowns (gender, blood group)
- Date picker for DOB
- Parent/Guardian details section
- Error handling with toast notifications
- Loading spinner during API requests
- Dark mode support
- Breadcrumb navigation
- Cancel and Save buttons

## Main Functionalities

1. Gets selected student data from router location state
2. Initializes Formik with student values
3. Validation:
   - First name, last name, gender, parent name, and phone are required
   - Phone must can not start with 1–5
4. On form submit:
   - Cleans and capitalizes fields
   - Removes empty fields
   - Sends PUT request to API endpoint
   - Shows success toast and navigates back on success
   - Shows error toast on failure
5. Renders form fields dynamically from configuration arrays

## Important Fields

Student:
- First Name, Last Name
- Gender
- Blood Group
- Date of Birth
- Address

Parent/Guardian:
- Full Name
- Gender
- Age
- Email
- Phone
- Qualification
- Occupation
- Address

## Key API Call

- PUT update student: `${EndPoints.ADMIN.STUDENT_UPDATE}/${studentId}`

## State & Utilities

- useState: loading state
- useFormik: form handling
- useSelector: dark mode state
- useNavigate: navigation
- capitalize() utility for names

## Behaviour

- Displays spinner overlay while saving
- Shows validation errors below inputs
- Disables save until inputs are valid
- Dark mode changes form colors
- Cancel button navigates back without saving
- Saves changes and redirects on success
