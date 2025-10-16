# BreadCrumbs

`BreadCrumbs` is a component for displaying the current navigation path as clickable breadcrumbs.  
It helps users understand their location within the app and quickly navigate to parent pages.  

## Features

- Displays the current route as a breadcrumb trail
- Clickable links for each parent route segment
- Highlights the current (last) segment
- Formats labels: replaces dashes/underscores with spaces, capitalizes words
- Responsive and styled for dark/light mode

## Props & State

- Uses `useLocation` from `react-router-dom` to get the current path
- Uses Redux `isDarkMode` for theme-based styling
- No external props required

## Main Flows

- **Parse Path:**  
  Splits the current pathname into segments and builds breadcrumb links.
- **Format Labels:**  
  Converts route segments to readable labels (e.g., `teacher-setup` → `Teacher Setup`).
- **Render Breadcrumbs:**  
  Renders links for all segments except the last, which is highlighted as the current page.
