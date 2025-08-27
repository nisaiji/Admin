# ClassSetup Component Documentation

## Purpose
The `ClassSetup` component manages classroom and section creation in a school management system.

It allows administrators to:
- View all existing classes of a session.
- Create new classes (pre-Nursary to 12).
- Delete classes.
- Navigate into section-specific student menus.

---

## Data Shapes

### Class Object
```ts
{
  _id: string,
  name: string,
  section: Section[]
}
```

### Section Object
```ts
{
  _id: string,
  name: string,
  startTime?: string
}
```

### Redux Store (appAuth slice)
```ts
{
  classAndSectionData: {
    session: [{ _id: string }],
    sectionId?: string,
    classId?: string,
    className?: string,
    sectionName?: string,
    startTime?: string
  }
}
```

### Local State
- `classes: Class[]`
- `isFlipped: boolean[]`
- `modalIsOpen: boolean`
- `clickedClassId: string`
- `addSectionModelOpen: boolean`
- `showDropdowns: Record<number, boolean>`
- `loading: boolean`
- `toastDisplayed: boolean`
- `isOpen: boolean`

---

## Key Flow
1. On mount → fetch classes (`getAllClass`).
2. Add new class → API call, refresh list.
3. Delete class → confirmation modal, API call, refresh list.
4. Flip card → show sections and update option.
5. Click section → update Redux store, navigate to student menu.
6. Update section → open modal to modify sections.

---

## Behaviour
- Classes sorted logically.
- Max 16 classes allowed(pre-Nursary to 12).
- Prevents duplicate names.
- Spinner overlay during loading.
- Toast notifications for feedback.
- Dark/light mode supported.
- Auto-close dropdown when clicking outside.
- Empty state messages when no classes exist.
- Breadcrumbs for navigation context.
