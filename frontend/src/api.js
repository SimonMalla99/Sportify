import axios from "axios";
import { ACCESS_TOKEN } from "./constants";

const api = axios.create({
  baseURL: import.meta.env.VITE_API_URL || "http://127.0.0.1:8000/api", // Fallback URL
});

api.interceptors.request.use(
  (config) => {
    const token = localStorage.getItem(ACCESS_TOKEN);
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
  },
  (error) => {
    return Promise.reject(error);
  }
);

// ✅ Function to fetch FPL Data
export const getFPLData = async () => {
  try {
    const response = await api.get("/api/fpl-data/"); // Adjust endpoint if needed
    return response.data;
  } catch (error) {
    console.error("Error fetching FPL data:", error);
    return null;
  }
};

export const getFPLFixtures = async () => {
  try {
    const response = await api.get("/api/fpl-fixtures/"); // Adjust endpoint if needed
    return response.data;
  } catch (error) {
    console.error("Error fetching FPL data:", error);
    return null;
  }
};

export default api;
