import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";

export default function AddOrder() {
  const [products, setProducts] = useState([]);
  const [items, setItems] = useState([]);
  const [paymentMethod, setPaymentMethod] = useState("COD");
  const [message, setMessage] = useState("");
  const [error, setError] = useState("");
  const navigate = useNavigate();
  const token = localStorage.getItem("token");

  useEffect(() => {
    fetch("http://localhost:8000/api/products")
      .then((res) => res.json())
      .then((data) => setProducts(data));
  }, []);

  const handleAddItem = () => {
    setItems([...items, { product_id: "", quantity: 1, price: 0 }]);
  };

  const handleItemChange = (index, field, value) => {
    const updated = [...items];
    updated[index][field] = value;
    setItems(updated);
  };

  const calculateTotal = () =>
    items.reduce((sum, item) => sum + item.quantity * item.price, 0);

  const handleSubmit = async (e) => {
    e.preventDefault();
    const total_price = calculateTotal();

    try {
      const res = await fetch("http://localhost:8000/api/orders", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Accept: "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({ items, total_price, payment_method: paymentMethod }),
      });

      if (!res.ok) throw new Error("Lỗi khi tạo đơn hàng");

      setMessage("✅ Tạo đơn hàng thành công");
      setTimeout(() => {
        setMessage("");
        navigate("/admin/orders");
      }, 1500);
    } catch (err) {
      setError("❌ Không thể tạo đơn hàng.");
    }
  };

  return (
    <div className="max-w-3xl mx-auto p-6 bg-white shadow-md rounded-md">
      <h1 className="text-2xl font-semibold mb-4">➕ Tạo đơn hàng</h1>

      {message && <div className="mb-4 text-green-700">{message}</div>}
      {error && <div className="mb-4 text-red-700">{error}</div>}

      <form onSubmit={handleSubmit} className="space-y-4">
        {items.map((item, index) => (
          <div key={index} className="grid grid-cols-3 gap-4">
            <select
              value={item.product_id}
              onChange={(e) => handleItemChange(index, "product_id", e.target.value)}
              className="p-2 border rounded"
              required
            >
              <option value="">-- Chọn sản phẩm --</option>
              {products.map((p) => (
                <option key={p.id} value={p.id}>
                  {p.name}
                </option>
              ))}
            </select>
            <input
              type="number"
              value={item.quantity}
              onChange={(e) => handleItemChange(index, "quantity", parseInt(e.target.value))}
              className="p-2 border rounded"
              placeholder="Số lượng"
              required
            />
            <input
              type="number"
              value={item.price}
              onChange={(e) => handleItemChange(index, "price", parseFloat(e.target.value))}
              className="p-2 border rounded"
              placeholder="Giá"
              required
            />
          </div>
        ))}

        <button
          type="button"
          onClick={handleAddItem}
          className="px-4 py-2 bg-gray-200 rounded hover:bg-gray-300"
        >
          ➕ Thêm sản phẩm
        </button>

        <div>
          <label className="block font-medium">Phương thức thanh toán</label>
          <select
            value={paymentMethod}
            onChange={(e) => setPaymentMethod(e.target.value)}
            className="w-full p-2 border rounded"
          >
            <option value="COD">COD</option>
            <option value="Banking">Chuyển khoản</option>
          </select>
        </div>

        <p className="font-semibold">Tổng tiền: {calculateTotal().toLocaleString()} ₫</p>

        <button
          type="submit"
          className="w-full py-2 bg-blue-600 text-white rounded hover:bg-blue-700"
        >
          💾 Tạo đơn hàng
        </button>
      </form>
    </div>
  );
}