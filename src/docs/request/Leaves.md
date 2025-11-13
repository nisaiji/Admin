# Leaves

`Leaves` is a component for managing teacher leave requests bu admin.  
Admins can view, approve, or reject leave requests, see leave details, and assign guest teachers for approved leaves.  
The component supports pagination, status tabs, and toast notifications.

## Features

- List all leave requests with pagination
- Filter requests by status: Pending, Approved, Rejected, All
- View detailed leave info and teacher profile
- Approve or reject leave requests (Admin only)
- Assign guest teacher credentials for approved leaves
- Inline status update with API integration

## Data Model

### Leave Request
```ts
{
  _id: string;
  teacher: {
    firstname: string;
    lastname: string;
    class?: string;
    section?: string;
    phone?: string;
    leaveRequestCount?: number;
    photo?: string;
  };
  reason: "MedicalLeave" | "OtherReason" | string;
  status: "pending" | "accept" | "reject" | "complete" | "expired";
  createdAt: string;
  startTime: string;
  endTime: string;
  description?: string;
  guestTeacher?: {
    username?: string;
    tagline?: string;
    secretKey?: string;
  };
}
```

## Main Flows

- **Fetch Leaves:**  
  On tab, page, or limit change, fetch leave requests from API with status filter.
- **Approve/Reject Leave:**  
  Admin can approve or reject requests, updating status via API.
- **Assign Guest Teacher:**  
  On approval, generate and assign guest teacher credentials.
- **Filter Requests:**  
  Tabs for Pending, Approved, Rejected, and All requests.
- **Pagination:**  
  Change page and limit to view more requests.
- **Status & Reason Mapping:**  
  Display readable labels for status and reason.

## API Endpoints

- **GET** `ADMIN.GET_LEAVES` — fetch leave requests with pagination and status filter
- **PUT** `ADMIN.UPDATE_LEAVE` — update leave request status (approve/reject, assign guest teacher)