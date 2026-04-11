# 👨‍🏫 TeacherUpdate

`TeacherUpdate` is a component for updating a teacher's personal and professional details by admin.

## Features

- Form for editing teacher details (name, gender, DOB, contact, education, etc.)
- Validation using Yup (required fields, phone format, etc.)
- Date picker for DOB with date-fns/moment support
- Select dropdowns for gender and blood group
- Cancel and Save buttons

## Data Model

### Teacher
```ts
{
  _id: string;
  firstname: string;
  lastname: string;
  email?: string;
  address?: string;
  university?: string;
  gender?: string;
  bloodGroup?: string;
  dob?: string;
  phone?: string;
  degree?: string;
}
```

## Main Flows

- **Load Data:** Gets teacher data from router location state.
- **Form Validation:** Uses Yup for required fields and phone validation.
- **Edit Fields:** Allows editing of all personal and education fields.
- **Date Picker:** Select date of birth with validation.
- **Save:** On submit, sends PUT request to update teacher details.
- **Cancel:** Navigates back without saving.

## 📌 API Endpoints

- **PUT** `ADMIN.UPDATE_TEACHER/:teacherId` — update teacher details
