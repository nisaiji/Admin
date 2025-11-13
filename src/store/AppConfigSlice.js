import { createSlice } from "@reduxjs/toolkit";

const appConfigSlice = createSlice({
  name: "auth",
  initialState: {
    isLoggedin: false,
    isDarkMode: JSON.parse(localStorage.getItem("isDarkMode")) ?? true,
    isLoading: false,
    toastData: {},
  },
  reducers: {
    login(state) {
      state.isLoggedin = true;
    },
    logout(state) {
      state.isLoggedin = false;
    },
    toggleDarkMode(state) {
      state.isDarkMode = !state.isDarkMode;
      localStorage.setItem("isDarkMode", JSON.stringify(state.isDarkMode));
    },
    setLoading(state, action) {
      state.isLoading = action.payload;
    },
    sowToast(state, action) {
      state.toastData = action.payload;
    },
  },
});

export const appConfigAction = appConfigSlice.actions;
export default appConfigSlice;
