import axios from "axios";

export const API_URL =
  import.meta.env.VITE_API_URL || "http://localhost:3000";

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
  (error) => Promise.reject(error),
);

// Monta o endereço das imagens armazenadas no backend.
export function imagemUrl(path?: string | null): string | null {
  if (!path) return null;

  if (/^https?:\/\//i.test(path) || path.startsWith("blob:")) {
    return path;
  }

  const baseUrl = API_URL.replace(/\/+$/, "");
  const imagePath = path.replace(/^\/+/, "");

  return `${baseUrl}/${imagePath}`;
}