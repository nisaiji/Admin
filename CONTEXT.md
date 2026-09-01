# Project Context

Last scanned: 2026-04-08

## Project Summary

This is a Vite + React web admin dashboard for a school management product branded in the UI as SikshaOS. It supports admin, class-teacher, and teacher roles with modules for onboarding academic sessions, dashboard analytics, class/section setup, student management, teacher management, attendance, subjects, marksheets, events, notices, requests, transfer certificates, fees/payments, profiles, registration, and forgot-password flows.

The app is web-only in this repo. `App.jsx` blocks mobile user agents and asks users to open the app in desktop view.

## Tech Stack

- React 19 with Vite 7
- React Router DOM 7 for routing
- Redux Toolkit + React Redux for app state
- Tailwind CSS 3 with class-based dark mode
- Axios for API calls
- Formik and Yup for many forms
- Material UI / MUI X for some form controls, charts, and date pickers
- i18next / react-i18next for translations
- Firebase Messaging for FCM token generation and background notifications
- Moment and date-fns for date handling
- jsPDF, jspdf-autotable, html2canvas for document/PDF workflows
- Chart.js, react-chartjs-2, and MUI X Charts for reporting UI
- Jest + React Testing Library for tests

## Common Commands

- `npm run dev` or `yarn dev`: start Vite dev server
- `npm run build` or `yarn build`: production build
- `npm run preview` or `yarn preview`: preview build
- `npm run test` or `yarn test`: run Jest tests
- `npm run lint` or `yarn lint`: run ESLint

## Repository Layout

- `src/main.jsx`: React entrypoint. Wraps `App` in `BrowserRouter` and Redux `Provider`.
- `src/App.jsx`: route map, role-based route selection, mobile-user-agent guard, auth bootstrap from `localStorage.access_token`.
- `src/pages`: top-level auth/onboarding shell pages, including login, signup steps, forgot password steps, and `Home` layout.
- `src/components`: main app modules and shared UI. The codebase is module-based here rather than a strict `src/features/*` layout.
- `src/components/dashBoard`: dashboard cards, attendance charts, event/calendar data, section data, and chart dropdown.
- `src/components/classSetup`: class/section setup, section students, attendance entry, subjects, tags, marksheets.
- `src/components/studentSetup`: student list, new student list, add/update student forms.
- `src/components/teacherSetup`: teacher list, detail, and update flows.
- `src/components/payments`: fees dashboard, reports, settings, payment setup, payment views, and side navigation.
- `src/components/transferCertificate`: current TC flow split into pending, selection, form, alumni, shared UI, constants, and utils.
- `src/components/onboarding`: first-login academic session selection and confirmation UI.
- `src/components/admin`: admin and teacher profile screens.
- `src/components/eventSetup`, `src/components/notice`, `src/components/request`: events, notice board, password reset requests, and leave requests.
- `src/services`: Axios client and endpoint constants.
- `src/store`: Redux store and slices.
- `src/utils`: constants, regex helpers, debounce hook, session/payment helper functions, tooltip.
- `src/assets`: images, dark-mode images, fee images, fonts, videos, i18n files.
- `src/docs`: existing component/module markdown docs.
- `src/__tests__`: Jest/RTL tests organized by module.
- `src/notifications`: Firebase Messaging setup.
- `public/firebase-messaging-sw.js`: Firebase service worker template copied by Vite.

## Routing And Roles

Routing is centralized in `src/App.jsx`.

- Protected routes are nested under `RequireUser`, which checks `localStorage.getItem("access_token")`.
- Public-only routes are nested under `NotRequireUser`, which redirects authenticated users to `/`.
- `Home.jsx` renders `Navbar` and an `Outlet`. For admin users, if `isSessionCreated` is false, it redirects to `/onboard` and hides the navbar on that route.
- `setAuthData` decodes the JWT and sets `appAuth.role` and related admin state.

Admin routes include:

- `/`: dashboard
- `/onboard`: academic session onboarding
- `/student-information-system`: student list
- `/teacher`: teacher list
- `/teacher/edit-teacher`: teacher update
- `/class-setup`: class setup
- `/event`: event/holiday setup
- `/transfer-certificate`: transfer certificate page
- `/add-section`: section setup
- `/class-setup/student-menu`: class/section student menu
- `/class-setup/student-menu/student-section`: section students
- `/class-setup/student-menu/attendance`: attendance
- `/class-setup/student-menu/subjects`: subjects
- `/class-setup/student-menu/tags`: tags
- `/class-setup/student-menu/marksheet`: marksheet
- `/student-information-system/student-update`: student update
- `/admin-profile`: admin profile
- `/password-reset-requests`: password reset requests
- `/teacher-leave-requests`: teacher leave requests
- `/student-information-system/add-student`: add student
- `/notice`: notice board
- `/payments`: fees/payments

Class teacher routes include dashboard, student menu, section students, attendance, subjects, and teacher profile. Teacher routes include dashboard and teacher profile.

Public routes include `/login`, `/signup`, and `/forgot-password`.

## State Management

Redux store: `src/store/store.js`.

Slices:

- `appAuth` from `src/store/AppAuthSlice.js`
- `appConfig` from `src/store/AppConfigSlice.js`

`appAuth` stores and/or persists:

- `role`, `id`, `schoolName`
- `data` from `localStorage.adminData`
- `teacherData` from `localStorage.teacherData`
- `classAndSectionData` from `localStorage.classAndSectionData`
- `tempData` from `localStorage.tempData`
- `status` from `localStorage.status`
- `isSessionCreated` from `localStorage.isSessionCreated`
- FCM-token flag

Important auth thunks/actions:

- `setAuth`: merges signup/status data into `localStorage.status`
- `setSessionCreated`: sets `localStorage.isSessionCreated`
- `setClassAndSectionData`: merges class/section/session data into local storage
- `setTempData`: stores temporary cross-screen filter/tab data
- `fetchAdmin` and `fetchTeacher`: fetch and cache profile data
- `setAuthData`: decodes JWT and derives role/admin id/school name

`appConfig` stores:

- `isLoggedin`
- `isDarkMode`, defaulting from `localStorage.isDarkMode` and currently defaulting to true if missing
- `isLoading`
- `toastData`

Dark mode is commonly read as `useSelector((state) => state.appConfig.isDarkMode)`.

## API Layer

Base client: `src/services/axiosClient.js`.

- Active `baseURL`: `http://localhost:4000/`
- Other base URLs are commented in the file.
- Requests attach `Authorization: Bearer <token>` using `temp_access_token` first, then `access_token`.
- Requests attach `SecondSecurityKey`, computed as `sha256(import.meta.env.VITE_SECOND_SECURITY_KEY)`.
- Refresh token flow calls `admin/refresh` with `localStorage.refresh_token`.
- On `statusCode` 410, 403, JWT malformed, or failed refresh, local storage is cleared and the app redirects to `/login`.
- On `statusCode` 500 with message `jwt expired`, the client refreshes the access token and retries the original request.
- The Excel download endpoint `admin/students-excelsheet` has special response handling.
- Most screens expect successful API responses to contain `statusCode` plus `result`.

Endpoint constants live in `src/services/EndPoints.js` under:

- `EndPoints.ADMIN`
- `EndPoints.TEACHER`
- `EndPoints.COMMON`

Prefer using existing `EndPoints` keys rather than hardcoding endpoint strings in components.

## Environment Variables

Expected Vite env names seen in `.env` and source:

- `VITE_API_KEY`
- `VITE_AUTH_DOMAIN`
- `VITE_PROJECT_ID`
- `VITE_STORAGE_BUCKET`
- `VITE_MESSAGING_SENDER_ID`
- `VITE_APP_ID`
- `VITE_MEASUREMENT_ID`
- `VITE_VAPID_KEY`
- `VITE_PHONE_WIDGET_ID`
- `VITE_PHONE_AUTH_TOKEN`
- `VITE_EMAIL_WIDGET_ID`
- `VITE_EMAIL_AUTH_TOKEN`
- `VITE_SECOND_SECURITY_KEY`

Do not commit or expose env values.

## Styling And Theme

Tailwind config: `tailwind.config.js`.

- `darkMode: "class"`
- Font family key: `font-poppins`
- Global body font uses `Poppins`, but the configured font files include Helvetica and NunitoSans files.
- Theme is mostly dark-first with light fallbacks in some modules.

Important theme colors:

- Dark backgrounds: `#0B0D14`, `#0F0F0F`, `#111315`, `#1A1A1A`, `#262626`
- Text primary: `#E3E8F3`
- Blue/accent: `#0A81D1`, `#0F4189`, `#4F8EF7`
- Orange/accent: `#FF793F`, `#F29E38`
- Green/success: `#4CBC9A`
- Red/error: `#FE4040`, `#D91111`
- Amber/warning: `#FBBF24`
- Border colors commonly use `#E9EEF2`, `#2b2e4a80`, or translucent white

Existing UI style is mixed:

- Many established screens use Tailwind utility classes.
- Some newer screens (`Navbar`, onboarding, transfer certificate) use local inline `C` color objects and style props with `motion/react`.
- MUI components are used in profile/student/payment forms. When editing these files, follow the existing local pattern rather than forcing one styling approach.

## Auth And Registration

- `Login.jsx` supports admin and teacher login. Admin login uses email validation; teacher login uses username-style input and includes `platform: "web"` in payload.
- Login stores `access_token` and `refresh_token`, dispatches `setAuthData`, and navigates based on decoded role and admin registration/session status.
- Inactive admins use `temp_access_token` and resume `/signup` at a stored `localStorage.page`.
- `Register.jsx` coordinates the six-step admin signup flow:
  1. phone verification
  2. email verification
  3. password update
  4. basic info
  5. address info
  6. finish/activation
- OTP steps use global widget APIs (`window.initSendOTP`, `window.sendOtp`, `window.verifyOtp`) configured with the `VITE_PHONE_*` and `VITE_EMAIL_*` env vars.
- `generateToken` in `src/notifications/firebaseConfig.js` requests notification permission, registers `/firebase-messaging-sw.js`, and gets an FCM token using `VITE_VAPID_KEY`.

## Key Module Notes

Dashboard:

- `DashBoard.jsx` composes dashboard sections.
- `AttendanceData.jsx`, `CalendarComponent.jsx`, `EventData.jsx`, and `SectionData.jsx` fetch and render attendance/event/section dashboard data.
- `ChartDropdown.jsx` is a current untracked component and should be considered part of the working tree.

Class, Section, Attendance:

- `ClassSetup.jsx` manages class setup.
- `Addsection.jsx` manages section setup and teacher assignment/replacement.
- `StudentSection.jsx` manages students inside a selected section for admin and classTeacher roles, including inline add/edit/delete, detail modal, Excel import, demo Excel download, duplicate checks, and search.
- `AttendancePopup.jsx` manages monthly attendance by section. UI codes attendance as `P`, `A`, `S`, and `H`; API payload maps `P` to `present`, `A` to `absent`, and empty string otherwise.
- Attendance editing is constrained by selected session phase. Upcoming sessions cannot create attendance; previous sessions are view-only.
- Attendance save validates that a given date is either fully empty or fully filled across students before posting.
- Session helper functions live in `src/utils/helper.js`.

Student Management:

- `Studentlist.jsx` is the active route for `/student-information-system`. It uses server-side paging and local persisted filters (`searchClass`, `searchSection`) in localStorage.
- `NewStudentlist.jsx` exists as an untracked large replacement/experiment; inspect before choosing which list to modify.
- `AddStudentForm.jsx` uses Formik with custom validation, MUI inputs/date picker, class/section fetch from `EndPoints.COMMON.CLASS_LIST`, and posts to `EndPoints.ADMIN.REGISTER_SECTION_STUDENT`.
- `StudentUpdate.jsx` handles update flow.
- Use `CONSTANT.NA` from `src/utils/constants.js` for missing display values where the local file already follows that pattern.

Teacher Management:

- `Teacher.jsx` manages teacher list, inline add/edit/delete, search, Excel import, and demo Excel download.
- `TeacherInfo.jsx` and `TeacherUpdate.jsx` cover detail/update flows.
- Teacher creation uses `EndPoints.ADMIN.REGISTER_TEACHER`; listing uses `EndPoints.ADMIN.TEACHER_LIST` with `sessionId`.

Payments / Fees:

- `Fees.jsx` is the entry route. It renders a left `Sidebar` and selects `Dashboard`, `Reports`, `Disputes`, or `Settings`.
- `Dashboard.jsx` fetches fee summary, recent transactions, payment-mode summary, and daily payment summary.
- `Reports.jsx` uses `tempData.selectedReportsTab` to preserve report tab selection.
- `paymentSetup` contains fee-structure setup/review/created steps.
- `setting` contains school fee setting, settings setup, and view-fees screens.
- Payment helper functions in `src/utils/helper.js` map statuses to labels and Tailwind text classes.

Transfer Certificate:

- Current route imports `TCPage` from `src/components/transferCertificate/TransferCertificate.jsx`.
- Flow tabs: pending requests, generate TC, and alumni/issued.
- API fetch uses `EndPoints.ADMIN.GET_ISSUED_TC` with `sessionId`, `limit`, and `status`.
- `utils.js` normalizes varied TC response shapes, student data, statuses, conduct, fee status, date formatting, and status tones.
- `constants.js` contains local colors, placeholder records/options, and transition constants.
- Files `AlumniStep.jsx`, `PendingStep.jsx`, `SelectionStep.jsx`, `TCFormStep.jsx`, `shared.jsx`, `constants.js`, and `utils.js` are currently untracked in Git but present in the working tree.

Onboarding:

- `OnboardingScreen` in `src/components/onboarding/Onboarding.jsx` lets admin choose current/upcoming academic session.
- It derives academic years using Moment and posts `academicStartYear`, `academicEndYear`, and `status` to `EndPoints.ADMIN.CREATE_SESSION`.
- On success it dispatches `setSessionCreated()` and navigates to `/`.
- Onboarding files are currently untracked in Git but present in the working tree.

Events, Notices, Requests:

- `Event.jsx` manages holiday/events and Sunday/workday setup.
- `Notice.jsx` manages admin notices through announcement endpoints.
- `Request.jsx` manages password reset requests.
- `Leaves.jsx` manages teacher leave requests.

Profiles:

- `AdminProfile.jsx` uses Formik + Yup and updates admin details/address/social/profile image.
- `TeacherProfile.jsx` handles teacher profile viewing/updating.
- Profile data is cached in `localStorage.adminData` and `localStorage.teacherData` through app auth thunks.

## Validation And Utility Conventions

- Regex constants are in `src/utils/regix.js`:
  - `EMAIL`
  - `PHONE`
  - `PHONE_TEST`
  - `NUMBER`
  - `PHONE_LENGTH`
  - `PINCODE`
- `src/utils/debounce.js` exports `useDebounce`.
- `src/utils/constants.js` exports `CONSTANT` with values like `NA`, weekdays, grades, financial-year months, installment month counts, and also exports a dark `C` color object used by newer UI.
- Many modules guard duplicate toasts with a `toastDisplayed` state and a timeout.
- Use optional chaining and null guards because API response shapes vary across modules.
- Forms often use custom validation functions even when Formik is present; follow the local file convention.

## Testing

- Jest config: `jest.config.js`
- Test environment: `jsdom`
- Transform: `babel-jest` for JS/JSX/MJS
- Static media files are mapped to `__mocks__/fileMock.js`
- Jest DOM is loaded through `setupFilesAfterEnv`
- Tests live in `src/__tests__` by module.

When changing existing behavior, prefer adding/updating the nearest test in `src/__tests__`. For purely documentation-only changes, tests are not necessary.

## Current Working Tree Notes

At scan time the repository already had many modified files plus untracked files. Treat them as user work unless explicitly told otherwise.

Notable untracked/present files:

- `CONTEXT.md`
- `src/components/dashBoard/ChartDropdown.jsx`
- `src/components/onboarding/*`
- `src/components/studentSetup/NewStudentlist.jsx`
- `src/components/transferCertificate/AlumniStep.jsx`
- `src/components/transferCertificate/PendingStep.jsx`
- `src/components/transferCertificate/SelectionStep.jsx`
- `src/components/transferCertificate/TCFormStep.jsx`
- `src/components/transferCertificate/constants.js`
- `src/components/transferCertificate/shared.jsx`
- `src/components/transferCertificate/utils.js`

Do not revert or overwrite existing modified files without explicit instruction.

## Practical Rules For Future Tasks

- Read the local target file before editing; this repo has mixed patterns and active work-in-progress changes.
- Prefer existing services through `axiosClient` and `EndPoints`.
- Keep auth/session behavior compatible with `localStorage` and Redux state in `AppAuthSlice`.
- Preserve role-specific admin/classTeacher/teacher endpoint selection.
- Preserve `selectedSession` use in new features that touch school-year data.
- Preserve dark-mode behavior when changing UI.
- Prefer Tailwind classes in Tailwind-based files, but follow local inline-style/MUI patterns in files that already use them.
- Use existing assets under `src/assets/images`, including dark-mode variants, before adding new assets.
- Keep loading, error, and empty states explicit.
- Avoid unnecessary folder restructuring; the existing app is component-module based, not a strict feature folder tree.
