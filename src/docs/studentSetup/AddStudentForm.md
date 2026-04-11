# AddStudent Component Documentation

This component allows Admin users to add a new student to the system.  
It provides a form with validation, dropdowns for class/section, optional fields, and saves the student record via API.

## Features

- Form with required and optional fields
- Custom validation logic (no numbers in names, phone length, etc.)
- Gender, Class, Section dropdowns
- Date picker for DOB
- Optional parent information fields (email, occupation, etc.)
- Capitalizes names automatically
- Supports dark mode styles
- Toast notifications for success/error
- Loading spinner during API requests
- Navigation after successful submission

## Key Functionalities

1. Fetches class list on component mount
   - Filters classes that have sections
   - Sorts classes using predefined order
2. Updates section list based on selected class
3. Form submission:
   - Validates input
   - Displays first validation error via toast
   - Prepares payload and sends API request
   - Shows loading spinner
   - On success: shows success toast and navigates back
   - On failure: shows error toast
4. Prevents invalid characters:
   - No digits in names
   - Only digits in phone number
5. Handles optional fields dynamically
6. Responsive form layout with grouped fields

## Important Fields

Required:
- First Name
- Last Name
- Parent Name
- Phone Number
- Gender
- Class
- Section
- Address

Optional:
- Blood Group
- Date of Birth
- Parent Gender
- Parent Age
- Parent Email
- Parent Qualification
- Parent Occupation
- Parent Address

## State & Utilities

- useState: loading, classList, sectionList, toastDisplayed
- useFormik: form state and submission
- useEffect: fetches class list on load
- Redux: gets classAndSectionData and dark mode preference
- Local utility: capitalize() for names

## API Endpoints

- GET class list: EndPoints.COMMON.CLASS_LIST
- POST register student: EndPoints.ADMIN.REGISTER_SECTION_STUDENT

## Behaviour

- Toast shows first validation error and auto-hides
- Spinner covers the screen during save
- Navigates back on successful save
- Disabled Section dropdown until Class is selected
- Dynamic dropdown options for gender, class, section
- Filters class list to only those with available sections
