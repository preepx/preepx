import axios from "axios";
import { showAppError } from "./appAlert";


const API = axios.create({
  baseURL: import.meta.env.VITE_API_URL || "https://interview-cochhh.onrender.com/api",
});

API.interceptors.request.use((req) => {
  const token = localStorage.getItem("token");
  if (token) req.headers.Authorization = `Bearer ${token}`;
  return req;
});

API.interceptors.response.use(
  (res) => res,
  (error) => {
    const status = error.response?.status;
    const msg = error.response?.data?.message || error.response?.data?.error || "Something went wrong";

    if (status === 401) {
      localStorage.removeItem("token");
      localStorage.removeItem("user");
      if (!window.location.pathname.includes("/auth")) {
        showAppError("Your session has expired. Please sign in again.", "Session expired");
        window.location.href = "/auth";
      }
    } else if (status === 500) {
      console.error("API Error:", msg);
    }

    return Promise.reject(error);
  }
);

export default API;
