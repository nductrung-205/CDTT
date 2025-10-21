// admin/products/edit/id/EditProduct.js
import React, { useState, useEffect } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { getProductDetail, getCategories, updateProduct, uploadImage } from "../../../api";
import AdminLayout from "../../../components/AdminLayout";

export default function EditProduct() {
  const { id } = useParams();
  const navigate = useNavigate();
  const [form, setForm] = useState({});
  const [imageFile, setImageFile] = useState(null);
  const [imagePreview, setImagePreview] = useState(null);
  const [finalImageUrl, setFinalImageUrl] = useState("");
  const [categories, setCategories] = useState([]);
  const [loading, setLoading] = useState(true);
  const [msg, setMsg] = useState("");
  const [err, setErr] = useState("");

  useEffect(() => {
    (async () => {
      try {
        const [p, c] = await Promise.all([getProductDetail(id), getCategories()]);
        setForm({
          ...p.data,
          price: p.data.price.toString(),
          stock: p.data.stock.toString(),
          category_id: p.data.category_id.toString(),
        });
        setFinalImageUrl(p.data.image);
        setCategories(c.data);
      } catch {
        setErr("Không thể tải dữ liệu.");
      } finally {
        setLoading(false);
      }
    })();
  }, [id]);

  const handleChange = (e) => setForm({ ...form, [e.target.name]: e.target.value });

  const handleUploadImage = async () => {
    if (!imageFile) return;
    try {
      const res = await uploadImage(imageFile);
      setFinalImageUrl(res.data.url);
      setMsg("✅ Ảnh mới đã tải lên!");
    } catch {
      setErr("❌ Lỗi tải ảnh lên Cloudinary.");
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      await updateProduct(id, {
        ...form,
        image: finalImageUrl,
        price: parseFloat(form.price),
        stock: parseInt(form.stock),
        category_id: parseInt(form.category_id),
      });
      setMsg("✅ Cập nhật thành công!");
      setTimeout(() => navigate("/admin/products"), 1500);
    } catch {
      setErr("❌ Lỗi khi cập nhật.");
    }
  };

  if (loading) return <div>Đang tải...</div>;

  return (
    <AdminLayout>
      <div className="min-h-screen bg-gradient-to-br from-blue-200 via-purple-200 to-pink-200 p-8">
        <div className="max-w-6xl mx-auto">

          {/* ✅ HEADER CHUẨN */}
          <div className="bg-white rounded-xl shadow-md mb-6 p-6 flex justify-between items-center">
            <h1 className="text-2xl font-bold text-gray-800 flex items-center gap-2">
              🛠 Sửa Sản phẩm
            </h1>
            <button
              onClick={() => navigate("/admin/products")}
              className="px-4 py-2 bg-gray-100 hover:bg-gray-200 text-gray-700 rounded-lg transition-all flex items-center gap-2"
            >
              ← Quay lại
            </button>
          </div>

          {msg && <div className="bg-green-100 p-4 mb-4 rounded">{msg}</div>}
          {err && <div className="bg-red-100 p-4 mb-4 rounded">{err}</div>}

          <form onSubmit={handleSubmit} className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            <div className="bg-white p-6 rounded-xl shadow-lg space-y-4">
              <input type="text" name="name" value={form.name} onChange={handleChange} className="w-full p-2 border rounded" />
              <select name="category_id" value={form.category_id} onChange={handleChange} className="w-full p-2 border rounded">
                {categories.map((c) => (
                  <option key={c.id} value={c.id}>{c.name}</option>
                ))}
              </select>
              <input type="number" name="price" value={form.price} onChange={handleChange} className="w-full p-2 border rounded" />
              <textarea name="description" value={form.description} onChange={handleChange} className="w-full p-2 border rounded" />
              <button type="submit" className="w-full py-3 bg-green-600 text-white font-bold rounded-lg">
                💾 Lưu thay đổi
              </button>
            </div>

            {/* Ảnh */}
            <div className="bg-white p-6 rounded-xl shadow-lg space-y-4">
              <input type="file" accept="image/*" onChange={(e) => setImageFile(e.target.files[0])} />
              {finalImageUrl && <img src={finalImageUrl} alt="" className="w-full h-64 object-cover rounded" />}
              <button type="button" onClick={handleUploadImage} className="w-full py-3 bg-blue-500 hover:bg-blue-600 text-white font-bold rounded-lg">
                ☁️ Upload ảnh mới
              </button>
            </div>
          </form>
        </div>
      </div>
    </AdminLayout>
  );
}
