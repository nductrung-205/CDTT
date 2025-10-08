import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";

export default function AddProduct() {
  const [form, setForm] = useState({
    name: "",
    price: "",
    category_id: "",
    description: "",
    stock: "",
    status: "available",
  });

  const [imageFile, setImageFile] = useState(null);
  const [imagePreview, setImagePreview] = useState(null);
  const [categories, setCategories] = useState([]);
  const [message, setMessage] = useState("");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);
  const navigate = useNavigate();
  const token = localStorage.getItem("token");

  useEffect(() => {
    fetch("http://localhost:8000/api/categories")
      .then((res) => res.json())
      .then((data) => setCategories(data));
  }, []);

  const handleChange = (e) => {
    setForm({ ...form, [e.target.name]: e.target.value });
  };

  const handleImageChange = (e) => {
    const file = e.target.files[0];
    if (!file) return;

    const validTypes = ["image/jpeg", "image/png", "image/jpg"];
    if (!validTypes.includes(file.type)) {
      setError("❌ Chỉ chấp nhận ảnh JPG hoặc PNG.");
      return;
    }
    if (file.size > 2 * 1024 * 1024) {
      setError("❌ Kích thước ảnh tối đa là 2MB.");
      return;
    }

    setImageFile(file);
    setImagePreview(URL.createObjectURL(file));
    setError("");
  };

  const handleRemoveImage = () => {
    setImageFile(null);
    setImagePreview(null);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError("");

    const formData = new FormData();
    formData.append("name", form.name);
    formData.append("price", form.price);
    formData.append("category_id", form.category_id);
    formData.append("description", form.description);
    formData.append("stock", form.stock);
    formData.append("status", form.status);
    if (imageFile) {
      formData.append("image", imageFile);
    }

    try {
      const res = await fetch("http://localhost:8000/api/admin/products", {
        method: "POST",
        body: formData,
        headers: {
          Accept: "application/json",
          Authorization: `Bearer ${token}`,
        },
      });

      if (!res.ok) throw new Error("Lỗi khi thêm sản phẩm");

      setMessage("✅ Thêm sản phẩm thành công");
      setTimeout(() => {
        setMessage("");
        navigate("/admin/products");
      }, 1500);
    } catch (err) {
      setError("❌ Không thể thêm sản phẩm. Vui lòng thử lại.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="max-w-2xl mx-auto p-6 bg-white shadow-md rounded-md">
      <div className="flex justify-between items-center mb-6">
        <h1 className="text-2xl font-semibold text-gray-800">➕ Thêm sản phẩm</h1>
        <button
          onClick={() => navigate("/admin/products")}
          className="text-sm px-3 py-1 bg-gray-600 text-white rounded hover:bg-gray-700"
        >
          ← Quay lại
        </button>
      </div>

      {message && (
        <div className="mb-4 p-3 bg-green-100 text-green-700 rounded shadow-sm">
          {message}
        </div>
      )}
      {error && (
        <div className="mb-4 p-3 bg-red-100 text-red-700 rounded shadow-sm">
          {error}
        </div>
      )}

      <form onSubmit={handleSubmit} className="space-y-4">
        <input
          type="text"
          name="name"
          placeholder="Tên sản phẩm"
          value={form.name}
          onChange={handleChange}
          className="w-full p-2 border rounded"
          required
        />
        <input
          type="number"
          name="price"
          placeholder="Giá"
          value={form.price}
          onChange={handleChange}
          className="w-full p-2 border rounded"
          required
        />
        <select
          name="category_id"
          value={form.category_id}
          onChange={handleChange}
          className="w-full p-2 border rounded"
        >
          <option value="">-- Chọn danh mục --</option>
          {categories.map((cat) => (
            <option key={cat.id} value={cat.id}>
              {cat.name}
            </option>
          ))}
        </select>

        <input
          type="number"
          name="stock"
          placeholder="Số lượng tồn kho"
          value={form.stock}
          onChange={handleChange}
          className="w-full p-2 border rounded"
        />

        <select
          name="status"
          value={form.status}
          onChange={handleChange}
          className="w-full p-2 border rounded"
        >
          <option value="available">Còn hàng</option>
          <option value="unavailable">Hết hàng</option>
        </select>

        <div className="space-y-2">
          <label className="block font-medium">Ảnh sản phẩm</label>
          <input
            type="file"
            accept="image/*"
            onChange={handleImageChange}
            className="w-full p-2 border rounded"
          />
          {imagePreview && (
            <div className="relative">
              <img
                src={imagePreview}
                alt="Preview"
                className="w-full h-auto rounded shadow"
              />
              <button
                type="button"
                onClick={handleRemoveImage}
                className="absolute top-2 right-2 bg-red-500 text-white px-2 py-1 rounded hover:bg-red-600 text-xs"
              >
                ❌ Xóa ảnh
              </button>
            </div>
          )}
        </div>

        <textarea
          name="description"
          placeholder="Mô tả"
          value={form.description}
          onChange={handleChange}
          rows="3"
          className="w-full p-2 border rounded"
        />

        <button
          type="submit"
          disabled={loading}
          className="w-full py-2 bg-blue-600 text-white font-semibold rounded hover:bg-blue-700 disabled:opacity-50"
        >
          {loading ? "Đang xử lý..." : "💾 Thêm sản phẩm"}
        </button>
      </form>
    </div>
  );
}