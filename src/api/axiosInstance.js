import axios from "axios";

const axiosInstance = axios.create({
  // baseURL: "https://go-mosque-be.vercel.app/api/v1",
  // baseURL: "https://startling-queijadas-684594.netlify.app/api/v1",
  baseURL: "http://localhost:3001/api/v1",
  headers: {
    "Content-Type": "application/json",
    "ngrok-skip-browser-warning": "69420",
  },
});

axiosInstance.interceptors.request.use((config) => {
  const token = localStorage.getItem("accessToken");
  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
});

export default axiosInstance;
