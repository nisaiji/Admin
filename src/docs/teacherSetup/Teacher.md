# 👨‍🏫 Teacher

`Teacher` is a component for managing teachers in the school system bu admin.  
It allows admins to add, edit, view, search, and delete teachers.

## Features

- List all teachers with details (name, phone, class/section)
- Add/register new teachers with validation
- Edit teacher details inline or via edit page
- View teacher profile in a modal popup
- Delete teacher with confirmation popup
- Search teachers by name or phone

## Data Model

### Teacher
```ts
{
  _id: string;
  SNo: number;
  firstname: string;
  lastname: string;
  phone: string;
  className?: string;
  sectionName?: string;
  section?: object;
  // ...other profile fields
}
```

## Main Flows

- **Fetch Teachers:** On mount, fetch all teachers and assign serial numbers.
- **Add Teacher:** Enter first name, last name, and phone; validate and submit via API.
- **Edit Teacher:** Inline edit in table or navigate to edit page.
- **View Info:** Open modal to show full teacher profile.
- **Delete Teacher:** Show confirmation popup, delete via API, refresh list.
- **Search:** Filter teachers by name or phone in real-time.

## API Endpoints

- **GET** `ADMIN.TEACHER_LIST` — fetch all teachers
- **POST** `ADMIN.REGISTER_TEACHER` — add new teacher
- **DELETE** `ADMIN.DELETE_TEACHER/:id` — delete teacher
- **PUT** `ADMIN.UPDATE_TEACHER/:id` — update teacher (edit page)
