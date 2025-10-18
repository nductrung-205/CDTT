// admin/AdminImages.js
import React, { useState, useEffect, useCallback } from "react";
import AdminLayout from "../../../components/AdminLayout"; // Giả sử bạn có AdminLayout
import { uploadImage, getAdminImages } from "../../../api"; // Import các hàm API

function AdminImages() {
  const [selectedFile, setSelectedFile] = useState(null);
  const [currentUploadImageUrl, setCurrentUploadImageUrl] = useState(""); // URL của ảnh vừa tải lên
  const [allImages, setAllImages] = useState([]); // Danh sách tất cả ảnh từ backend
  const [loadingUpload, setLoadingUpload] = useState(false);
  const [loadingImages, setLoadingImages] = useState(false);
  const [uploadError, setUploadError] = useState("");
  const [fetchError, setFetchError] = useState("");
  const [uploadSuccessMessage, setUploadSuccessMessage] = useState("");

  const fetchImages = useCallback(async () => {
    setLoadingImages(true);
    setFetchError("");
    try {
      const response = await getAdminImages();
      setAllImages(response.data);
    } catch (err) {
      console.error("Lỗi khi tải danh sách ảnh:", err);
      setFetchError(
        err.response?.data?.message || "Không thể tải danh sách ảnh."
      );
    } finally {
      setLoadingImages(false);
    }
  }, []);

  useEffect(() => {
    fetchImages();
  }, [fetchImages]);

  const handleFileChange = (event) => {
    setSelectedFile(event.target.files[0]);
    setUploadError("");
    setUploadSuccessMessage("");
    setCurrentUploadImageUrl("");
  };

  const handleUpload = async () => {
    if (!selectedFile) {
      setUploadError("Vui lòng chọn một file ảnh để tải lên.");
      return;
    }

    setLoadingUpload(true);
    setUploadError("");
    setUploadSuccessMessage("");

    try {
      const response = await uploadImage(selectedFile);
      const newImageUrl = response.data.image_url;
      setCurrentUploadImageUrl(newImageUrl);
      setUploadSuccessMessage("Ảnh đã được tải lên Cloudinary thành công!");
      // Thêm ảnh mới vào danh sách hiện có và tải lại
      // Lưu ý: Nếu backend của bạn trả về đủ thông tin, bạn có thể thêm trực tiếp
      // Nếu không, cần fetch lại toàn bộ danh sách
      fetchImages();

    } catch (err) {
      console.error("Lỗi tải ảnh:", err);
      setUploadError(
        err.response?.data?.message ||
          "Có lỗi xảy ra khi tải ảnh lên. Vui lòng thử lại."
      );
    } finally {
      setLoadingUpload(false);
      setSelectedFile(null); // Xóa file đã chọn sau khi tải lên
      document.getElementById("image-upload-input").value = ""; // Xóa input file
    }
  };

  return (
    <AdminLayout>
      <div className="container mx-auto p-4">
        <h1 className="text-3xl font-bold mb-6">Quản lý Hình ảnh</h1>

        {/* Phần tải ảnh mới */}
        <div className="bg-white shadow-md rounded-lg p-6 mb-8">
          <h2 className="text-2xl font-semibold mb-4">Tải ảnh mới</h2>
          <div className="mb-4">
            <input
              type="file"
              id="image-upload-input"
              accept="image/*"
              onChange={handleFileChange}
              className="block w-full text-sm text-gray-500
                file:mr-4 file:py-2 file:px-4
                file:rounded-full file:border-0
                file:text-sm file:font-semibold
                file:bg-indigo-50 file:text-indigo-700
                hover:file:bg-indigo-100"
            />
          </div>

          <button
            onClick={handleUpload}
            disabled={!selectedFile || loadingUpload}
            className="w-full bg-indigo-600 hover:bg-indigo-700 text-white font-bold py-2 px-4 rounded-md
              focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:ring-offset-2
              disabled:opacity-50 disabled:cursor-not-allowed"
          >
            {loadingUpload ? "Đang tải lên..." : "Tải ảnh lên Cloudinary"}
          </button>

          {uploadError && <p className="text-red-600 mt-3">{uploadError}</p>}
          {uploadSuccessMessage && <p className="text-green-600 mt-3">{uploadSuccessMessage}</p>}

          {currentUploadImageUrl && (
            <div className="mt-4 text-center">
              <p className="font-semibold mb-2">Ảnh vừa tải lên:</p>
              <img
                src={currentUploadImageUrl}
                alt="Uploaded"
                className="max-w-full h-auto rounded-lg shadow-sm border border-gray-200"
              />
              <p className="text-sm text-gray-600 break-all mt-2">{currentUploadImageUrl}</p>
            </div>
          )}
        </div>

        {/* Phần hiển thị danh sách ảnh đã tải lên */}
        <div className="bg-white shadow-md rounded-lg p-6">
          <h2 className="text-2xl font-semibold mb-4">Thư viện ảnh</h2>
          {loadingImages && <p>Đang tải danh sách ảnh...</p>}
          {fetchError && <p className="text-red-600">{fetchError}</p>}
          {!loadingImages && allImages.length === 0 && !fetchError && (
            <p>Chưa có ảnh nào được tải lên.</p>
          )}

          <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
            {allImages.map((image) => (
              <div key={image.id} className="border rounded-lg overflow-hidden shadow-sm">
                <img
                  src={image.url}
                  alt={`Image ${image.id}`}
                  className="w-full h-48 object-cover"
                />
                <div className="p-2 text-sm text-gray-600 break-words">
                  <p className="font-semibold">ID: {image.id}</p>
                  <p>URL: <a href={image.url} target="_blank" rel="noopener noreferrer" className="text-blue-500 hover:underline">Xem</a></p>
                  {/* Có thể thêm nút xóa ảnh ở đây */}
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </AdminLayout>
  );
}

export default AdminImages;