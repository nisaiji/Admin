# StudentInfo Component Documentation

This component displays detailed information about a student in a modal, with an option to capture the student details as an image.

## Features

- Modal overlay with scroll lock when open.
- Displays student's personal and guardian details.
- Shows student's photo (or placeholder if not available).
- Supports dark and light themes via Redux state.
- Uses i18n for multilingual labels.
- Screenshot/download functionality using html2canvas.

## Props

- `currStudent (Object)`: Student details including:
  - firstname, lastname, className, sectionName, gender, bloodGroup, dob, address
  - parentFullName, parentPhone
  - photo (Base64 string)
- `modelOpen (Function)`: Toggles modal visibility (true/false).

## State and Hooks

- `captureRef (useRef)`: References the content to capture.
- `isDarkMode (Redux)`: Checks theme mode.
- `useEffect`: Locks body scroll when modal is open.
- `useTranslation`: Provides multilingual labels.

## Functions

1. `handleScreenshot()`

   - Creates a hidden container with cloned content.
   - Uses html2canvas to generate an image of student details.
   - Triggers download as `student_info.png`.

2. `personalDetails / guardianDetails`
   - Arrays that structure label-value pairs for rendering.

## UI Structure

- `Header`: Title and close button.
- `Body`: Two sections
  - Personal Details (labels and values)
  - Guardian Details
  - Student photo on the side.
- `Footer`: Screenshot button to save details.

## Behaviour

- Modal covers screen with semi-transparent background.
- Disables body scrolling when open.
- Dynamically switches styles based on theme.
- Displays CONSTANT.NA when information is missing.
- Screenshot excludes background and captures only details.

## Dependencies

- `html2canvas`: For screenshot capture.
- `react-redux`: Theme state.
- `react-i18next`: Translations.
- `profileEmpty image`: Placeholder photo.
- `cross/crossw images`: Close button icons.
