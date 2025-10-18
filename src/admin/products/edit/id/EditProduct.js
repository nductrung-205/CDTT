// admin/products/edit/id/EditProduct.js
import React, { useState, useEffect } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { getProductDetail, getCategories, updateProduct, uploadImage } from "../../../api";
import AdminLayout from "../../../components/AdminLayout";

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

  const [imageFile, setImageFile] = useState(null);
  const [imagePreview, setImagePreview] = useState(null);
  const [currentImageUrl, setCurrentImageUrl] = useState("");
  const [finalImageUrl, setFinalImageUrl] = useState("");

  const [categories, setCategories] = useState([]);
  const [message, setMessage] = useState("");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);
  const [imageUploading, setImageUploading] = useState(false);

  useEffect(() => {
    const fetchData = async () => {
      setLoading(true);
      setError("");
      try {
        const productResponse = await getProductDetail(id);
        const productData = productResponse.data;

        setForm({
          name: productData.name || "",
          price: productData.price?.toString() || "",
          category_id: productData.category_id?.toString() || "",
          description: productData.description || "",
          stock: productData.stock?.toString() || "",
          status: productData.status || "available",
        });
        setCurrentImageUrl(productData.image || "");
        setFinalImageUrl(productData.image || "");

        const categoriesResponse = await getCategories();
        setCategories(categoriesResponse.data);
      } catch (err) {
        console.error("Lỗi khi tải dữ liệu:", err);
        setError("Không thể tải dữ liệu sản phẩm.");
        setTimeout(() => navigate("/admin/products"), 2000);
      } finally {
        setLoading(false);
      }
    };
    fetchData();
  }, [id, navigate]);

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
      setMessage("✅ Ảnh mới đã được tải lên Cloudinary thành công!");
      setImagePreview(null);
      setTimeout(() => setMessage(""), 3000);
    } catch (err) {
      console.error("Lỗi tải ảnh:", err);
      setError(err.response?.data?.message || "❌ Lỗi khi tải ảnh lên Cloudinary.");
    } finally {
      setImageUploading(false);
    }
  };

  const handleRemoveCurrentImage = () => {
    setCurrentImageUrl("");
    setFinalImageUrl("");
  };

  const handleRemoveNewImagePreview = () => {
    setImageFile(null);
    setImagePreview(null);
    setFinalImageUrl(currentImageUrl);
    document.getElementById("image-upload-input").value = "";
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError("");
    setMessage("");

    if (!finalImageUrl) {
      setError("❌ Vui lòng có ảnh sản phẩm.");
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
      await updateProduct(id, productData);
      setMessage("✅ Cập nhật sản phẩm thành công");
      setTimeout(() => {
        navigate("/admin/products");
      }, 1500);
    } catch (err) {
      console.error("Lỗi khi cập nhật:", err);
      setError(err.response?.data?.message || "❌ Lỗi khi cập nhật sản phẩm.");
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
                🛠 Sửa Sản phẩm
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

          {loading && !form.name ? (
            <div className="text-center text-gray-600 py-12">Đang tải dữ liệu...</div>
          ) : (
            <form onSubmit={handleSubmit}>
              <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                {/* Left Column - Ảnh hiện tại */}
                <div className="space-y-6">
                  <div className="bg-white rounded-xl shadow-lg p-6">
                    <h3 className="text-lg font-bold text-gray-800 mb-4">Ảnh sản phẩm</h3>
                    
                    {currentImageUrl && (
                      <div className="mb-6">
                        <div className="bg-gray-50 rounded-lg p-4 border-2 border-gray-200">
                          <span className="inline-block bg-blue-100 text-blue-800 text-xs font-semibold px-3 py-1 rounded-full mb-3">
                            Ảnh hiện tại
                          </span>
                          <div className="relative">
                            <img
                              src={currentImageUrl}
                              alt="Current"
                              className="w-full h-64 object-cover rounded-lg shadow-md"
                            />
                            <button
                              type="button"
                              onClick={handleRemoveCurrentImage}
                              className="absolute -top-2 -right-2 bg-red-500 hover:bg-red-600 text-white rounded-full px-3 py-1 shadow-lg transition-colors text-sm"
                            >
                              ❌ Xóa ảnh
                            </button>
                          </div>
                        </div>
                      </div>
                    )}

                    {/* File Input */}
                    <div className="space-y-4">
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

                      {/* Preview ảnh mới */}
                      {imagePreview && (
                        <div className="bg-blue-50 rounded-lg p-4 border-2 border-blue-200">
                          <span className="inline-block bg-blue-200 text-blue-800 text-xs font-semibold px-3 py-1 rounded-full mb-3">
                            Preview
                          </span>
                          <div className="relative">
                            <img
                              src={imagePreview}
                              alt="Preview"
                              className="w-full h-64 object-cover rounded-lg shadow-md"
                            />
                            <button
                              type="button"
                              onClick={handleRemoveNewImagePreview}
                              className="absolute -top-2 -right-2 bg-red-500 hover:bg-red-600 text-white rounded-full px-3 py-1 shadow-lg transition-colors text-sm"
                            >
                              ❌ Xóa ảnh hiện tại
                            </button>
                          </div>
                        </div>
                      )}

                      {/* Upload Button */}
                      <button
                        type="button"
                        onClick={handleUploadImageToCloudinary}
                        disabled={!imageFile || imageUploading}
                        className="w-full py-3 bg-blue-500 hover:bg-blue-600 text-white font-semibold rounded-lg shadow-lg transition-all disabled:opacity-50 disabled:cursor-not-allowed"
                      >
                        {imageUploading ? "⏳ Đang tải ảnh lên..." : "☁️ Tải ảnh mới lên Cloudinary"}
                      </button>

                      {/* Final URL Info */}
                      {finalImageUrl && (
                        <div className="bg-green-50 border border-green-200 rounded-lg p-3">
                          <p className="text-sm text-green-700 font-medium mb-1">
                            Ảnh cuối cùng sẽ lưu:
                          </p>
                          <a
                            href={finalImageUrl}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="text-xs text-blue-600 hover:underline break-all"
                          >
                            {finalImageUrl.substring(0, 60)}...
                          </a>
                        </div>
                      )}
                    </div>
                  </div>
                </div>

                {/* Right Column - Form Fields */}
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
                      className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                      required
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
                      <option value="">-- Chọn danh mục --</option>
                      {categories.map((cat) => (
                        <option key={cat.id} value={cat.id}>
                          {cat.name}
                        </option>
                      ))}
                    </select>
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
                        className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                        required
                        min="0"
                        step="1000"
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
                      Số lượng tồn kho:
                    </label>
                    <input
                      type="number"
                      name="stock"
                      value={form.stock}
                      onChange={handleChange}
                      className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                      required
                      min="0"
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-semibold text-gray-700 mb-2">
                      Trạng thái:
                    </label>
                    <div className="flex gap-2">
                      <input
                        type="text"
                        value={form.status === 'available' ? 'Còn hàng' : 'Hết hàng'}
                        readOnly
                        className="flex-1 px-4 py-2 bg-gray-100 border border-gray-300 rounded-lg"
                      />
                      <input
                        type="text"
                        value={form.status === 'available' ? 'Còn hàng' : 'Hết hàng'}
                        readOnly
                        className="flex-1 px-4 py-2 bg-gray-100 border border-gray-300 rounded-lg"
                      />
                    </div>
                  </div>

                  <div>
                    <label className="block text-sm font-semibold text-gray-700 mb-2">
                      Ảnh sản phẩm
                    </label>
                    <div className="space-y-2 text-sm text-gray-600">
                      <p>• Nhấm tải ảnh lên đến):</p>
                      <p>• Dùng = [Tioga_ImageJS]:</p>
                      <p>• Nơi mà cũng hỗ trợ không có thể của làm</p>
                    </div>
                  </div>

                  <button
                    type="submit"
                    disabled={loading || imageUploading || !finalImageUrl}
                    className="w-full py-3 bg-green-600 hover:bg-green-700 text-white font-bold rounded-lg shadow-lg transition-all disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2"
                  >
                    <span>💾</span>
                    {loading ? "Đang lưu thay đổi..." : "Lưu thay đổi"}
                  </button>
                </div>
              </div>
            </form>
          )}
        </div>
      </div>
    </AdminLayout>
  );
}