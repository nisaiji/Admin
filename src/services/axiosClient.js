import axios from "axios";
import toast from "react-hot-toast";
import { sha256 } from "js-sha256";

// const baseURL = "http://localhost:4000/";
// const baseURL = "https://api.sharedri.com";
const baseURL = "https://development-api.nisaiji.com/";

export const axiosClient = axios.create({ baseURL });
const key = sha256(import.meta.env.VITE_SECOND_SECURITY_KEY);

// Function to request a new access token using the refresh token
async function refreshAccessToken() {
  const refreshToken = localStorage.getItem("refresh_token");
  if (!refreshToken) {
    return null;
  }
  try {
    const response = await axios.get(`${baseURL}admin/refresh`, {
      headers: {
        Authorization: `Bearer ${refreshToken}`,
        SecondSecurityKey: key,
      },
    });
    return response?.data?.result?.accessToken;
  } catch (error) {
    return null;
  }
}

axiosClient.interceptors.request.use(
  (request) => {
    const accessToken =
      localStorage.getItem("temp_access_token") ||
      localStorage.getItem("access_token");
    // console.log(accessToken);

    request.headers["Authorization"] = `Bearer ${accessToken}`;
    request.headers["SecondSecurityKey"] = key;
    return request;
  },
  (error) => {
    Promise.reject(error);
  }
);

axiosClient.interceptors.response.use(
  async (response) => {
    if (response.config.url.includes("admin/students-excelsheet")) {
      if (response.status === 200) {
        return response?.data;
      }
    }
    const data = response.data;
    // console.log("data", data);

    if (data.status === "ok") {
      return data;
    }
    if (data?.statusCode === 410) {
      localStorage.clear();
      setTimeout(() => {
        window.location.replace("/login", "_self");
      }, 2000);
      return Promise.reject(data?.message);
    }
    if (data?.statusCode === 500 && data?.message === "jwt expired") {
      const originalRequest = response.config;

      // Try refreshing the token
      const newAccessToken = await refreshAccessToken();

      if (newAccessToken) {
        localStorage.setItem("access_token", newAccessToken);
        originalRequest.headers["Authorization"] = `Bearer ${newAccessToken}`;

        // Retry the original request with the new access token
        return axiosClient(originalRequest);
      } else {
        localStorage.clear();
        setTimeout(() => {
          window.location.replace("/login", "_self");
        }, 2000);
        return Promise.reject(data?.message);
      }
    } else if (data?.statusCode === 500 && data?.message === "jwt malformed") {
      localStorage.clear();
      setTimeout(() => {
        window.location.replace("/login", "_self");
      }, 2000);
    }
    if (data?.status == "error") {
      return Promise.reject(data?.message);
    }
  },
  async (error) => {
    // console.log("api error", error);

    if (error.message === "Network Error") {
      toast.error("Check your internet connectivity");
      return;
    }
    const err = error?.response?.data;

    if (err?.statusCode === 403 || err?.statusCode === 410) {
      localStorage.clear();
      setTimeout(() => {
        window.location.replace("/login", "_self");
      }, 2000);
      return Promise.reject(err?.message);
    }
    return Promise.reject(err?.message);
  }
);
