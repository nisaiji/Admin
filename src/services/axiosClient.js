import axios from "axios";
import toast from "react-hot-toast";

const baseURL = "http://127.0.0.1:4001/";
// const baseURL = "https://nisaiji.com/";

export const axiosClient = axios.create({ baseURL });

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
      },
    });
    return response?.data?.result?.accessToken;
  } catch (error) {
    return null;
  }
}

axiosClient.interceptors.request.use(
  (request) => {
    const accessToken = localStorage.getItem("access_token");
    request.headers["Authorization"] = `Bearer ${accessToken}`;
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
    if (data.status === "ok") {
      return data;
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
        localStorage.removeItem("access_token");
        localStorage.removeItem("refresh_token");
        localStorage.removeItem("username");
        localStorage.removeItem("firstname");
        localStorage.removeItem("searchClass");
        localStorage.removeItem("searchSection");
        window.location.replace("/login", "_self");
        return Promise.reject(data?.message);
      }
    }
    if (data?.status == "error") {
      return Promise.reject(data?.message);
    }
  },
  async (error) => {
    if (error.message === "Network Error") {
      toast.error("Check your internet connectivity");
      return;
    }
    return Promise.reject(error?.response?.data?.message);
  }
);
