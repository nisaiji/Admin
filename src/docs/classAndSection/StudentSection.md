# 🎓 StudentSection

`StudentSection` is a React component that manages **students inside a class section**.  
It supports viewing, searching, adding, editing, deleting, and bulk importing students, with full support for **Admin** and **Class Teacher** roles.

---

## 📌 Features (Shared by Admin & Class Teacher)
- List students by class/section
- Search students by name
- Add/register new students with validation
- Edit inline and update details  
- Delete with confirmation  
- Import students from Excel  
- Download sample Excel template  
- Role-based behavior (Admin vs Class Teacher)  
- Dark/Light mode support  
- i18n/localization ready  

---

## 🧱 Data Model

### Student
```ts
{
  SNo: number | null;
  _id?: string;         // for delete
  studentId?: string;   // for update
  firstname: string;
  lastname: string;
  gender: string;
  parentFullName: string;
  parentPhone: string;  // 10 digits
  sectionId: string;
}
```

## 📌 Main Flows

- Fetch Students → Different API for Admin/Class Teacher.
- Search → Filter by first/last name.
- Add Student → Validates names + 10-digit phone. Prevents duplicates.
- Edit Student → Inline edit row → save via API.
- Delete Student → Confirmation popup → delete via API.
- Excel Import → Upload .xlsx/.xls → refresh list.
- Excel Download → Download demo template.

## 📌 API Endpoints (from EndPoints)

Admin

- ADMIN.SECTION_INFO /:sectionId → get section/Class Teacher info
- ADMIN.GET_SECTION_STUDENTS?school=...&section=...&session=... → get student list
- ADMIN.REGISTER_SECTION_STUDENT → POST (body: { firstname, lastname, parentName, gender, phone, sectionId })
- ADMIN.UPDATE_SECTION_STUDENT/:studentId → PUT (body: { firstname, lastname, parentName, gender, phone })
- ADMIN.DELETE_SECTION_STUDENT/:_id → DELETE
- ADMIN.UPLOAD_EXCEL → POST (FormData: classId, sectionId, file)
- ADMIN.GET_DEMO_EXCEL → GET (blob download)

Class Teacher
- TEACHER.GET_SECTION_STUDENTS?school=...&section=...&session=... → get student list
- TEACHER.REGISTER_SECTION_STUDENT → POST
- TEACHER.UPDATE_SECTION_STUDENT/:studentId → PUT
- TEACHER.DELETE_SECTION_STUDENT/:_id → DELETE

