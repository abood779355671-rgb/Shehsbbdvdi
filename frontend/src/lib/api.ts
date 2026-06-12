import axios from "axios";
import Cookies from "js-cookie";

const API_BASE = process.env.NEXT_PUBLIC_API_URL || "";

const api = axios.create({
  baseURL: API_BASE,
  headers: { "Content-Type": "application/json" },
});

api.interceptors.request.use((config) => {
  const token = Cookies.get("access_token");
  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
});

api.interceptors.response.use(
  (res) => res,
  (error) => {
    if (error.response?.status === 401) {
      Cookies.remove("access_token");
      window.location.href = "/";
    }
    return Promise.reject(error);
  }
);

export async function login(username: string, password: string) {
  const res = await api.post("/api/auth/login", { username, password });
  return res.data;
}

export async function analyzeVideo(url: string) {
  const res = await api.post("/api/videos/analyze", { url });
  return res.data;
}

export async function startDownload(payload: {
  url: string;
  format_id: string;
  format_type: string;
  quality: string;
  title: string;
  thumbnail: string;
  channel: string;
  duration: number;
  video_id: string;
}) {
  const res = await api.post("/api/downloads/start", payload);
  return res.data;
}

export async function getHistory() {
  const res = await api.get("/api/downloads/history");
  return res.data;
}

export async function deleteHistoryItem(id: number) {
  const res = await api.delete(`/api/downloads/history/${id}`);
  return res.data;
}

export async function clearHistory() {
  const res = await api.delete("/api/downloads/history");
  return res.data;
}

export function getDownloadUrl(videoId: string, filename: string) {
  const token = Cookies.get("access_token");
  return `${API_BASE}/api/downloads/file/${videoId}/${encodeURIComponent(filename)}?token=${token}`;
}

export default api;
