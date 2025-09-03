// src/api.js
import axios from "axios";

const API = axios.create({
  baseURL: "http://localhost:5000", // change later when deployed
});

// 🔹 Auto-attach token if available
API.interceptors.request.use((req) => {
  const token = localStorage.getItem("token");
  if (token) {
    req.headers.Authorization = `Bearer ${token}`;
  }
  return req;
});

// =====================
// 🔹 Auth APIs
// =====================
export const registerUser = (form) => API.post("/register", form);
export const loginUser = (form) => API.post("/login", form);

// =====================
// 🔹 Place APIs
// =====================
export const getPlaces = () => API.get("/places");

// =====================
// 🔹 Tour APIs
// =====================
export const getTours = () => API.get("/tours");
export const createTour = (data) => API.post("/tours", data);
