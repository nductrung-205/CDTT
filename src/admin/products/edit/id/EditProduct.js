import React, { useEffect, useState } from "react";
import { useParams, useNavigate } from "react-router-dom";

export default function EditProduct() {
  const { id } = useParams();
  const navigate = useNavigate();

  const [form, setForm] = useState({
    name: "",
    price: "",
    category_id: "",
    description: "",
    stock: "",
    status: "available",
  });

  const [imagePreview, setImagePreview] = useState(null);
  const [imageFile, setImageFile] = useState(null);
  const [currentImageUrl, setCurrentImageUrl] = useState("");
  const [categories, setCategories] = useState([]);
  const [message, setMessage] = useState("");

  useEffect(() => {
    const token = localStorage.getItem("token");

    fetch(`https://food-delivery-backend-1-nyzt.onrender.com/api/admin/products/${id}`, {
      headers: {
        Authorization: `Bearer ${token}`,
        Accept: "application/json",
      },
    })
      .then(async (res) => {
        if (!res.ok) {
          throw new Error("Không thể lấy dữ liệu sản phẩm");
        }
        const data = await res.json();

        setForm({
          name: data.name || "",
          price: data.price || "",
          category_id: data.category_id || "",
          description: data.description || "",
          stock: data.stock?.toString() || "", // đảm bảo là chuỗi
          status: data.status || "available",
        });
        setCurrentImageUrl(data.image_url || "");
      })
      .catch((err) => {
        console.error("❌ Lỗi khi lấy sản phẩm:", err);
        alert("Không thể tải dữ liệu sản phẩm. Vui lòng thử lại.");
        navigate("/admin/products");
      });

    fetch("https://food-delivery-backend-1-nyzt.onrender.com/api/categories")
      .then((res) => res.json())
      .then((data) => setCategories(data));
  }, [id, navigate]);


  const handleChange = (e) => {
    setForm({ ...form, [e.target.name]: e.target.value });
  };

  const handleImageChange = (e) => {
    const file = e.target.files[0];
    if (!file) return;

    const validTypes = ["image/jpeg", "image/png", "image/jpg", "image/webp", "image/jfif"];
    if (!validTypes.includes(file.type)) {
      alert("❌ Chỉ chấp nhận ảnh JPG, PNG hoặc WEBP.");
      return;
    }

    if (file.size > 2 * 1024 * 1024) {
      alert("❌ Kích thước ảnh tối đa là 2MB.");
      return;
    }

    setImageFile(file);
    setImagePreview(URL.createObjectURL(file));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    const formData = new FormData();
    formData.append("_method", "PUT");
    formData.append("name", form.name);
    formData.append("price", form.price);
    formData.append("category_id", form.category_id);
    formData.append("description", form.description);
    formData.append("stock", form.stock);
    formData.append("status", form.status);
    if (imageFile) {
      formData.append("image", imageFile);
    }

    const token = localStorage.getItem("token");

    const res = await fetch(`https://food-delivery-backend-1-nyzt.onrender.com/api/admin/products/${id}`, {
      method: "POST",
      headers: {
        Authorization: `Bearer ${token}`,
        Accept: "application/json",
      },
      body: formData,
    });

    if (res.ok) {
      setMessage("✅ Cập nhật sản phẩm thành công");
      setTimeout(() => {
        setMessage("");
        navigate("/admin/products");
      }, 1500);
    } else {
      alert("❌ Lỗi khi cập nhật sản phẩm.");
    }
  };

  return (
    <div className="max-w-2xl mx-auto p-6 bg-white shadow-md rounded-md">
      <div className="flex justify-between items-center mb-6">
        <h1 className="text-2xl font-semibold text-gray-800">🛠 Sửa sản phẩm</h1>
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

      <form onSubmit={handleSubmit} className="space-y-4">
        <div>
          <label className="block text-sm font-medium text-gray-700">Tên sản phẩm</label>
          <input
            type="text"
            name="name"
            value={form.name}
            onChange={handleChange}
            className="mt-1 w-full p-2 border rounded-md"
            required
          />
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700">Giá (₫)</label>
          <input
            type="number"
            name="price"
            value={form.price}
            onChange={handleChange}
            className="mt-1 w-full p-2 border rounded-md"
            required
          />
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700">Danh mục</label>
          <select
            name="category_id"
            value={form.category_id}
            onChange={handleChange}
            className="mt-1 w-full p-2 border rounded-md"
          >
            <option value="">-- Chọn danh mục --</option>
            {categories.map((cat) => (
              <option key={cat.id} value={cat.id}>
                {cat.name}
              </option>
            ))}
          </select>
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700">Số lượng tồn kho</label>
          <input
            type="number"
            name="stock"
            value={form.stock}
            onChange={handleChange}
            className="mt-1 w-full p-2 border rounded-md"
          />
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700">Trạng thái</label>
          <select
            name="status"
            value={form.status}
            onChange={handleChange}
            className="mt-1 w-full p-2 border rounded-md"
          >
            <option value="available">Còn hàng</option>
            <option value="unavailable">Hết hàng</option>
          </select>
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700">Ảnh sản phẩm</label>
          {currentImageUrl && (
            <div className="mb-2">
              <span className="text-xs bg-gray-200 px-2 py-1 rounded-full mr-2">Ảnh hiện tại</span>
              <img src={currentImageUrl} alt="Ảnh hiện tại" className="w-full h-auto rounded shadow" />
            </div>
          )}
          {imagePreview && (
            <div className="mb-2">
              <span className="text-xs bg-blue-200 px-2 py-1 rounded-full mr-2">Ảnh mới</span>
              <img src={imagePreview} alt="Ảnh mới" className="w-full h-auto rounded shadow" />
            </div>
          )}
          <input
            type="file"
            accept="image/*"
            onChange={handleImageChange}
            className="mt-1 w-full p-2 border rounded-md"
          />
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700">Mô tả</label>
          <textarea
            name="description"
            value={form.description}
            onChange={handleChange}
            rows="3"
            className="mt-1 w-full p-2 border rounded-md"
          />
        </div>

        <button
          type="submit"
          className="w-full py-2 bg-blue-600 text-white font-semibold rounded-md hover:bg-blue-700"
        >
          💾 Lưu thay đổi
        </button>
      </form>
    </div>
  );
}