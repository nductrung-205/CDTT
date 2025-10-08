import React, { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { Search, Plus, Edit, Trash2, Eye, Package } from "lucide-react";

export default function Products() {
  const [products, setProducts] = useState([]);
  const [filteredProducts, setFilteredProducts] = useState([]);
  const [message, setMessage] = useState("");
  const [searchTerm, setSearchTerm] = useState("");
  const [filterCategory, setFilterCategory] = useState("all");
  const [categories, setCategories] = useState([]);
  const [loading, setLoading] = useState(true);
  const navigate = useNavigate();

  const fetchProducts = async () => {
    try {
      setLoading(true);
      const res = await fetch("http://localhost:8000/api/products");
      const data = await res.json();
      setProducts(data);
      setFilteredProducts(data);
      const categoryList = [...new Set(data.map(p => p.category?.name).filter(Boolean))];
      setCategories(categoryList);
    } catch (err) {
      console.error("Error fetching products:", err);
      setProducts([]);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchProducts();
  }, []);

  useEffect(() => {
    let result = [...products];

    if (searchTerm) {
      result = result.filter((p) =>
        p.name.toLowerCase().includes(searchTerm.toLowerCase())
      );
    }

    if (filterCategory !== "all") {
      result = result.filter((p) => p.category?.name === filterCategory);
    }

    setFilteredProducts(result);
  }, [searchTerm, filterCategory, products]);

  const handleDelete = async (id) => {
  if (window.confirm("Bạn có chắc chắn muốn xóa sản phẩm này?")) {
    try {
      const token = localStorage.getItem("token");

      const res = await fetch(`http://localhost:8000/api/admin/products/${id}`, {
        method: "DELETE",
        headers: {
          Authorization: `Bearer ${token}`,
          Accept: "application/json",
        },
      });

      if (!res.ok) throw new Error("Xóa thất bại");

      fetchProducts();
      setMessage("✅ Xóa sản phẩm thành công!");
      setTimeout(() => setMessage(""), 3000);
    } catch (err) {
      console.error("❌ Lỗi khi xóa sản phẩm:", err);
      alert("Không thể xóa sản phẩm. Vui lòng kiểm tra quyền hoặc đăng nhập lại.");
    }
  }
};


  const formatCurrency = (amount) => {
    return new Intl.NumberFormat("vi-VN").format(amount);
  };

  return (
    <div className="min-h-screen bg-gray-50 p-6">
      <div className="max-w-7xl mx-auto">
      
        <div className="flex justify-between items-start mb-6">
          <div>
            <h1 className="text-3xl font-bold text-gray-800 mb-2">Quản lý sản phẩm</h1>
            <p className="text-gray-600">Quản lý món ăn và thực đơn</p>
          </div>
          <button
            onClick={() => navigate("/admin/products/add")}
            className="px-4 py-2.5 bg-gradient-to-r from-orange-500 to-red-500 text-white rounded-lg hover:shadow-lg transition flex items-center gap-2"
          >
            <Plus size={18} />
            Thêm sản phẩm
          </button>
        </div>

        
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-6">
          <div className="bg-gradient-to-br from-blue-500 to-cyan-600 rounded-xl shadow-lg p-6 text-white">
            <p className="text-sm opacity-90 mb-1">Tổng sản phẩm</p>
            <p className="text-3xl font-bold">{products.length}</p>
          </div>
          <div className="bg-gradient-to-br from-green-500 to-emerald-600 rounded-xl shadow-lg p-6 text-white">
            <p className="text-sm opacity-90 mb-1">Còn hàng</p>
            <p className="text-3xl font-bold">{products.filter(p => p.stock > 0).length}</p>
          </div>
          <div className="bg-gradient-to-br from-red-500 to-pink-600 rounded-xl shadow-lg p-6 text-white">
            <p className="text-sm opacity-90 mb-1">Hết hàng</p>
            <p className="text-3xl font-bold">{products.filter(p => p.stock === 0).length}</p>
          </div>
          <div className="bg-gradient-to-br from-purple-500 to-indigo-600 rounded-xl shadow-lg p-6 text-white">
            <p className="text-sm opacity-90 mb-1">Danh mục</p>
            <p className="text-3xl font-bold">{categories.length}</p>
          </div>
        </div>

        
        <div className="flex items-center gap-4 mb-6">
          <div className="relative flex items-center">
            <Search size={20} className="absolute left-3 text-gray-500" />
            <input
              type="text"
              placeholder="Tìm kiếm sản phẩm"
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="pl-10 py-2 rounded-lg border border-gray-300 w-64"
            />
          </div>
          <div className="relative">
            <select
              value={filterCategory}
              onChange={(e) => setFilterCategory(e.target.value)}
              className="py-2 px-4 rounded-lg border border-gray-300"
            >
              <option value="all">Tất cả danh mục</option>
              {categories.map((category, idx) => (
                <option key={idx} value={category}>
                  {category}
                </option>
              ))}
            </select>
          </div>
        </div>

        {/* Products Table */}
        <div className="overflow-x-auto bg-white rounded-lg shadow-md">
          <table className="w-full table-auto text-left">
            <thead className="bg-gray-100">
              <tr>
                <th className="py-3 px-4">Tên sản phẩm</th>
                <th className="py-3 px-4">Danh mục</th>
                <th className="py-3 px-4">Giá</th>
                <th className="py-3 px-4">Số lượng</th>
                <th className="py-3 px-4">Trạng thái</th>
                <th className="py-3 px-4">Hành động</th>
              </tr>
            </thead>
            <tbody>
              {filteredProducts.map((product) => (
                <tr key={product.id}>
                  <td className="py-3 px-4">{product.name}</td>
                  <td className="py-3 px-4">{product.category?.name || 'Chưa có'}</td>
                  <td className="py-3 px-4">{formatCurrency(product.price)}</td>
                  <td className="py-3 px-4">{product.stock}</td>
                  <td className="py-3 px-4">{product.status}</td>
                  <td className="py-3 px-4 flex items-center gap-2">
                    <button
                      onClick={() => navigate(`/admin/products/${product.id}`)}
                      className="text-blue-600 hover:text-blue-800"
                    >
                      <Eye size={20} />
                    </button>
                    <button
                      onClick={() => navigate(`/admin/products/edit/${product.id}`)}
                      className="text-yellow-600 hover:text-yellow-800"
                    >
                      <Edit size={20} />
                    </button>
                    <button
                      onClick={() => handleDelete(product.id)}
                      className="text-red-600 hover:text-red-800"
                    >
                      <Trash2 size={20} />
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
      <div className="mt-6">
        <button
          onClick={() => (window.location.href = "/admin")}
          className="px-6 py-3 bg-gray-200 text-gray-700 rounded-lg hover:bg-gray-300 transition font-semibold"
        >
          ← Trở về Dashboard
        </button>
      </div>
    </div>
  );
}
