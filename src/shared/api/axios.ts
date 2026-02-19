import axios from "axios";
import { toast } from "sonner";

const api = axios.create({
  baseURL: "https://api.nafisart.uz",
  headers: {
    "Content-Type": "application/json",
  },
});

// Token interceptor (future auth)
api.interceptors.request.use((config) => {
  const token = localStorage.getItem("auth_token");
  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
});

// Error handler
api.interceptors.response.use(
  (response) => response,
  (error) => {
    const message =
      error.response?.data?.message || error.message || "Xatolik yuz berdi";
    
    if (error.response?.status === 401) {
      localStorage.removeItem("auth_token");
      // Future: redirect to login
    }
    
    toast.error(message);
    return Promise.reject(error);
  }
);

export default api;
