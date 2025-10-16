# 📝 Marksheet

`Marksheet` is a component for managing and publishing marksheets for a class section's exams.  
It allows admin to view, edit, and publish student marks and grades for each exam, with support for both numeric and grade-based scoring.

---

## 📌 Features

- Fetch and display all exams for the selected section
- View and edit marks/grades for each student and subject
- Supports both numeric (marks) and grade-based scoring
- Inline validation for marks and grades
- Save all marks in bulk
- Publish marksheet with double confirmation
- Create new exams/marksheets via popup
- Toast notifications for actions and errors


## Data Model

### Exam

```ts
{
  _id: string;
  name: string;
  subjects: Array<{
    subject: {
      _id: string;
      name: string;
    };
    subjectType: "mainSubject" | "gradeOnlySubject";
    components: Array<{
      examType: "theory" | "practical";
      maxMarks?: number;
      passingMarks?: number;
      maxGrade?: string;
      passingGrade?: string;
    }>;
  }>;
}
```

### Student Exam Result

```ts
{
  _id: string;
  studentFirstName: string;
  studentLastName: string;
  studentExamResult: Array<{
    _id: string;
    subjectId: string;
    components: Array<{
      examType: "theory" | "practical";
      marksObtained?: number;
      gradeObtained?: string;
      gradingType: "marks" | "grades";
      maxMarks?: number;
    }>;
  }>;
}
```

## 📌 Main Flows

- **Fetch Exams:** On mount, fetch all exams for the section.
- **Select Exam:** Choose an exam from the dropdown to view/edit marks.
- **Edit Marks/Grades:**
  - Numeric: Enter marks for theory/practical, with validation against max marks.
  - Grade: Select grade from dropdown, with validation against max grade.
- **Save Marks:** Save all changes in bulk for all students.
- **Publish Marksheet:** Confirm and publish the marksheet for the selected exam.
- **Create Exam:** Open popup to create a new exam/marksheet.

## 📌 API Endpoints

- **GET** `ADMIN.GET_EXAM_OF_SECTION/:sectionId` — fetch exams for section
- **POST** `ADMIN.GET_STUDENTS_BY_EXAM` — fetch students and their marks for an exam
- **POST** `ADMIN.UPDATE_STUDENT_MARKS_BULK` — save all marks/grades for students
- **PUT** `ADMIN.PUBLISH_RESULT/:examId` — publish marksheet for exam
