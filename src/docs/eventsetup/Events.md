# 📅 Event

`Event` is a component for managing school calendar events and workdays.  
It provides a monthly calendar view, allows admins to add, edit, and delete events and workdays.

## Features

- Monthly calendar view with navigation
- List all events and workdays for the selected month
- Add, edit, and delete events (Admin only)
- Add, edit, and delete workdays (Admin only)
- Inline event/workday form with validation
- Search and jump to a specific month/year

## Data Model

### Event
```ts
{
  _id: string;
  title: string;
  description: string;
  date: number; // timestamp
  startTime?: number;
  endTime?: number;
  sessionId: string;
  holiday?: boolean;
}
```

### Workday
```ts
{
  _id: string;
  title: string;
  description: string;
  date: number; // timestamp
  sessionId: string;
  workday: boolean;
}
```
## Main Flows

- **Fetch Events/Workdays:**  
  On month or session change, fetch events and workdays for the selected month.
- **Add/Edit Event/Workday:**  
  Open popup form, validate input, submit via API, refresh list.
- **Delete Event/Workday:**  
  Show confirmation popup, delete via API, refresh list.
- **Calendar Navigation:**  
  Navigate months, jump to specific month/year.
- **Day Click:**  
  Admins can add/edit events/workdays by clicking on a day.

## API Endpoints

- **POST** `ADMIN.GET_EVENTS` — fetch events for month
- **POST** `ADMIN.GET_SUNDAY_HOLIDAY` — fetch workdays for month
- **POST** `ADMIN.REGISTER_EVENT` — add new event
- **POST** `ADMIN.REMOVE_SUNDAY_HOLIDAY` — add new workday
- **PUT** `ADMIN.UPDATE_EVENT/:id` — update event
- **PUT** `ADMIN.UPDATE_SUNDAY_HOLIDAY/:id` — update workday
- **DELETE** `ADMIN.DELETE_EVENT/:id` — delete event
- **DELETE** `ADMIN.DELETE_SUNDAY_HOLIDAY/:id` — delete workday

