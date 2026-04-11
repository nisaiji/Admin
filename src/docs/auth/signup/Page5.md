# Step5 Component Documentation

The Step5 component is part of the **multi-step registration flow**.  
It collects and updates the **school’s address details** for the Admin profile.

## Features

- Collects 6 fields:
  - Country (dropdown)
  - State (dropdown → dynamic based on selected country)
  - District (dropdown → dynamic based on selected state)
  - City
  - Pincode
  - School Address
- Validations for all fields
- Dynamic filtering:
  - Selecting Country → loads States
  - Selecting State → loads Districts
  - City/Pincode/Address enabled only after District is selected
- API integration to save data
- Redux update on success
- Navigation to next step (Step 6)
- Multilingual support (i18next)
- Toast notifications for success/error

## Data Model

Local State:
- formData:
  - country → selected country
  - state → selected state
  - district → selected district
  - city → entered city name
  - pincode → 6-digit code
  - address → school address
- errors → stores validation errors
- states → list of states based on country
- districts → list of districts based on state

API Request Payload (Address Update):
{
  "country": "India",
  "state": "Karnataka",
  "district": "Bangalore Urban",
  "city": "Bangalore",
  "pincode": "560001",
  "address": "123 MG Road, Bangalore"
}

API Response Example:
{
  "statusCode": 200,
  "result": "School address updated successfully"
}

## Validation Rules

- Country → Required
- State → Required
- District → Required
- City → Required
- Pincode:
  - Required
  - Must be 6 digits (validated via REGEX.PINCODE)
- Address → Required

## Main Flow

1. User selects Country
   - Loads States dynamically
2. User selects State
   - Loads Districts dynamically
3. User selects District
   - City, Pincode, Address inputs become enabled
4. User fills in City, Pincode, Address
5. On Continue:
   - Validate all inputs
   - If validation fails → show error messages
   - If validation passes → Call API (PUT /admin/update-address)
6. On success:
   - Show success toast
   - Dispatch setAuth({ addressUpdated: true })
   - Navigate to Step 6
7. On error:
   - Show error toast
8. Loading:
   - Controlled by parent via setLoading(true/false)

## Behaviour

- Back Button:
  - Calls `goback` function (navigates back/previous step)
- Continue Button:
  - Validates inputs
  - Submits formData to backend
  - On success → moves to Step 6
- Error messages:
  - Displayed below each field if invalid

## Props

- goback → function to go back to previous step
- setStep → function to move to next registration step
- setLoading → function to show/hide loading spinner
