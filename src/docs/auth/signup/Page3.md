# Step3 Component Documentation

The Step3 component is part of the **multi-step registration flow**.  
It handles the **password update** step with validation, API integration, and navigation.

## Features

- Password + Confirm Password fields
- Validation rules:
  - Password is required
  - Minimum 8 characters
  - Confirm Password must match Password
- Show/Hide password toggle
- API integration for password update
- Toast notifications for success/error
- Redux integration to update auth state
- Navigation to next step (Step 4)
- Multilingual support (i18next)

## Data Model

Local State:
- password → entered password
- confirmPassword → confirmation password
- showPassword → toggle password visibility
- showConfirmPassword → toggle confirm password visibility
- errors → stores validation errors

API Request Payload (Update Password):
{
  "password": "newPassword123"
}

API Response Example:
{
  "statusCode": 200,
  "result": "Password updated successfully"
}

## Main Flow

1. User enters Password and Confirm Password
2. On Continue:
   - Validate inputs:
     - Both fields required
     - Password ≥ 8 characters
     - Confirm Password matches
   - If validation fails → Show error messages
   - If validation passes → Call API (PUT /admin/password-update)
3. On success:
   - Show success toast
   - Dispatch setAuth({ passwordUpdated: true })
   - Navigate to Step 4
4. On error:
   - Show error toast
5. Loading:
   - Spinner handled by parent via setLoading(true/false)

## Behaviour

- Back Button:
  - Calls `goback` function (navigates back/clears registration flow)
- Continue Button:
  - Validates inputs
  - Submits password update request
  - On success → moves to Step 4
- Show/Hide Password:
  - Toggles input type between "text" and "password"
- Error messages:
  - Displayed below respective input fields

## Props

- goback → function to navigate back (e.g., to login or previous step)
- setStep → function to move to next registration step
- setLoading → function to show/hide loading spinner
