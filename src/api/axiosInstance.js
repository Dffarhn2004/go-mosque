import axios from "axios";

const railwayBaseURL =
  import.meta.env.VITE_API_URL ||
  "https://go-mosque-be-production.up.railway.app/api/v1";
const edgeBaseURL = import.meta.env.VITE_EDGE_API_URL || "";
const supabasePublishableKey = import.meta.env.VITE_SUPABASE_PUBLISHABLE_KEY || "";
const edgePrefixes = String(import.meta.env.VITE_EDGE_PREFIXES || "")
  .split(",")
  .map((prefix) => prefix.trim())
  .filter(Boolean);

function resolveUrl(url = "") {
  const path = url.startsWith("http") ? url : url.startsWith("/") ? url : `/${url}`;
  const matched = edgePrefixes.some(
    (prefix) => path === prefix || path.startsWith(`${prefix}/`) || path.startsWith(`${prefix}?`),
  );
  if (matched && edgeBaseURL) {
    return `${edgeBaseURL.replace(/\/$/, "")}${path}`;
  }
  return undefined;
}

const axiosInstance = axios.create({
  baseURL: railwayBaseURL,
  headers: {
    "Content-Type": "application/json",
    "ngrok-skip-browser-warning": "69420",
  },
});

axiosInstance.interceptors.request.use((config) => {
  const token =
    localStorage.getItem("accessToken") || sessionStorage.getItem("accessToken");
  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }

  if (typeof FormData !== "undefined" && config.data instanceof FormData) {
    delete config.headers["Content-Type"];
  }

  const routed = resolveUrl(config.url || "");
  if (routed) {
    config.baseURL = undefined;
    config.url = routed;
    if (supabasePublishableKey) {
      config.headers.apikey = supabasePublishableKey;
    }
    if (import.meta.env.DEV) {
      console.info("[Goqu API] Edge", routed);
    }
  }

  return config;
});

export default axiosInstance;
