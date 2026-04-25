import axios from "axios";

const API_URL = process.env.NODE_ENV === "production" 
  ? "https://resistantaibackend1.onrender.com/api" 
  : "http://localhost:5000/api";

const API = axios.create({ baseURL: API_URL });

// Attach token to every request if present
API.interceptors.request.use((config) => {
  const token = localStorage.getItem("token");
  if (token) config.headers.Authorization = `Bearer ${token}`;
  return config;
});

// Auth
export const signup = (data) => API.post("/auth/signup", data);
export const login = (data) => API.post("/auth/login", data);

// Image Generation
export const generateImage = (data) => API.post("/generate", data);
export const getHistory = () => API.get("/generate/history");
export const deleteHistoryItem = (index) => API.delete(`/generate/history/${index}`);

// Resistant AI Sessions
export const startSession = (data) => API.post("/resistant/start", data);
export const submitAnswer = (data) => API.post("/resistant/submit", data);
export const teachConcept = (data) => API.post("/resistant/teach", data);
export const getSession = (id) => API.get(`/resistant/session/${id}`);
export const getSessions = () => API.get("/resistant/sessions");
export const getProfile = () => API.get("/auth/me");

// PDF Mode
export const uploadPdf = (formData) => API.post("/pdf/upload", formData, {
  headers: { "Content-Type": "multipart/form-data" }
});
export const getPdfSession = (id) => API.get(`/pdf/session/${id}`);
export const submitPdfCheckpoint = (data) => API.post("/pdf/checkpoint", data);
export const getPdfSessions = () => API.get("/pdf/sessions");
