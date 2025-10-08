import api from "./index";

export const registerUser = (data) => api.post("/register", data);

export const loginUser = (credentials) => api.post("/login", credentials);

export const getProfile = () => api.get("/me");

export const logoutUser = () => api.post("/logout");
