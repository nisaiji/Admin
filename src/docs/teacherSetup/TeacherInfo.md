# 👩‍🏫 TeacherInfo

`TeacherInfo` is a component for displaying detailed information about a teacher in a modal popup.  
It shows personal details, education, subjects taught, and a profile photo.

## Features

- Modal popup for teacher details
- Shows personal info: name, gender, DOB, contact, address, etc.
- Shows education info: university, degree
- Lists subjects taught with class and section
- Displays teacher profile photo (or placeholder)
- Closes modal and restores scroll on exit

## Data Model

### Teacher
```ts
{
  teacherId: string;
  firstname: string;
  lastname: string;
  gender?: string;
  bloodGroup?: string;
  dob?: string;
  email?: string;
  phone?: string;
  username?: string;
  address?: string;
  university?: string;
  degree?: string;
  photo?: string; // base64 image
  section?: {
    classId?: { name: string };
    name?: string;
  };
  sectionSubjects?: Array<{
    subjectName?: string;
    className?: string;
    sectionName?: string;
  }>;
}
```

## Main Flows

- **Open Modal:** Show teacher info when `modelOpen` is true.
- **Close Modal:** Click close button to hide and restore scroll.
- **Display Details:** Render personal, education, and subjects taught.
- **Show Photo:** Display teacher photo or placeholder if not available.
