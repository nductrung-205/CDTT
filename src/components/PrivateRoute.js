import React from "react";
import { Navigate } from "react-router-dom";

export default function PrivateRoute({ children }) {
  const user = JSON.parse(localStorage.getItem("user"));
  const token = localStorage.getItem("token");


  if (!user || !token || user.role !== "admin") {
    return <Navigate to="/admin/login" replace />;
  }

  return children;
}
