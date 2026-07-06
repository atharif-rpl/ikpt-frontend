// lib/api.ts

// Tangkap Base URL dari .env
const BASE_URL = process.env.NEXT_PUBLIC_API_URL;

// Bikin fungsi custom fetch
export const fetchAPI = async (endpoint: string, options: RequestInit = {}) => {
  // Otomatis ambil token dari localStorage kalau ada
  const token = typeof window !== "undefined" ? localStorage.getItem("token") : null;

  // Set header bawaan biar nggak perlu nulis ulang terus
  const defaultHeaders: HeadersInit = {
    "Accept": "application/json",
    "Content-Type": "application/json",
  };

  if (token) {
    defaultHeaders["Authorization"] = `Bearer ${token}`;
  }

  // Gabungkan Base URL dengan endpoint (misal: /users)
  const response = await fetch(`${BASE_URL}${endpoint}`, {
    ...options,
    headers: {
      ...defaultHeaders,
      ...options.headers,
    },
  });

  return response;
};