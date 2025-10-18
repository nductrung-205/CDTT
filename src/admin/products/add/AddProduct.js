// admin/products/add/AddProduct.js
import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { createProduct, getCategories, uploadImage } from "../../../api"; // Import từ api.js
import AdminLayout from "../../../components/AdminLayout"; // Giả sử bạn có AdminLayout

export default function AddProduct() {
  const [form, setForm] = useState({
    name: "",
    price: "",
    category_id: "", // Sẽ được set sau khi fetch categories
    description: "",
    stock: "",
    status: "available",
  });

  const [imageFile, setImageFile] = useState(null);
  const [imagePreview, setImagePreview] = useState(null); // URL tạm thời cho ảnh preview
  const [finalImageUrl, setFinalImageUrl] = useState(""); // URL cuối cùng từ Cloudinary

  const [categories, setCategories] = useState([]);
  const [message, setMessage] = useState("");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);
  const [imageUploading, setImageUploading] = useState(false); // Trạng thái tải ảnh lên Cloudinary riêng

  const navigate = useNavigate();

  useEffect(() => {
    const fetchCategories = async () => {
      try {
        const response = await getCategories();
        setCategories(response.data);
        if (response.data.length > 0) {
          // Đặt category_id mặc định là ID của danh mục đầu tiên
          setForm((prevForm) => ({
            ...prevForm,
            category_id: response.data[0].id.toString(),
          }));
        }
      } catch (err) {
        console.error("Lỗi khi tải danh mục:", err);
        setError("Không thể tải danh mục.");
      }
    };
    fetchCategories();
  }, []);

  const handleChange = (e) => {
    setForm({ ...form, [e.target.name]: e.target.value });
    setError(""); // Xóa lỗi khi người dùng thay đổi input
  };

  const handleImageChange = (e) => {
    const file = e.target.files[0];
    if (!file) {
      setImageFile(null);
      setImagePreview(null);
      return;
    }

    const validTypes = ["image/jpeg", "image/png", "image/jpg", "image/jfif"];
    if (!validTypes.includes(file.type)) {
      setError("❌ Chỉ chấp nhận ảnh JPG, PNG hoặc JFIF.");
      setImageFile(null);
      setImagePreview(null);
      return;
    }
    if (file.size > 2 * 1024 * 1024) {
      setError("❌ Kích thước ảnh tối đa là 2MB.");
      setImageFile(null);
      setImagePreview(null);
      return;
    }

    setImageFile(file);
    setImagePreview(URL.createObjectURL(file));
    setFinalImageUrl(""); // Reset final URL nếu chọn ảnh mới
    setError("");
  };

  const handleUploadImageToCloudinary = async () => {
    if (!imageFile) {
      setError("Vui lòng chọn một file ảnh để tải lên.");
      return;
    }
    setImageUploading(true);
    setError("");
    setFinalImageUrl(""); // Đảm bảo finalImageUrl trống trong khi tải
    try {
      const response = await uploadImage(imageFile); // Sử dụng hàm từ api.js
      setFinalImageUrl(response.data.image_url);
      setMessage("✅ Ảnh đã được tải lên Cloudinary thành công!");
    } catch (err) {
      console.error("Lỗi tải ảnh lên Cloudinary:", err);
      setError(err.response?.data?.message || "❌ Lỗi khi tải ảnh lên Cloudinary.");
    } finally {
      setImageUploading(false);
    }
  };

  const handleRemoveImage = () => {
    setImageFile(null);
    setImagePreview(null);
    setFinalImageUrl("");
    document.getElementById("image-upload-input").value = ""; // Clear input file
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError("");
    setMessage("");

    if (!finalImageUrl) {
      setError("Vui lòng tải ảnh sản phẩm lên Cloudinary trước khi thêm sản phẩm.");
      setLoading(false);
      return;
    }

    // Chuyển category_id thành số nguyên trước khi gửi
    const productData = {
      ...form,
      price: parseFloat(form.price), // Đảm bảo giá là số
      stock: parseInt(form.stock),   // Đảm bảo tồn kho là số
      category_id: parseInt(form.category_id), // Đảm bảo category_id là số nguyên
      image_url: finalImageUrl, // Sử dụng URL ảnh từ Cloudinary
    };

    try {
      await createProduct(productData); // Sử dụng hàm từ api.js
      setMessage("✅ Thêm sản phẩm thành công");
      // Reset form sau khi thêm thành công
      setForm({
        name: "", price: "", category_id: categories.length > 0 ? categories[0].id.toString() : "",
        description: "", stock: "", status: "available",
      });
      handleRemoveImage(); // Clear image states
      setTimeout(() => {
        setMessage("");
        navigate("/admin/products");
      }, 1500);
    } catch (err) {
      console.error("Lỗi khi thêm sản phẩm:", err);
      setError(err.response?.data?.message || "❌ Không thể thêm sản phẩm. Vui lòng thử lại.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <AdminLayout> {/* Sử dụng AdminLayout */}
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
          <div>
            <label htmlFor="name" className="block text-sm font-medium text-gray-700">Tên sản phẩm</label>
            <input
              type="text"
              name="name"
              id="name"
              placeholder="Tên sản phẩm"
              value={form.name}
              onChange={handleChange}
              className="mt-1 w-full p-2 border rounded"
              required
            />
          </div>

          <div>
            <label htmlFor="price" className="block text-sm font-medium text-gray-700">Giá</label>
            <input
              type="number"
              name="price"
              id="price"
              placeholder="Giá"
              value={form.price}
              onChange={handleChange}
              className="mt-1 w-full p-2 border rounded"
              required
              min="0"
              step="0.01"
            />
          </div>

          <div>
            <label htmlFor="category_id" className="block text-sm font-medium text-gray-700">Danh mục</label>
            <select
              name="category_id"
              id="category_id"
              value={form.category_id}
              onChange={handleChange}
              className="mt-1 w-full p-2 border rounded"
              required
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
            <label htmlFor="stock" className="block text-sm font-medium text-gray-700">Số lượng tồn kho</label>
            <input
              type="number"
              name="stock"
              id="stock"
              placeholder="Số lượng tồn kho"
              value={form.stock}
              onChange={handleChange}
              className="mt-1 w-full p-2 border rounded"
              required
              min="0"
            />
          </div>

          <div>
            <label htmlFor="status" className="block text-sm font-medium text-gray-700">Trạng thái</label>
            <select
              name="status"
              id="status"
              value={form.status}
              onChange={handleChange}
              className="mt-1 w-full p-2 border rounded"
              required
            >
              <option value="available">Còn hàng</option>
              <option value="unavailable">Hết hàng</option>
            </select>
          </div>

          <div className="space-y-2">
            <label className="block font-medium text-gray-700">Ảnh sản phẩm</label>
            <input
              type="file"
              id="image-upload-input"
              accept="image/*"
              onChange={handleImageChange}
              className="w-full p-2 border rounded"
            />
            {imagePreview && (
              <div className="mt-2 flex items-center space-x-2">
                <img
                  src={imagePreview}
                  alt="Preview"
                  className="w-32 h-32 object-cover rounded shadow"
                />
                <button
                  type="button"
                  onClick={handleRemoveImage}
                  className="bg-red-500 text-white px-2 py-1 rounded hover:bg-red-600 text-xs"
                >
                  ❌ Xóa ảnh
                </button>
              </div>
            )}
            <button
              type="button"
              onClick={handleUploadImageToCloudinary}
              disabled={!imageFile || imageUploading}
              className="mt-2 w-full py-2 bg-blue-500 text-white font-semibold rounded hover:bg-blue-600 disabled:opacity-50"
            >
              {imageUploading ? "Đang tải ảnh lên..." : "Tải ảnh lên Cloudinary"}
            </button>
            {finalImageUrl && <p className="text-sm text-green-600 mt-1">Ảnh đã sẵn sàng: <a href={finalImageUrl} target="_blank" rel="noopener noreferrer" className="underline">{finalImageUrl.substring(0, 50)}...</a></p>}
          </div>

          <div>
            <label htmlFor="description" className="block text-sm font-medium text-gray-700">Mô tả</label>
            <textarea
              name="description"
              id="description"
              placeholder="Mô tả"
              value={form.description}
              onChange={handleChange}
              rows="3"
              className="mt-1 w-full p-2 border rounded"
              required
            />
          </div>

          <button
            type="submit"
            disabled={loading || imageUploading || !finalImageUrl} // Disable nếu ảnh chưa tải xong
            className="w-full py-2 bg-green-600 text-white font-semibold rounded hover:bg-green-700 disabled:opacity-50"
          >
            {loading ? "Đang xử lý..." : "💾 Thêm sản phẩm"}
          </button>
        </form>
      </div>
    </AdminLayout>
  );
}