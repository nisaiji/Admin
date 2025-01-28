import { createSlice } from "@reduxjs/toolkit";
import { jwtDecode } from "jwt-decode";

/**
 * Initial state for the authentication slice.
 * @property {string|null} role - Role of the user (e.g., teacher, admin).
 * @property {string|null} section - Section ID for the user.
 * @property {string|null} sectionName - Name of the section.
 * @property {string|null} class - Class ID for the user.
 * @property {string|null} className - Name of the class.
 * @property {string|null} id - Admin ID (only for admin users).
 * @property {string|null} schoolName - Name of the school.
 * @property {string|null} sectionStartTime - Start time for the section.
 */
const initialState = {
  role: null,
  section: null,
  sectionName: null,
  class: null,
  className: null,
  id: null,
  schoolName: null,
  sectionStartTime: null,
};

/**
 * Slice to manage authentication and user-related state.
 */
const appAuthSlice = createSlice({
  name: "auth",
  initialState,
  reducers: {
    /**
     * Retrieves the user's role from the state.
     * @param {Object} state - Current state of the slice.
     * @returns {string|null} - User's role.
     */
    getRole(state) {
      return state.role;
    },
    /**
     * Sets authentication data in the state based on the decoded JWT token.
     * @param {Object} state - Current state of the slice.
     * @param {Object} action - Action payload containing the JWT token.
     */
    setAuthData(state, action) {
      const token = action.payload;
      const decodeToken = jwtDecode(token);

      if (decodeToken.role === "teacher") {
        state.role = decodeToken.role;
        state.section = decodeToken.sectionId;
        state.sectionName = decodeToken.sectionName;
        state.class = decodeToken.classId;
        state.className = decodeToken.className;
        state.sectionStartTime = decodeToken.sectionStart;
      } else {
        state.role = decodeToken.role;
        state.id = decodeToken.adminId;
      }
      state.schoolName = decodeToken.schoolName;
    },
  },
});

export const { getRole, setAuthData } = appAuthSlice.actions;
export default appAuthSlice;
