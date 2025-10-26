import axios from "axios";

// Base URL from environment variables
const API_BASE_URL = import.meta.env.VITE_API_BASE_URL || "http://localhost:8080";

// Create axios instance with default config
const api = axios.create({
  baseURL: API_BASE_URL,
  timeout: 30000,
  headers: {
    "Content-Type": "application/json",
  },
});

// Request interceptor - Add auth token to requests
api.interceptors.request.use(
  (config) => {
    // Get user from localStorage
    const userStr = localStorage.getItem("user");
    if (userStr) {
      try {
        const user = JSON.parse(userStr);
        if (user.token) {
          config.headers.Authorization = `Bearer ${user.token}`;
        }
      } catch (error) {
        console.error("Error parsing user from localStorage:", error);
      }
    }
    return config;
  },
  (error) => {
    return Promise.reject(error);
  }
);

// Response interceptor - Handle errors globally
api.interceptors.response.use(
  (response) => {
    return response;
  },
  (error) => {
    // Handle different error types
    if (error.response) {
      const { status } = error.response;

      switch (status) {
        case 401:
          // Unauthorized - clear user data and redirect to home
          console.error("Unauthorized access - logging out");
          localStorage.removeItem("user");
          if (window.location.pathname !== "/") {
            window.location.href = "/";
          }
          break;
        case 403:
          console.error("Forbidden - You don't have permission");
          break;
        case 404:
          console.error("Resource not found");
          break;
        case 500:
          console.error("Server error - please try again later");
          break;
        default:
          console.error(`Error ${status}:`, error.response.data);
      }
    } else if (error.request) {
      // Request was made but no response received
      console.error("Network error - please check your connection");
    } else {
      // Something else happened
      console.error("Error:", error.message);
    }

    return Promise.reject(error);
  }
);

// Helper function to get user token
export const getAuthToken = () => {
  const userStr = localStorage.getItem("user");
  if (userStr) {
    try {
      const user = JSON.parse(userStr);
      return user.token;
    } catch (error) {
      console.error("Error getting auth token:", error);
    }
  }
  return null;
};

// Helper function to check if user is authenticated
export const isAuthenticated = () => {
  return !!getAuthToken();
};

// Helper function to get current user
export const getCurrentUser = () => {
  const userStr = localStorage.getItem("user");
  if (userStr) {
    try {
      return JSON.parse(userStr);
    } catch (error) {
      console.error("Error getting current user:", error);
    }
  }
  return null;
};

// Helper function to logout
export const logout = () => {
  localStorage.removeItem("user");
  window.location.href = "/";
};

// API endpoints organized by resource
export const authAPI = {
  login: (credentials) => api.post("/api/utenti/login", credentials),
  register: (userData) => api.post("/api/utenti/register", userData),
  updateProfile: (userId, userData) => api.put(`/api/utenti/${userId}`, userData),
};

export const voliAPI = {
  create: (voloData) => api.post("/api/voli/crea", voloData),
};

export const preferitiAPI = {
  getByUser: (userId) => api.get(`/api/preferiti/utente/${userId}`),
  add: (preferitoData) => api.post("/api/preferiti/aggiungi", preferitoData),
  remove: (preferitoId) => api.delete(`/api/preferiti/${preferitoId}`),
};

export const passeggeriAPI = {
  create: (passeggeroData) => api.post("/api/passaggeri/crea", passeggeroData),
};

export const contattiAPI = {
  save: (contattoData) => api.post("/api/contatti/salva", contattoData),
};

export const pagamentiAPI = {
  save: (pagamentoData) => api.post("/api/pagamenti/salva", pagamentoData),
};

export const prenotazioniAPI = {
  create: (prenotazioneData) => api.post("/api/prenotazioni/crea", prenotazioneData),
};

export default api;
