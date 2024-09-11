import axios from "axios";
import {
  getItem,
  KEY_ACCESS_TOKEN,
  removeItem,
} from "./LocalStorageManager.js";
import toast from "react-hot-toast";
// const BASE_URL = "http://localhost:4000/";
const BASE_URL = "https://nisaiji.com/";

export const axiosClient = axios.create({
  baseURL: BASE_URL,
});

axiosClient.interceptors.request.use(
  (request) => {
    const accessToken = getItem(KEY_ACCESS_TOKEN);
    request.headers["Authorization"] = `Bearer ${accessToken}`;
    return request;
  },
  (error) => {}
);

axiosClient.interceptors.response.use(
  async (response) => {
    const data = response.data;
    // console.log('axios res',response);
    if (data.status === "ok") {
      return data;
    }
    if (data.status === "error" && data.message === "jwt expired") {
      removeItem(KEY_ACCESS_TOKEN);
      removeItem("username");
      window.location.replace("/login", "_self");
      return Promise.reject(data.message);
    }
    if (data.status == "error") {
      return Promise.reject(data.message);
    }
  },
  async (error) => {
    if (error.message === "Network Error") {
      toast.error("Check your internet connectivity");
    }
    console.log("axios err", error);
    return Promise.reject(error.response.data.message);
  }
);
