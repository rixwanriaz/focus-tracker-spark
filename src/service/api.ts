// src/service/api.ts
import axios from "axios";
import { API_CONFIG } from "../config/api.config";
import { store } from "../redux/store";

// Create axios instance with base configuration
const api = axios.create({
  baseURL: API_CONFIG.BASE_URL,
  headers: {
    "Content-Type": "application/json",
  },
});

// Add request interceptor to include auth token
api.interceptors.request.use(
  (config) => {
    // Get token from Redux state
    const state = store.getState();
    const token = state.auth?.accessToken;
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
  },
  (error) => {
    return Promise.reject(error);
  }
);

// Add response interceptor for error handling
api.interceptors.response.use(
  (response) => response,
  (error) => {
    // Handle common errors
    if (error.response?.status === 401) {
      // Token expired or invalid - could dispatch logout action here
      console.error("Authentication failed - token may be expired");
    }
    return Promise.reject(error);
  }
);

export { api };
