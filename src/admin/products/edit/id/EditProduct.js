// admin/products/edit/id/EditProduct.js
import React, { useState, useEffect } from "react";
import { useParams, useNavigate } from "react-router-dom";
import {
  getProductDetail,
  getCategories,
  updateProduct,
  uploadImage,
} from "../../../api"; // Import từ api.js
import AdminLayout from "../../../components/AdminLayout"; // Giả sử bạn có AdminLayout

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

  const [imageFile, setImageFile] = useState(null); // File ảnh mới được chọn
  const [imagePreview, setImagePreview] = useState(null); // URL tạm thời cho ảnh mới
  const [currentImageUrl, setCurrentImageUrl] = useState(""); // URL của ảnh hiện tại trên Cloudinary (từ DB)
  const [finalImageUrl, setFinalImageUrl] = useState(""); // URL cuối cùng sẽ được lưu (có thể là current hoặc từ ảnh mới)

  const [categories, setCategories] = useState([]);
  const [message, setMessage] = useState("");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);
  const [imageUploading, setImageUploading] = useState(false); // Trạng thái tải ảnh lên Cloudinary riêng

  useEffect(() => {
    const fetchData = async () => {
      setLoading(true);
      setError("");
      try {
        // Lấy chi tiết sản phẩm
        const productResponse = await getProductDetail(id); // Sử dụng hàm từ api.js
        const productData = productResponse.data;

        setForm({
          name: productData.name || "",
          price: productData.price?.toString() || "", // Đảm bảo là string cho input type="number"
          category_id: productData.category_id?.toString() || "", // Đảm bảo là string
          description: productData.description || "",
          stock: productData.stock?.toString() || "", // Đảm bảo là string
          status: productData.status || "available",
        });
        setCurrentImageUrl(productData.image_url || "");
        setFinalImageUrl(productData.image_url || ""); // Mặc định là ảnh hiện tại

        // Lấy danh mục
        const categoriesResponse = await getCategories(); // Sử dụng hàm từ api.js
        setCategories(categoriesResponse.data);
      } catch (err) {
        console.error("Lỗi khi tải dữ liệu sản phẩm hoặc danh mục:", err);
        setError(
          err.response?.data?.message ||
            "Không thể tải dữ liệu sản phẩm. Vui lòng thử lại."
        );
        setTimeout(() => navigate("/admin/products"), 2000); // Điều hướng sau khi hiển thị lỗi
      } finally {
        setLoading(false);
      }
    };
    fetchData();
  }, [id, navigate]);

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
    setFinalImageUrl(""); // Reset final URL nếu chọn ảnh mới (cần tải lên)
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
      setMessage("✅ Ảnh mới đã được tải lên Cloudinary thành công!");
      setImagePreview(null); // Clear preview sau khi tải thành công
    } catch (err) {
      console.error("Lỗi tải ảnh lên Cloudinary:", err);
      setError(err.response?.data?.message || "❌ Lỗi khi tải ảnh lên Cloudinary.");
    } finally {
      setImageUploading(false);
    }
  };

  const handleRemoveCurrentImage = () => {
    setCurrentImageUrl("");
    setFinalImageUrl(""); // Clear final URL nếu xóa ảnh hiện tại
    // Nếu bạn muốn xóa cả file trên Cloudinary, cần một API endpoint riêng
    // Ví dụ: deleteImageFromCloudinary(productData.public_id)
  }

  const handleRemoveNewImagePreview = () => {
    setImageFile(null);
    setImagePreview(null);
    setFinalImageUrl(currentImageUrl); // Trở lại ảnh cũ nếu hủy ảnh mới
    document.getElementById("image-upload-input").value = "";
  }

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError("");
    setMessage("");

    if (!finalImageUrl) {
      setError("Vui lòng tải ảnh sản phẩm lên Cloudinary hoặc đảm bảo có ảnh hiện tại.");
      setLoading(false);
      return;
    }

    // Chuyển category_id thành số nguyên trước khi gửi
    const productData = {
      ...form,
      price: parseFloat(form.price),
      stock: parseInt(form.stock),
      category_id: parseInt(form.category_id),
      image_url: finalImageUrl, // Sử dụng URL ảnh cuối cùng
    };

    try {
      await updateProduct(id, productData); // Sử dụng hàm từ api.js
      setMessage("✅ Cập nhật sản phẩm thành công");
      setTimeout(() => {
        setMessage("");
        navigate("/admin/products");
      }, 1500);
    } catch (err) {
      console.error("Lỗi khi cập nhật sản phẩm:", err);
      setError(err.response?.data?.message || "❌ Lỗi khi cập nhật sản phẩm. Vui lòng thử lại.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <AdminLayout> {/* Sử dụng AdminLayout */}
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
        {error && (
          <div className="mb-4 p-3 bg-red-100 text-red-700 rounded shadow-sm">
            {error}
          </div>
        )}

        {loading && <p className="text-center text-gray-500">Đang tải dữ liệu sản phẩm...</p>}

        {!loading && (
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
                min="0"
                step="0.01"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700">Danh mục</label>
              <select
                name="category_id"
                value={form.category_id}
                onChange={handleChange}
                className="mt-1 w-full p-2 border rounded-md"
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
              <label className="block text-sm font-medium text-gray-700">Số lượng tồn kho</label>
              <input
                type="number"
                name="stock"
                value={form.stock}
                onChange={handleChange}
                className="mt-1 w-full p-2 border rounded-md"
                required
                min="0"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700">Trạng thái</label>
              <select
                name="status"
                value={form.status}
                onChange={handleChange}
                className="mt-1 w-full p-2 border rounded-md"
                required
              >
                <option value="available">Còn hàng</option>
                <option value="unavailable">Hết hàng</option>
              </select>
            </div>

            {/* Phần xử lý ảnh */}
            <div className="space-y-2">
              <label className="block text-sm font-medium text-gray-700">Ảnh sản phẩm</label>

              {/* Hiển thị ảnh hiện tại */}
              {currentImageUrl && (
                <div className="mb-2 p-2 border rounded-md bg-gray-50 flex items-center space-x-4">
                  <img src={currentImageUrl} alt="Ảnh hiện tại" className="w-24 h-24 object-cover rounded shadow" />
                  <div>
                    <span className="text-xs bg-gray-200 px-2 py-1 rounded-full">Ảnh hiện tại</span>
                    <p className="text-sm break-all">{currentImageUrl.substring(0, 50)}...</p>
                    <button
                      type="button"
                      onClick={handleRemoveCurrentImage}
                      className="mt-1 text-red-500 hover:text-red-700 text-xs"
                    >
                      Xóa ảnh hiện tại
                    </button>
                  </div>
                </div>
              )}

              {/* Input chọn ảnh mới */}
              <input
                type="file"
                id="image-upload-input"
                accept="image/*"
                onChange={handleImageChange}
                className="mt-1 w-full p-2 border rounded-md"
              />

              {/* Preview ảnh mới được chọn */}
              {imagePreview && (
                <div className="mt-2 flex items-center space-x-4 p-2 border rounded-md bg-blue-50">
                  <img src={imagePreview} alt="Preview ảnh mới" className="w-24 h-24 object-cover rounded shadow" />
                  <div>
                    <span className="text-xs bg-blue-200 px-2 py-1 rounded-full">Ảnh mới được chọn</span>
                    <button
                      type="button"
                      onClick={handleRemoveNewImagePreview}
                      className="mt-1 text-red-500 hover:text-red-700 text-xs"
                    >
                      Hủy ảnh mới
                    </button>
                  </div>
                </div>
              )}

              {/* Nút tải ảnh lên Cloudinary */}
              <button
                type="button"
                onClick={handleUploadImageToCloudinary}
                disabled={!imageFile || imageUploading}
                className="mt-2 w-full py-2 bg-blue-500 text-white font-semibold rounded hover:bg-blue-600 disabled:opacity-50"
              >
                {imageUploading ? "Đang tải ảnh lên..." : "Tải ảnh mới lên Cloudinary"}
              </button>

              {/* Thông báo URL ảnh cuối cùng */}
              {finalImageUrl && <p className="text-sm text-green-600 mt-1">Ảnh cuối cùng sẽ được lưu: <a href={finalImageUrl} target="_blank" rel="noopener noreferrer" className="underline">{finalImageUrl.substring(0, 50)}...</a></p>}
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700">Mô tả</label>
              <textarea
                name="description"
                value={form.description}
                onChange={handleChange}
                rows="3"
                className="mt-1 w-full p-2 border rounded-md"
                required
              />
            </div>

            <button
              type="submit"
              disabled={loading || imageUploading || !finalImageUrl} // Disable nếu đang tải ảnh hoặc không có URL ảnh cuối cùng
              className="w-full py-2 bg-green-600 text-white font-semibold rounded-md hover:bg-green-700 disabled:opacity-50"
            >
              {loading ? "Đang lưu thay đổi..." : "💾 Lưu thay đổi"}
            </button>
          </form>
        )}
      </div>
    </AdminLayout>
  );
}