import axios from "axios";
import { ACCESS_TOKEN, REFRESH_TOKEN } from "./constants";

const api = axios.create({
  baseURL: import.meta.env.VITE_API_URL || "http://127.0.0.1:8000/api", // Fallback URL
});

// Attach access token to requests
api.interceptors.request.use(
  (config) => {
    const token = localStorage.getItem(ACCESS_TOKEN);
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
  },
  (error) => Promise.reject(error)
);

// Refresh token logic
api.interceptors.response.use(
  (response) => response,
  async (error) => {
    if (error.response && error.response.status === 401) {
      const refreshToken = localStorage.getItem(REFRESH_TOKEN);
      if (refreshToken) {
        try {
          const res = await axios.post(`${api.defaults.baseURL}/token/refresh/`, { refresh: refreshToken });
          localStorage.setItem(ACCESS_TOKEN, res.data.access);
          error.config.headers.Authorization = `Bearer ${res.data.access}`;
          return api(error.config); // Retry request with new token
        } catch (refreshError) {
          console.error("Token refresh failed, logging out...");
        }
      }
      // Remove tokens and redirect to login if refresh fails
      localStorage.removeItem(ACCESS_TOKEN);
      localStorage.removeItem(REFRESH_TOKEN);
      window.location.href = "/login"; // Redirect user
    }
    return Promise.reject(error);
  }
);

// ✅ Function to fetch Fantasy Premier League (FPL) player data
export const getFPLData = async () => {
  try {
    const response = await api.get("/fpl-data/"); // Adjust endpoint if needed
    return response.data;
  } catch (error) {
    console.error("Error fetching FPL data:", error);
    return null;
  }
};

// ✅ Function to fetch FPL Fixtures
export const getFPLFixtures = async () => {
  try {
    const response = await api.get("/fpl-fixtures/"); // Adjust endpoint if needed
    return response.data;
  } catch (error) {
    console.error("Error fetching FPL fixtures:", error);
    return null;
  }
};

export default api;
