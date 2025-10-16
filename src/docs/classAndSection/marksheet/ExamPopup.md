# ExamPopup

`ExamPopup` (CreateExamPopup) is used for creating exams for a class section's exam.  
It allows admins to select exam name, assign numeric or grade-based scores for each subject, and validates input before submission.

## 📌 Features

- Fetch assigned subjects for the section
- Select exam name with validation
- Choose score type: Numeric (marks) or Grade
- Enter theory/practical max and passing marks or grades
- Inline validation for required fields and logical checks
- Confirmation popup before final submission

## Data Model

### Exam Subject
```ts
{
  subjectId: string;
  subjectName: string;
  subjectType: "mainSubject" | "gradeOnlySubject";
  isMainSubject: boolean;
  scores: {
    tMax?: number | string;
    tMin?: number | string;
    pMax?: number | string;
    pMin?: number | string;
  };
}
```

### Exam Payload
```ts
{
  sessionId: string;
  classId: string;
  sectionId: string;
  name: string; // Exam name
  subjects: Array<{
    subject: string; // subjectId
    subjectType: "mainSubject" | "gradeOnlySubject";
    components: Array<{
      examType: "theory" | "practical";
      maxMarks?: number;
      passingMarks?: number;
      maxGrade?: string;
      passingGrade?: string;
    }>
  }>
}
```

## 📌 Main Flows

- **Fetch Subjects:** On mount, fetch assigned subjects for the section.
- **Exam Name:** Enter and validate exam name (required, alphanumeric).
- **Score Type:** For each subject, select "Numeric" or "Grade".
- **Score Entry:**  
  - Numeric: Enter theory/practical max and passing marks.
  - Grade: Select theory/practical max and passing grades from options.
- **Validation:**  
  - All fields required.
  - Numeric: Max ≥ Min.
  - Grade: Max grade ≥ Min grade (by grade order).
- **Confirmation:** Show confirmation popup before submitting.
- **Submit:** Send formatted payload to API, show success/error toast, refresh exam list.

---

## 📌 API Endpoints

- **GET** `ADMIN.GET_ASSIGN_SUBJECTS/:sectionId` — fetch assigned subjects
- **POST** `ADMIN.CREATE_EXAM` — create new exam/marksheet

