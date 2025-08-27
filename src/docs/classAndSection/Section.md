content = """# 📘 Addsection Component Documentation

## PURPOSE
The **`Addsection`** component manages **class section creation, modification, and deletion** within a class.  
It allows administrators to:
- View all sections in a class.
- Assign or reassign teachers to sections.
- Set section start dates.
- Delete sections (only the last one).
- Add new sections with automatic alphabetical naming (A, B, C...).

This ensures structured class management and prevents duplicate or invalid sections.

---

## DATA SHAPES
## Props
- **isVisible** (`boolean`): Show or hide the modal.  
- **setAddSectionModelOpen** (`function`): Open/close modal.  
- **clickedClassId** (`string`): ID of the class for sections.  
- **getAllClass** (`function`): Refresh class data.  

---

## Redux State
- **classAndSectionData**: `{ session: [{ _id: string }] }` → Used for session ID.  
- **isDarkMode**: `boolean` → Controls theme.  

---

## Local State
- **sections**: `Array` of `{ _id, name, teacher, startTime }` → Sections in the class.  
- **teachers**: `Array` of `{ _id, firstname, lastname }` → Available teachers.  
- **newSection**: `{ name, teacherId, startTime }` → New section data.  
- **selectedSection**: `null` or `{ _id, teacherId, teacher, startTime }` → Currently editing section.  
- **selectedTeachersList**: `Array` → Teachers available for editing.  
- **deleteSectionId**: `string` or `null` → Section ID marked for delete.  
- **showForm**: `boolean` → Show/hide Add Section form.  
- **showConformationPopup**: `boolean` → Show confirmation before save.  
- **showDeleteConfirmation**: `boolean` → Show confirmation before delete.  
- **loading**: `boolean` → Show loading spinner.  
- **toastDisplayed**: `boolean` → Prevent duplicate toasts.  

---

## KEY FLOW

1. **Initialization**
   - When modal opens (`isVisible=true`), page scroll is disabled.
   - Fetches existing sections and unassigned teachers via `fetchData`.

2. **Add Section**
   - User selects teacher and start date.
   - Section name auto-generated (A, B, C...).
   - Validation:
     - Max **8 sections** allowed.
     - Teacher selection required.
   - Shows confirmation popup before saving.
   - On confirm → `handleSaveSection()` → API call → refreshes data.

3. **Edit Section**
   - User clicks edit → teacher dropdown activates.
   - Updates teacher assignment via `handleUpdateTeacherSection`.
   - Cancelling reverts to saved teacher.

4. **Delete Section**
   - Only last section can be deleted.
   - User confirms via `DeletePopup`.
   - On confirm → `handleSectionDelete()` → API call → refresh data.

5. **Close Modal**
   - Clicking close button resets state and calls `getAllClass()` to refresh parent data.

---

## BEHAVIOUR

- **UI Adaptation**
  - Dark mode styles applied dynamically from `isDarkMode`.
  - Teacher dropdown styled differently for edit/add mode.
  - Spinner shown during API calls.

- **Validation**
  - Prevents:
    - Adding more than **8 sections**.
    - Adding section without selecting a teacher.
  - Toasts display error messages with cooldown to prevent spamming.

- **Section Naming**
  - Names auto-generated alphabetically from translation strings `options.sections`.
  - Example: A, B, C ... H (max 8).

- **Confirmation Workflows**
  - Save → Confirmation popup (`ConformationPopup`).
  - Delete → Delete confirmation popup (`DeletePopup`).

- **Error Handling**
  - All API calls wrapped in try-catch.
  - Errors shown via `toast.error`.
