# CalendarComponent

`CalendarComponent` is a component for displaying a monthly calendar grid with navigation and event highlighting.  
It supports holidays, workdays, and today's highlight.

## Features

- Monthly calendar view with previous/next month navigation
- Highlights holidays, workdays, Sundays, and today
- Displays weekday headers

## Props

```ts
{
  events: Array<{
    title: string;
    date: number | string;
  }>;
  workdays: Array<{
    date: number | string;
  }>;
  updateDate: ({ month, year }: { month: number; year: number }) => void;
}
```

## Main Flows

- **Month Navigation:**  
  Users can navigate to previous or next month; triggers `updateDate`.
- **Day Rendering:**  
  Each day cell is styled based on whether it is a holiday, workday, Sunday, or today.
- **Weekdays Header:**  
  Displays weekday names at the top of the calendar.
- **Grid Layout:**  
  Days are displayed in a 7-column grid, with empty cells for alignment.
- **Styling:**  
  Uses Tailwind CSS and dynamic classes for dark/light mode and day types.

---

## Internal Components

- **Calendar:**  
  Renders month navigation and weekday headers.
- **Day:**  
  Renders individual day cell with dynamic styling.
- **DaysGrid:**  
  Renders the grid of all days in the month.

## API Integration

- Expects `events` and `workdays` arrays from parent component.
- Calls `updateDate` when month/year changes.
