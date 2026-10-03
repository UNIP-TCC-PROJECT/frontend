import axios from "axios";

export const API_URL = "http://localhost:3000";
export const TOKEN_KEY = "access_token";

export const api = axios.create({
  baseURL: API_URL,
});

api.interceptors.request.use(
  (config) => {
    const token = localStorage.getItem(TOKEN_KEY);

    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }

    return config;
  },
  (error) => {
    return Promise.reject(error);
  }
);

// Converte "/uploads/avatars/x.png" em "http://localhost:3000/uploads/avatars/x.png"
export function imagemUrl(path?: string | null) {
  if (!path) return null;
  if (path.startsWith("http") || path.startsWith("blob:")) return path;
  return `${API_URL}${path}`;
}