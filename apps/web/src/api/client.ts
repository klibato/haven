import axios from "axios";

const api = axios.create({
  baseURL: "/api",
  headers: {
    "Content-Type": "application/json",
  },
});

// Request interceptor to add auth token
api.interceptors.request.use((config) => {
  const token = localStorage.getItem("haven_token");
  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
});

// Response interceptor for token refresh
api.interceptors.response.use(
  (response) => response,
  async (error) => {
    const originalRequest = error.config;

    if (error.response?.status === 401 && !originalRequest._retry) {
      originalRequest._retry = true;

      const refreshToken = localStorage.getItem("haven_refresh_token");
      if (refreshToken) {
        try {
          const { data } = await axios.post("/api/auth/refresh", { refreshToken });
          localStorage.setItem("haven_token", data.token);
          localStorage.setItem("haven_refresh_token", data.refreshToken);
          originalRequest.headers.Authorization = `Bearer ${data.token}`;
          return api(originalRequest);
        } catch {
          localStorage.removeItem("haven_token");
          localStorage.removeItem("haven_refresh_token");
          window.location.href = "/login";
        }
      }
    }

    return Promise.reject(error);
  },
);

export { api };
