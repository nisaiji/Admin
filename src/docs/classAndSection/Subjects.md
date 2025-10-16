## Subjects

`Subjects` manages **subject assignments for a class section**.  
It supports viewing, assigning, editing, and updating subjects and their teachers, with full support for **Admin** role and readOnly access to **ClassTeacher**.
---

## Features (Admin)
- List subjects assigned to a class/section
- Assign subjects to teachers
- Mark/unmark a subject as "Main Subject"
- Edit assigned teacher and main subject status
- View teacher profile and contact info

---

## Data Model

### Subject Assignment List
```ts
{
  _id: string;
  classId: string;
  sectionId: string;
  sessionId: string;
  subjectId: string;
  subjectName: string;
  teacherId: string;
  teacherFirstName: string;
  teacherLastName: string;
  isMainSubject: boolean;
}
```

### Teacher List
```ts
{
  id: string;
  firstname: string;
  lastname: string;
  photo?: string;
  phone?: string;
  email?: string;
  role: string; // "teacher" | "classTeacher"
  sectionId?: string;
  className?: string;
  sectionName?: string;
  subjectName?: string;
  sectionSubjects?: Array<{ className: string; sectionName: string; subjectName: string; }>
}
```

---

## Main Flows

- Fetch Subjects → Get all subjects for the section.
- Fetch Teachers → Get all teachers available for assignment.
- Fetch Assigned Subjects → Get current subject-teacher assignments.
- Assign Subject → Select subject, teacher, and main subject status, then assign via API.
- Edit Assignment → Inline edit assigned teacher or main subject status, then save via API.
- Cancel Edit → Revert changes to previous assignment.
- View Teacher Profile → Click assigned teacher to view details and other classes/subjects.

---

## API Endpoints (from EndPoints)

Admin

- ADMIN.GET_SUBJECT /:sectionId → get subjects for section
- ADMIN.TEACHER_LIST → get all teachers
- ADMIN.GET_ASSIGN_SUBJECTS /:sectionId → get assigned subjects for section
- ADMIN.ASSIGN_SUBJECT_TO_TEACHER → POST (body: { classId, sectionId, sessionId, subjectId, teacherId, isMainSubject })
- ADMIN.UPDATE_ASSIGN_TEACHER_OF_SUBJECT /:assignmentId → PUT (body: { classId, sectionId, sessionId, subjectId, teacherId, isMainSubject })

Class Teacher

- TEACHER.GET_ASSIGN_SUBJECTS → get assigned subjects for own section

---

## Validation
- Subject and teacher must be selected before assignment.
- Prevent duplicate assignments for the same subject.