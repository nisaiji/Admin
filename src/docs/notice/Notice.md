# Notice

`Notice` is a component for managing and displaying school notices by admin.  
Admins can post, update, and delete notices for teachers and parents, while all users can view notices with filtering and pagination.

## Features

- List all notices with pagination
- Post new notice (Admin only)
- Update and delete notice (Admin only)
- Filter notices by creator (All, Admin, Teacher)
- Target audience selection (Teacher, Parent)
- Inline editing for notice description

## Data Model

### Notice
```ts
{
  _id: string;
  description: string;
  createdByRole: "admin" | "teacher";
  createdByDetails?: {
    firstname?: string;
    lastname?: string;
    photo?: string;
  };
  targetAudience: Array<"teacher" | "parent">;
  updatedAt: string;
  sessionId: string;
}
```

## Main Flows

- **Fetch Notices:**  
  On page, limit, or filter change, fetch notices from API.
- **Post Notice:**  
  Admin enters description, selects target audience, and posts notice.
- **Edit Notice:**  
  Admin can edit notice description inline and save changes.
- **Delete Notice:**  
  Admin can delete a notice with confirmation.
- **Filter Notices:**  
  Filter by creator (All, Admin, Teacher) using dropdown.
- **Pagination:**  
  Change page and limit to view more notices.

## API Endpoints

- **GET** `ADMIN.GET_NOTICE` — fetch notices with pagination and filter
- **POST** `ADMIN.ADD_NOTICE` — add new notice
- **PUT** `ADMIN.UPDATE_NOTICE/:noticeId` — update notice
- **DELETE** `ADMIN.DELETE_NOTICE/:noticeId` — delete notice