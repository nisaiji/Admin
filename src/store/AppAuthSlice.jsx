import { createSlice } from "@reduxjs/toolkit";
import { jwtDecode } from "jwt-decode";
import { getItem } from "../services/LocalStorageManager";

let initialRole = null;
let initialSection = null;
let initialClass = null;
const token = getItem("access_token");

if (token) {
  try {
    const decodedToken = jwtDecode(token);
    // console.log(decodedToken);
    initialRole = decodedToken.role;
    initialSection = decodedToken.sectionId;
    initialClass = decodedToken.classId;
    if (decodedToken.role === "teacher") {
      localStorage.setItem("class", decodedToken.className);
      localStorage.setItem("section", decodedToken.sectionName);
    }
  } catch (error) {
    console.error("Failed to decode token:", error);
  }
}

const appAuthSlice = createSlice({
  name: "auth",
  initialState: {
    role: initialRole,
    section: initialSection,
    class: initialClass,
  },
  reducers: {
    getRole(state) {
      return state.role;
    },
  },
});

export const appAuthAction = appAuthSlice.actions;
export default appAuthSlice;
