# Requests

`Requests` is a component for managing user requests, such as password resets or device changes.  
Admins can view, filter, approve, or reject requests, with support for pagination, status tabs, and toast notifications.


## Features

- List all requests with pagination
- Filter requests by status: Pending, Approved, Rejected, All
- Approve or reject requests (Admin only)
- Inline status update with API integration
- Reason mapping for request types (e.g., Forgot Password, Changed Device)

## Data Model

### Request

```ts
{
  _id: string;
  teacher: {
    firstname: string;
    lastname: string;
    class?: string;
    section?: string;
    forgetPasswordCount?: number;
  };
  reason: "forgetPassword" | "changeDevice" | "technical" | "other";
  status: "pending" | "accept" | "reject" | "complete" | "expired" | "notSet";
  createdAt: string;
  otp?: string;
}
```

## Main Flows

- **Fetch Requests:**  
  On tab, page, or limit change, fetch requests from API with status filter.
- **Approve/Reject Request:**  
  Admin can approve or reject requests, updating status via API.
- **Filter Requests:**  
  Tabs for Pending, Approved, Rejected, and All requests.
- **Pagination:**  
  Change page and limit to view more requests.
- **Status & Reason Mapping:**  
  Display readable labels for status and reason.

## API Endpoints

- **GET** `ADMIN.REQUESTS` — fetch requests with pagination and status filter
- **PUT** `ADMIN.MODIFY_REQUEST` — update request status (approve/reject)
