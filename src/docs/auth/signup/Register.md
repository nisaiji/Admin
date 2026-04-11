# Register Component Documentation

The Register component manages a **multi-step signup process** for Admin users.  
It ensures secure account setup with validation, progress tracking, and API integration.

## Features

- Multi-step registration (6 steps):
  1. Verify Phone
  2. Verify Email
  3. Update Password
  4. Basic Info
  5. Address Info
  6. Finish
- Step progress indicator with labels and tick icons
- Navigation between steps with localStorage persistence
- API integration for admin details and activation
- Push notification support with Firebase FCM tokens
- Toast notifications for success and errors
- Loading spinner during API calls
- Redux integration to store authentication data
- Multilingual support (i18next)

## Data Model

LocalStorage keys:
- page → current step number (1–6)
- temp_access_token → temporary token before account activation
- access_token → final access token after completion

API Response Example (GET_ADMIN):
{
  "statusCode": 200,
  "result": {
    "isActive": true,
    "id": "123",
    "role": "admin"
  }
}

## Main Flow

1. Component loads:
   - Reads current step from localStorage (default 1)
2. User completes each step:
   - Step data saved
   - Current step updated in localStorage
3. Progress indicator:
   - Highlights active step
   - Shows tick for completed steps
4. Final step (Step 6):
   - Calls GET_ADMIN to check registration status
   - If active:
     - Generate FCM token
     - Update FCM token on server
     - Move temp_access_token → access_token
     - Clear localStorage (page/temp tokens)
     - Dispatch setAuthData to Redux
     - Redirect to dashboard (/)
   - If not active:
     - Show error: "Registration already in progress"
5. On error:
   - Show error toast
6. Loading state:
   - Spinner shown while waiting for API

## API Endpoints

Admin:
- GET /admin/get-admin → Fetch admin registration status
- PUT /admin/update-fcm-token → Update FCM token

## Behaviour

- Progress bar updates dynamically as user advances
- Step components render based on currentStep value
- LocalStorage ensures user can continue from last incomplete step
- Go back:
  - Clears localStorage
  - Redirects to login
- Toasts:
  - Success → "Registration process completed."
  - Error → "Registration already in progress"
- Final activation:
  - Tokens moved from temp_access_token to access_token
  - Redux updated with auth data
  - Navigate to dashboard (/)
