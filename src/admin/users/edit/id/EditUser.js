import React, { useEffect, useState } from "react";
import { useParams, useNavigate } from "react-router-dom";

export default function EditUser() {
  const { id } = useParams();
  const navigate = useNavigate();

  const [form, setForm] = useState({
    fullname: "",
    email: "",
    password: "",
    role: "1",
  });

  const [message, setMessage] = useState("");
  const [error, setError] = useState("");
  const token = localStorage.getItem("token");

  useEffect(() => {
    fetch(`http://localhost:8000/api/admin/users/${id}`, {
      headers: {
        Authorization: `Bearer ${token}`,
        Accept: "application/json",
      },
    })
      .then(async (res) => {
        if (!res.ok) throw new Error("Không thể lấy dữ liệu người dùng");
        const data = await res.json();
        setForm({
          fullname: data.fullname || "",
          email: data.email || "",
          password: "",
          role: data.role?.toString() || "1",
        });
      })
      .catch((err) => {
        console.error("❌", err);
        alert("Không thể tải dữ liệu người dùng.");
        navigate("/admin/users");
      });
  }, [id, navigate, token]);

  const handleChange = (e) => {
    setForm({ ...form, [e.target.name]: e.target.value });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError("");

    try {
      const res = await fetch(`http://localhost:8000/api/admin/users/${id}`, {
        method: "PUT",
        headers: {
          "Content-Type": "application/json",
          Accept: "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify(form),
      });

      if (!res.ok) throw new Error("Lỗi khi cập nhật người dùng");

      setMessage("✅ Cập nhật người dùng thành công");
      setTimeout(() => {
        setMessage("");
        navigate("/admin/users");
      }, 1500);
    } catch (err) {
      setError("❌ Không thể cập nhật người dùng.");
    }
  };

  return (
    <div className="max-w-xl mx-auto p-6 bg-white shadow-md rounded-md">
      <h1 className="text-2xl font-semibold mb-4">🛠 Sửa người dùng</h1>

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
          placeholder="Mật khẩu mới (nếu đổi)"
          value={form.password}
          onChange={handleChange}
          className="w-full p-2 border rounded"
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
          className="w-full py-2 bg-blue-600 text-white rounded hover:bg-blue-700"
        >
          💾 Lưu thay đổi
        </button>
      </form>
    </div>
  );
}