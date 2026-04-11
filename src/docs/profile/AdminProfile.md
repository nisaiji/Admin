# AdminProfile Component Documentation

This component allows admins to view and update their school profile and social media information.

## Features

- Fetch and display admin profile from server.
- Update school details with validation.
- Update social media and contact information.
- Support for country, state, district, and city selection.
- Preloads state/district options for India.
- Toast notifications for feedback.
- Spinner overlay during API calls.
- Dark/light theme support via Redux.
- Form handling and validation using Formik + Yup.

## State and Hooks

- `admin`: stores fetched admin data.
- `loading`: controls spinner visibility.
- `filteredCities`, `states`, `districts`: dynamic dropdown data.
- `selectedCountry`: selected country.
- `toastDisplayed`: prevents duplicate toasts.
- `isDarkMode`: theme setting from Redux.
- `Formik`: manages form state and validation.
- `Yup`: validation schema.
- `useEffect`: fetch profile on mount.

## Validation Rules

Required fields:
- School Name, Principal, Username, School Board, Affiliation No, Address, Country, State, District, City, Pincode, Phone (10 digits), Email (valid).

Optional fields:
- School Number, Website, Facebook, Instagram, LinkedIn, Twitter, WhatsApp, YouTube.

## Key Functions

1. `getadmin()`
   - Fetches admin profile data.
   - Pre-fills form values.
   - Loads states/districts for India.

2. `handleProfileUpdate()`
   - Validates key fields.
   - Sends updated school info to server.
   - Updates local storage school name.
   - Refreshes data on success.

3. `handleSocialProfileUpdate()`
   - Validates phone field.
   - Sends social/contact info to server.
   - Refreshes data on success.

4. `handleCountryChange(e)`
   - Updates country selection.
   - Resets dependent fields.
   - Loads states if India selected.

5. `handleStateChange(e)`
   - Updates state selection.
   - Loads districts for selected state.
   - Resets dependent fields.

## API Endpoints
- `GET_ADMIN`: Fetch admin profile.
- `PROFILE_UPDATE`: Update school info.
- `SOCIAL_PROFILE_UPDATE`: Update contact/social info.

## UI Structure
- Breadcrumb navigation.
- Form fields for each profile attribute.
- Dropdowns for Country, State, District.
- Social media links (icons).
- Submit buttons for school and social updates.
- Toast notifications and loading spinner.

## Behaviour
- Automatically fetches data on mount.
- Validates required fields before saving.
- Prevents duplicate error toasts.
- Pre-populates states/districts when India is selected.
- Updates Redux-based dark/light mode styling.
