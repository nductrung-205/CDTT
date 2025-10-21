// admin/products/add/AddProduct.js
import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { createProduct, getCategories, uploadImage } from "../../../api";
import AdminLayout from "../../../components/AdminLayout";

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
  const [finalImageUrl, setFinalImageUrl] = useState("");

  const [categories, setCategories] = useState([]);
  const [message, setMessage] = useState("");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);
  const [imageUploading, setImageUploading] = useState(false);

  const navigate = useNavigate();

  useEffect(() => {
    const fetchCategories = async () => {
      try {
        const response = await getCategories();
        setCategories(response.data);
        if (response.data.length > 0) {
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
    setError("");
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
    setFinalImageUrl("");
    setError("");
  };

  const handleUploadImageToCloudinary = async () => {
    if (!imageFile) {
      setError("Vui lòng chọn một file ảnh để tải lên.");
      return;
    }
    setImageUploading(true);
    setError("");
    setFinalImageUrl("");
    try {
      const response = await uploadImage(imageFile);
      setFinalImageUrl(response.data.image_url);
      setFinalImageUrl(response.data.url);
      setMessage("✅ Ảnh đã được tải lên Cloudinary thành công!");
      setTimeout(() => setMessage(""), 3000);
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
    document.getElementById("image-upload-input").value = "";
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError("");
    setMessage("");

    if (!finalImageUrl) {
      setError("❌ Vui lòng tải ảnh sản phẩm lên Cloudinary trước khi thêm sản phẩm.");
      setLoading(false);
      return;
    }

    const productData = {
      ...form,
      price: parseFloat(form.price),
      stock: parseInt(form.stock),
      category_id: parseInt(form.category_id),
      image: finalImageUrl,
    };

    try {
      await createProduct(productData);
      setMessage("✅ Thêm sản phẩm thành công");
      setTimeout(() => {
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
    <AdminLayout>
      <div className="min-h-screen bg-gradient-to-br from-blue-200 via-purple-200 to-pink-200 p-8">
        <div className="max-w-6xl mx-auto">
          {/* Header */}
          <div className="bg-white rounded-xl shadow-lg p-6 mb-6">
            <div className="flex justify-between items-center">
              <h1 className="text-3xl font-bold text-gray-800 flex items-center gap-2">
                ➕ Thêm Sản phẩm
              </h1>
              <button
                onClick={() => navigate("/admin/products")}
                className="px-4 py-2 bg-gray-100 hover:bg-gray-200 rounded-lg transition-colors flex items-center gap-2"
              >
                ← Quay lại
              </button>
            </div>
          </div>

          {/* Messages */}
          {message && (
            <div className="bg-green-100 border-l-4 border-green-500 text-green-700 p-4 mb-4 rounded-lg">
              {message}
            </div>
          )}
          {error && (
            <div className="bg-red-100 border-l-4 border-red-500 text-red-700 p-4 mb-4 rounded-lg">
              {error}
            </div>
          )}

          {/* Main Form */}
          <form onSubmit={handleSubmit}>
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
              {/* Left Column - Form Fields */}
              <div className="bg-white rounded-xl shadow-lg p-6 space-y-4">
                <div>
                  <label className="block text-sm font-semibold text-gray-700 mb-2">
                    Tên sản phẩm:
                  </label>
                  <input
                    type="text"
                    name="name"
                    value={form.name}
                    onChange={handleChange}
                    placeholder="Bát cơm gà Teriyaki"
                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                    required
                  />
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-semibold text-gray-700 mb-2">
                      Giá
                    </label>
                    <input
                      type="number"
                      name="price"
                      value={form.price}
                      onChange={handleChange}
                      placeholder="125000"
                      className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                      required
                      min="0"
                      step="1000"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-semibold text-gray-700 mb-2">
                      Danh mục:
                    </label>
                    <select
                      name="category_id"
                      value={form.category_id}
                      onChange={handleChange}
                      className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                      required
                    >
                      <option value="">Đồ ăn chính</option>
                      {categories.map((cat) => (
                        <option key={cat.id} value={cat.id}>
                          {cat.name}
                        </option>
                      ))}
                    </select>
                  </div>
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-semibold text-gray-700 mb-2">
                      Số lượng tồn kho:
                    </label>
                    <input
                      type="number"
                      name="stock"
                      value={form.stock}
                      onChange={handleChange}
                      placeholder="50"
                      className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                      required
                      min="0"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-semibold text-gray-700 mb-2">
                      Trạng thái:
                    </label>
                    <select
                      name="status"
                      value={form.status}
                      onChange={handleChange}
                      className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                      required
                    >
                      <option value="available">Còn hàng</option>
                      <option value="unavailable">Hết hàng</option>
                    </select>
                  </div>
                </div>

                <div>
                  <label className="block text-sm font-semibold text-gray-700 mb-2">
                    Mô tả
                  </label>
                  <textarea
                    name="description"
                    value={form.description}
                    onChange={handleChange}
                    rows="4"
                    placeholder="Mô tả sản phẩm..."
                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent resize-none"
                    required
                  />
                </div>

                <button
                  type="submit"
                  disabled={loading || imageUploading || !finalImageUrl}
                  className="w-full py-3 bg-green-600 hover:bg-green-700 text-white font-bold rounded-lg shadow-lg transition-all disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2"
                >
                  <span>💾</span>
                  {loading ? "Đang xử lý..." : "Thêm sản phẩm"}
                </button>
              </div>

              {/* Right Column - Image Upload */}
              <div className="space-y-6">
                {/* Image Preview Card */}
                <div className="bg-white rounded-xl shadow-lg p-6">
                  <h3 className="text-lg font-bold text-gray-800 mb-4">Ảnh sản phẩm</h3>

                  <div className="space-y-4">
                    {/* File Input */}
                    <div className="relative">
                      <input
                        type="file"
                        id="image-upload-input"
                        accept="image/*"
                        onChange={handleImageChange}
                        className="hidden"
                      />
                      <label
                        htmlFor="image-upload-input"
                        className="flex items-center justify-center w-full px-4 py-3 bg-gray-100 hover:bg-gray-200 border-2 border-dashed border-gray-300 rounded-lg cursor-pointer transition-colors"
                      >
                        <span className="text-gray-600">📁 Chọn tệp</span>
                      </label>
                    </div>

                    {/* Image Preview */}
                    {imagePreview && (
                      <div className="relative">
                        <div className="flex items-center justify-center bg-gray-50 rounded-lg p-4 border-2 border-gray-200">
                          <img
                            src={imagePreview}
                            alt="Preview"
                            className="w-48 h-48 object-cover rounded-lg shadow-md"
                          />
                        </div>
                        <button
                          type="button"
                          onClick={handleRemoveImage}
                          className="absolute -top-2 -right-2 bg-red-500 hover:bg-red-600 text-white rounded-full p-2 shadow-lg transition-colors"
                        >
                          ❌ Xóa ảnh
                        </button>
                      </div>
                    )}

                    {/* Upload Button */}
                    <button
                      type="button"
                      onClick={handleUploadImageToCloudinary}
                      disabled={!imageFile || imageUploading}
                      className="w-full py-3 bg-blue-500 hover:bg-blue-600 text-white font-semibold rounded-lg shadow-lg transition-all disabled:opacity-50 disabled:cursor-not-allowed"
                    >
                      {imageUploading ? "⏳ Đang tải ảnh lên..." : "☁️ Tải ảnh lên Cloudinary"}
                    </button>

                    {/* Success Message */}
                    {finalImageUrl && (
                      <div className="bg-green-50 border border-green-200 rounded-lg p-3">
                        <p className="text-sm text-green-700 font-medium">
                          ✅ Ảnh đã sẵn sàng
                        </p>
                        <a
                          href={finalImageUrl}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="text-xs text-blue-600 hover:underline break-all"
                        >
                          {finalImageUrl.substring(0, 50)}...
                        </a>
                      </div>
                    )}
                  </div>
                </div>

                {/* Product Preview Card */}
                {finalImageUrl && (
                  <div className="bg-white rounded-xl shadow-lg p-6">
                    <h3 className="text-lg font-bold text-gray-800 mb-4">Xem trước sản phẩm</h3>
                    <div className="bg-gradient-to-br from-blue-50 to-purple-50 rounded-lg p-4">
                      <img
                        src={finalImageUrl}
                        alt="Product preview"
                        className="w-full h-64 object-cover rounded-lg shadow-md mb-3"
                      />
                      <h4 className="font-bold text-gray-800">{form.name || "Tên sản phẩm"}</h4>
                      <p className="text-lg font-semibold text-green-600">
                        {form.price ? `${parseInt(form.price).toLocaleString('vi-VN')}₫` : "0₫"}
                      </p>
                    </div>
                  </div>
                )}
              </div>
            </div>
          </form>
        </div>
      </div>
    </AdminLayout>
  );
}