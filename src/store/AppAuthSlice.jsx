import { createSlice } from "@reduxjs/toolkit";
import { jwtDecode } from "jwt-decode";

const initialState = {
  role: null,
  section: null,
  sectionName: null,
  class: null,
  className: null,
  id: null,
};

const appAuthSlice = createSlice({
  name: "auth",
  initialState,
  reducers: {
    getRole(state) {
      return state.role;
    },
    // Add this action to update the state after login
    setAuthData(state, action) {
      const token = action.payload;
      const decodeToken = jwtDecode(token);

      if (decodeToken.role === "teacher") {
        state.role = decodeToken.role;
        state.section = decodeToken.sectionId;
        state.sectionName = decodeToken.sectionName;
        state.class = decodeToken.classId;
        state.className = decodeToken.className;
      } else {
        state.role = decodeToken.role;
        state.id = decodeToken.adminId;
      }
    },
  },
});

export const { getRole, setAuthData } = appAuthSlice.actions;
export default appAuthSlice;
