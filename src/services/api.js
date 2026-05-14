// import axios from "axios";

// // Make sure this matches your backend server port (3000)
// const API_BASE_URL =
//   import.meta.env.VITE_API_URL || "http://localhost:3000/api";

// console.log("API Base URL:", API_BASE_URL);

// const api = axios.create({
//   baseURL: API_BASE_URL,
//   headers: {
//     "Content-Type": "application/json",
//   },
// });

// api.interceptors.request.use((config) => {
//   const token = localStorage.getItem("token");
//   if (token) config.headers.Authorization = `Bearer ${token}`;
//   return config;
// });

// api.interceptors.response.use(
//   (res) => res,
//   (err) => {
//     const status = err?.response?.status;
//     const url = err?.config?.url || "";

//     // KHQR confirm polling uses 404 to mean "payment not completed yet"
//     const isKhqrConfirmPolling404 =
//       status === 404 && url.includes("/khqr/confirm/");

//     if (!isKhqrConfirmPolling404) {
//       console.error("API Error:", status, err.response?.data);
//     }

//     if (status === 401) {
//       localStorage.removeItem("token");
//       localStorage.removeItem("user");
//       window.location.href = "/login";
//     }
//     return Promise.reject(err);
//   },
// );

// export default api;

import axios from "axios";

// ✅ FIX: Change to port 3000 to match backend
const API_BASE_URL =
  import.meta.env.VITE_API_URL || "http://localhost:3000/api";

console.log("API Base URL:", API_BASE_URL);

const api = axios.create({
  baseURL: API_BASE_URL,
  headers: {
    "Content-Type": "application/json",
  },
  timeout: 30000,
});

// Request interceptor
api.interceptors.request.use(
  (config) => {
    const token = localStorage.getItem("token");
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    console.log(`📤 ${config.method.toUpperCase()} ${config.url}`);
    return config;
  },
  (error) => {
    console.error("Request error:", error);
    return Promise.reject(error);
  },
);

// Response interceptor
api.interceptors.response.use(
  (response) => {
    console.log(`📥 ${response.status} ${response.config.url}`);
    return response;
  },
  (error) => {
    const status = error?.response?.status;
    const url = error?.config?.url || "";

    // Don't log 404 for KHQR polling (it's expected)
    const isKhqrPolling = status === 404 && url.includes("/khqr/confirm/");

    if (!isKhqrPolling) {
      console.error("API Error:", status, error.response?.data);
    }

    if (status === 401) {
      localStorage.removeItem("token");
      localStorage.removeItem("user");
      window.location.href = "/login";
    }

    return Promise.reject(error);
  },
);

export default api;
