# Navbar

`Navbar` is a component that renders the top navigation bar for the school management system.  
It provides quick access to dashboard sections, setup menus, requests, notices, profile actions, and dark mode toggle.  
The menu adapts to user roles (Admin, Class Teacher, Teacher) and supports dark/light mode.

## Features

- School logo and dashboard link
- Role-based menu items:
  - **Admin:** Setup dropdown (Teacher, Class Setup, Event), Student Info, Requests dropdown (Password Reset, Teacher Leaves), Notice board
  - **Class Teacher:** Classroom link
- Profile menu with profile and logout options
- Dark mode toggle (MUI Switch)
- Responsive design and sticky positioning
- Click outside to close all menus

## State & Props

- Uses Redux for:
  - `role`, `data`, `teacherData` (user info)
  - `isDarkMode` (theme)
- Local state for:
  - Menu open/close (`menuOpen`, `profileMenuOpen`, `requestsMenuOpen`)
  - Menu refs for click outside detection
- Uses `useNavigate` for routing

## Main Flows

- **Menu Handling:**  
  - Mouse hover/click toggles for setup, requests, and profile menus
  - Click outside closes all menus
- **Role-Based Rendering:**  
  - Admin sees setup, requests, notice, and student info
  - Class Teacher sees classroom link
- **Profile Actions:**  
  - Profile menu links to profile page and logout
  - Logout clears local storage and redirects to login
- **Dark Mode:**  
  - MUI Switch toggles dark/light mode via Redux
- **Navigation:**  
  - Uses `Link` and `navigate` for routing
