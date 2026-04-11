# Step4 Component Documentation

The Step4 component is part of the **multi-step registration flow**.  
It collects and updates the **school details and username** for the Admin profile.

## Features

- Collects three fields:
  - School Name
  - Affiliation Number
  - Username
- Input validation with error messages
- API integration to save data
- Redux update on success
- Navigation to next step (Step 5)
- Multilingual support (i18next)
- Toast notifications for success/error

## Data Model

Local State:
- formData:
  - schoolName → School name entered by user
  - affiliationNo → Affiliation number
  - username → Chosen username
- errors → stores validation errors

API Request Payload (Basic Info Update):
{
  "schoolName": "Green Valley School",
  "affiliationNo": "123456",
  "username": "greenvalley_admin"
}

API Response Example:
{
  "statusCode": 200,
  "result": "School information updated successfully"
}

## Validation Rules

- School Name:
  - Required
  - Minimum 8 characters
- Affiliation Number:
  - Required
  - Minimum 6 characters
- Username:
  - Required
  - Minimum 6 characters

## Main Flow

1. User fills in School Name, Affiliation No, and Username
2. On Continue:
   - Validate all inputs
   - If validation fails → show errors under inputs
   - If validation passes → Call API (PUT /admin/basic-info-update)
3. On success:
   - Show success toast
   - Dispatch setAuth({ affiliationExists: true })
   - Navigate to Step 5
4. On error:
   - Show error toast
5. Loading:
   - Controlled by parent via setLoading(true/false)

## Behaviour

- Back Button:
  - Calls `goback` function (navigates back/previous step)
- Continue Button:
  - Validates inputs
  - Submits formData to backend
  - On success → moves to Step 5
- Error messages:
  - Displayed below each field if invalid

## Props

- goback → function to go back to previous step
- setStep → function to move to next registration step
- setLoading → function to show/hide loading spinner
