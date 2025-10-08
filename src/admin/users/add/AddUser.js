import React, { useState } from "react";
import { useNavigate } from "react-router-dom";

export default function AddUser() {
  const [form, setForm] = useState({
    fullname: "",
    email: "",
    password: "",
    role: "1", // mặc định là user
  });

  const [message, setMessage] = useState("");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);
  const navigate = useNavigate();
  const token = localStorage.getItem("token");

  const handleChange = (e) => {
    setForm({ ...form, [e.target.name]: e.target.value });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError("");

    try {
      const res = await fetch("http://localhost:8000/api/admin/users", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Accept: "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify(form),
      });

      if (!res.ok) throw new Error("Lỗi khi thêm người dùng");

      setMessage("✅ Thêm người dùng thành công");
      setTimeout(() => {
        setMessage("");
        navigate("/admin/users");
      }, 1500);
    } catch (err) {
      setError("❌ Không thể thêm người dùng. Vui lòng thử lại.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="max-w-xl mx-auto p-6 bg-white shadow-md rounded-md">
      <h1 className="text-2xl font-semibold mb-4">➕ Thêm người dùng</h1>

      {message && <div className="mb-4 text-green-700">{message}</div>}
      {error && <div className="mb-4 text-red-700">{error}</div>}

      <form onSubmit={handleSubmit} className="space-y-4">
        <input
          type="text"
          name="fullname"
          placeholder="Họ tên"
          value={form.fullname}
          onChange={handleChange}
          className="w-full p-2 border rounded"
          required
        />
        <input
          type="email"
          name="email"
          placeholder="Email"
          value={form.email}
          onChange={handleChange}
          className="w-full p-2 border rounded"
          required
        />
        <input
          type="password"
          name="password"
          placeholder="Mật khẩu"
          value={form.password}
          onChange={handleChange}
          className="w-full p-2 border rounded"
          required
        />
        <select
          name="role"
          value={form.role}
          onChange={handleChange}
          className="w-full p-2 border rounded"
        >
          <option value="1">Người dùng</option>
          <option value="0">Quản trị viên</option>
        </select>

        <button
          type="submit"
          disabled={loading}
          className="w-full py-2 bg-blue-600 text-white rounded hover:bg-blue-700"
        >
          {loading ? "Đang xử lý..." : "💾 Thêm người dùng"}
        </button>
      </form>
    </div>
  );
}