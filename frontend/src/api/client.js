import axios from "axios";

export const api = axios.create({
  baseURL: "/api",
  headers: {
    "Content-Type": "application/json"
  }
});

api.interceptors.request.use((config) => {
  const token = localStorage.getItem("teamwork_token");
  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
});

api.interceptors.response.use(
  (response) => response,
  (error) => {
    if (error.response && error.response.status === 401) {
      if (window.location.pathname !== "/login" && window.location.pathname !== "/register") {
        localStorage.removeItem("teamwork_token");
        localStorage.removeItem("teamwork_user");
        window.location.href = "/login";
      }
    }
    return Promise.reject(error);
  }
);
