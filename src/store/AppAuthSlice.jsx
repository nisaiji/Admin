import { createAsyncThunk, createSlice } from "@reduxjs/toolkit";
import { jwtDecode } from "jwt-decode";
import { axiosClient } from "../services/axiosClient";
import EndPoints from "../services/EndPoints";

export const setAuth = createAsyncThunk("auth/setAuth", async (data) => {
  const existing = localStorage.getItem("status");
  const parsed = existing ? JSON.parse(existing) : {};
  const mergedData = { ...parsed, ...data };
  localStorage.setItem("status", JSON.stringify(mergedData));
  return mergedData;
});

export const setClassAndSectionData = createAsyncThunk(
  "auth/setClassAndSectionData",
  async (data) => {
    const existing = localStorage.getItem("classAndSectionData");
    const parsed = existing ? JSON.parse(existing) : {};
    const mergedData = { ...parsed, ...data };
    localStorage.setItem("classAndSectionData", JSON.stringify(mergedData));
    return mergedData;
  }
);

// Thunk to fetch admin data
export const fetchAdmin = createAsyncThunk("admin/fetchAdmin", async (_) => {
  try {
    const res = await axiosClient.get(EndPoints.ADMIN.GET_ADMIN);
    if (res?.statusCode === 200) {
      localStorage.setItem("adminData", JSON.stringify(res?.result));
      return res?.result;
    }
  } catch (e) {
    // console.log({ e });
  }
});

// Thunk to fetch teacher data
export const fetchTeacher = createAsyncThunk(
  "teacher/fetchTeacher",
  async (_) => {
    try {
      const res = await axiosClient.get(EndPoints.TEACHER.GET_TEACHER);
      if (res?.statusCode === 200) {
        localStorage.setItem("teacherData", JSON.stringify(res?.result[0]));
        return res?.result;
      }
    } catch (e) {
      // console.log({ e });
    }
  }
);

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
  data: JSON.parse(localStorage.getItem("adminData")) || {},
  teacherData: JSON.parse(localStorage.getItem("teacherData")) || {},
  classAndSectionData:
    JSON.parse(localStorage.getItem("classAndSectionData")) || {},
  classAndSectionDataOfTeacher: {},
  status: JSON.parse(localStorage.getItem("status")) || {},
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

      if (decodeToken.role === "classTeacher") {
        state.role = decodeToken.role;
        state.classAndSectionDataOfTeacher.sectionId = decodeToken.sectionId;
        state.classAndSectionDataOfTeacher.sectionName =
          decodeToken.sectionName;
        state.classAndSectionDataOfTeacher.classId = decodeToken.classId;
        state.classAndSectionDataOfTeacher.className = decodeToken.className;
        state.classAndSectionDataOfTeacher.startTime = decodeToken.sectionStart;
        state.classAndSectionDataOfTeacher.school = decodeToken.adminId;
        state.classAndSectionDataOfTeacher.sessionId = decodeToken.sessionId;
      } else {
        state.role = decodeToken.role;
        state.classAndSectionData.id = decodeToken.adminId;
        state.id = decodeToken.adminId;
      }
      state.schoolName = decodeToken.schoolName;
    },
    updateAdminData(state, action) {
      state.data = { ...state.data, ...action.payload };
    },
  },
  extraReducers: (builder) => {
    builder
      .addCase(fetchAdmin.fulfilled, (state, action) => {
        state.data = action.payload;
      })
      .addCase(fetchTeacher.fulfilled, (state, action) => {
        state.teacherData = action.payload;
      })
      .addCase(setAuth.fulfilled, (state, action) => {
        state.status = action.payload;
      })
      .addCase(setClassAndSectionData.fulfilled, (state, action) => {
        state.classAndSectionData = action.payload;
      });
  },
});

export const { getRole, setAuthData, updateAdminData } = appAuthSlice.actions;
export default appAuthSlice;
