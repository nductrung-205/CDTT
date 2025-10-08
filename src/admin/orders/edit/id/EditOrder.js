import React, { useEffect, useState } from "react";
import { useParams, useNavigate } from "react-router-dom";

export default function EditOrder() {
  const { id } = useParams();
  const navigate = useNavigate();
  const [order, setOrder] = useState(null);
  const [status, setStatus] = useState("pending");
  const [message, setMessage] = useState("");
  const token = localStorage.getItem("token");

  useEffect(() => {
    fetch(`http://localhost:8000/api/admin/orders/${id}`, {
      headers: {
        Authorization: `Bearer ${token}`,
        Accept: "application/json",
      },
    })
      .then((res) => res.json())
      .then((data) => {
        setOrder(data);
        setStatus(data.status);
      });
  }, [id, token]);

  const handleSubmit = async (e) => {
    e.preventDefault();

    try {
      const res = await fetch(`http://localhost:8000/api/admin/orders/${id}`, {
        method: "PUT",
        headers: {
          "Content-Type": "application/json",
          Accept: "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({ status }),
      });

      if (!res.ok) throw new Error("Lỗi khi cập nhật đơn hàng");

      setMessage("✅ Cập nhật đơn hàng thành công");
      setTimeout(() => {
        setMessage("");
        navigate("/admin/orders");
      }, 1500);
    } catch (err) {
      alert("❌ Không thể cập nhật đơn hàng.");
    }
  };

  if (!order) return <p className="p-6">Đang tải đơn hàng...</p>;

  return (
    <div className="max-w-xl mx-auto p-6 bg-white shadow-md rounded-md">
      <h1 className="text-2xl font-semibold mb-4">🛠 Sửa đơn hàng #{order.id}</h1>

      {message && <div className="mb-4 text-green-700">{message}</div>}

      <form onSubmit={handleSubmit} className="space-y-4">
        <p><strong>Khách hàng:</strong> {order.user?.fullname || "Không rõ"}</p>

        <p><strong>Tổng tiền:</strong> {order.total_price ? order.total_price.toLocaleString() : "0"} ₫</p>

        <label className="block font-medium">Trạng thái</label>
        <select
          value={status}
          onChange={(e) => setStatus(e.target.value)}
          className="w-full p-2 border rounded"
        >
          <option value="pending">Chờ xử lý</option>
          <option value="confirmed">Đã xác nhận</option>
          <option value="delivered">Đã giao</option>
          <option value="cancelled">Đã hủy</option>
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