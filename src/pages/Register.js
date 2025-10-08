import React, { useState } from "react";
import { useNavigate, Link } from "react-router-dom";
import { registerUser } from "../api/auth";
import { useAuth } from "../context/AuthContext";

export default function Register() {
  const { login } = useAuth();
  const navigate = useNavigate();
  const [form, setForm] = useState({
    fullname: "",
    email: "",
    password: "",
  });
  const [error, setError] = useState("");

  const handleChange = (e) => {
    setForm({ ...form, [e.target.name]: e.target.value });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError("");

    try {
      
      const res = await registerUser(form);
      
   
      if (res.data?.token) {
        localStorage.setItem("token", res.data.token);
        await login({ email: form.email, password: form.password });
        navigate("/");
      }
    } catch (err) {
      console.error("Register error:", err);
      setError(err.response?.data?.message || "Đăng ký thất bại");
    }
  };

  return (
    <div className="flex justify-center items-center min-h-screen bg-gray-100">
      <div className="bg-white p-6 rounded-lg shadow-md w-full max-w-md">
        <h2 className="text-2xl font-bold mb-4 text-center">Đăng ký</h2>
        <form onSubmit={handleSubmit} className="space-y-4">
          <input
            type="text"
            name="fullname"
            placeholder="Họ và tên"
            value={form.fullname}
            onChange={handleChange}
            className="w-full px-3 py-2 border rounded"
            required
          />
          <input
            type="email"
            name="email"
            placeholder="Email"
            value={form.email}
            onChange={handleChange}
            className="w-full px-3 py-2 border rounded"
            required
          />
          <input
            type="password"
            name="password"
            placeholder="Mật khẩu"
            value={form.password}
            onChange={handleChange}
            className="w-full px-3 py-2 border rounded"
            required
          />
          {error && <p className="text-red-500 text-sm">{error}</p>}
          <button
            type="submit"
            className="w-full bg-green-500 text-white py-2 rounded hover:bg-green-600"
          >
            Đăng ký
          </button>
        </form>
        <p className="text-sm mt-4 text-center">
          Đã có tài khoản?{" "}
          <Link to="/login" className="text-orange-500 hover:underline">
            Đăng nhập
          </Link>
        </p>
      </div>
    </div>
  );
}