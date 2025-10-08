import React, { createContext, useContext, useState, useEffect } from "react";
import { loginUser, getProfile, logoutUser } from "../api/auth";

const AuthContext = createContext();

export function AuthProvider({ children }) {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);


  useEffect(() => {
    console.log("🔍 Checking token on mount...");
    const token = localStorage.getItem("token");
    console.log("Token found:", token);

    if (token) {
      getProfile()
        .then((res) => {
          console.log("✅ Profile loaded:", res.data);
          setUser(res.data);
          localStorage.setItem("user", JSON.stringify(res.data));
        })
        .catch((err) => {
          console.log("❌ Profile failed:", err);
          setUser(null);
          localStorage.removeItem("token");
          localStorage.removeItem("user");
        })
        .finally(() => setLoading(false));
    } else {
      console.log("❌ No token found");
      setLoading(false);
    }
  }, []);

  const login = async (credentials) => {
    console.log("🔐 Logging in...");
    const res = await loginUser(credentials);
    const data = res.data;

    if (data?.token) {
      console.log("✅ Login successful, saving token:", data.token);

      localStorage.setItem("token", data.token);
      localStorage.setItem("user", JSON.stringify(data.user));

      setUser(data.user);

      return { success: true, user: data.user };
    }

    return { success: false };
  };

  const logout = async () => {
    try {
      await logoutUser();
    } catch (e) {
      console.error("Logout error:", e);
    }
    setUser(null);
    localStorage.removeItem("token");
    localStorage.removeItem("user");
  };

  const updateUser = (userData) => {
    setUser(userData);
  };

  return (
    <AuthContext.Provider value={{ user, login, logout, loading, updateUser }}>
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  return useContext(AuthContext);
}