# Login Component Documentation

The Login component provides authentication functionality for Admin and Teacher users.  
It integrates form validation, API requests, and token management with a clean UI.


## Features

- Login as Admin or Teacher with role toggle
- Form handling and validation with Formik + Yup
- API integration using Axios
- Password visibility toggle (show/hide)
- Multilingual support (i18next)
- Stores JWT tokens in localStorage
- Push notification support with Firebase FCM tokens
- Redirects based on authentication state
- UI includes:
  - Video background
  - Loading spinner
  - Toast notifications


## Data Model

Request Payloads:

Admin Login
{
  "user": "admin@example.com",
  "password": "yourpassword"
}

Teacher Login
{
  "user": "teacher_username",
  "password": "yourpassword",
  "platform": "web"
}

Decoded JWT Example
{
  "id": "123",
  "role": "admin",
  "active": true,
  "username": "Admin",
  "pincode": "123456"
}

## Main Flow

1. User enters email/username and password
2. Formik validates inputs:
   - Admin → requires valid email
   - Teacher → requires username
   - Password → minimum 8 characters
3. On submit:
   - Sends request to proper API endpoint
   - Shows loading spinner
4. If success:
   - Decode JWT
   - Save tokens in localStorage
   - Dispatch setAuthData to Redux
   - Update FCM token on server
   - Redirect:
     - Admin & active → dashboard (/)
     - Admin & not active → signup (/signup)
     - Teacher → dashboard (/)
5. If fail:
   - Show error toast
6. Finally:
   - Hide spinner
   - Reset form state


## API Endpoints

Admin:
- POST /admin/login
- PUT /admin/update-fcm-token

Teacher:
- POST /teacher/login
- PUT /teacher/update-fcm-token


## Behaviour

- Password toggle → Show/Hide password
- Admin/Teacher switch → Updates form validation and API endpoint
- Toasts:
  - Success → "Login successful"
  - Error → show error message
- Loading state → Disables form and shows spinner
- Navigation:
  - Successful login → /
  - Incomplete signup (Admin only) → /signup
- Token handling:
  - Save access_token and refresh_token
  - Remove temp_access_token after login
