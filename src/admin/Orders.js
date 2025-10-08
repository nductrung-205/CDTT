import React, { useEffect, useState } from "react";
import { Eye, Search, Filter, Download, Clock, CheckCircle, XCircle, Truck, Trash2, Edit, Plus } from "lucide-react";
import { getAdminOrders, updateOrderStatus, deleteOrder } from "../api";
import { useNavigate, Link } from "react-router-dom";

export default function Orders() {
  const [orders, setOrders] = useState([]);
  const [filteredOrders, setFilteredOrders] = useState([]);
  const [message, setMessage] = useState("");
  const [filterStatus, setFilterStatus] = useState("all");
  const [searchTerm, setSearchTerm] = useState("");
  const [loading, setLoading] = useState(true);
  const navigate = useNavigate();

  const fetchOrders = async () => {
    try {
      setLoading(true);
      const res = await getAdminOrders();
      setOrders(res.data);
      setFilteredOrders(res.data);
    } catch (err) {
      console.error("Error fetching admin orders:", err);
      setOrders([]);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchOrders();
  }, []);

  useEffect(() => {
    let result = [...orders];

    if (filterStatus !== "all") {
      result = result.filter((o) => o.status === filterStatus);
    }

    if (searchTerm) {
      result = result.filter(
        (o) =>
          o.id.toString().includes(searchTerm) ||
          o.payment_method?.toLowerCase().includes(searchTerm.toLowerCase())
      );
    }

    setFilteredOrders(result);
  }, [filterStatus, searchTerm, orders]);

  const handleStatusChange = async (id, newStatus) => {
    try {
      await updateOrderStatus(id, newStatus);
      fetchOrders();
      setMessage("✅ Cập nhật trạng thái thành công!");
      setTimeout(() => setMessage(""), 3000);
    } catch (err) {
      console.error("Error updating status:", err);
      setMessage("❌ Cập nhật trạng thái thất bại!");
      setTimeout(() => setMessage(""), 3000);
    }
  };

  const handleDelete = async (id) => {
    if (window.confirm("Bạn có chắc chắn muốn xóa đơn hàng này?")) {
      try {
        await deleteOrder(id);
        fetchOrders();
        setMessage("✅ Đã xóa đơn hàng");
        setTimeout(() => setMessage(""), 3000);
      } catch (err) {
        console.error("Error deleting order:", err);
        setMessage("❌ Lỗi khi xóa đơn hàng");
        setTimeout(() => setMessage(""), 3000);
      }
    }
  };

  const getStatusConfig = (status) => {
    const configs = {
      pending: {
        label: "Chờ xử lý",
        color: "bg-yellow-100 text-yellow-800 border-yellow-200",
        icon: <Clock size={14} />,
      },
      confirmed: {
        label: "Đã xác nhận",
        color: "bg-blue-100 text-blue-800 border-blue-200",
        icon: <CheckCircle size={14} />,
      },
      delivered: {
        label: "Đã giao",
        color: "bg-green-100 text-green-800 border-green-200",
        icon: <Truck size={14} />,
      },
      cancelled: {
        label: "Đã hủy",
        color: "bg-red-100 text-red-800 border-red-200",
        icon: <XCircle size={14} />,
      },
    };
    return configs[status] || configs.pending;
  };

  const formatCurrency = (amount) => {
    return new Intl.NumberFormat("vi-VN").format(amount);
  };

  const formatDate = (dateString) => {
    return new Date(dateString).toLocaleString("vi-VN");
  };

  const getStatistics = () => {
    return {
      total: orders.length,
      pending: orders.filter((o) => o.status === "pending").length,
      confirmed: orders.filter((o) => o.status === "confirmed").length,
      delivered: orders.filter((o) => o.status === "delivered").length,
      cancelled: orders.filter((o) => o.status === "cancelled").length,
      totalRevenue: orders
        .filter((o) => o.status === "delivered")
        .reduce((sum, o) => sum + parseFloat(o.total_price), 0),
    };
  };

  const stats = getStatistics();

  return (
    <div className="min-h-screen bg-gray-50 p-6">
      <div className="max-w-7xl mx-auto">
        <div className="flex justify-between items-start mb-6">
          <div>
            <h1 className="text-3xl font-bold text-gray-800 mb-2">Quản lý đơn hàng</h1>
            <p className="text-gray-600">Theo dõi và xử lý đơn hàng từ khách hàng</p>
          </div>
          <button
            onClick={() => navigate("/admin/orders/add")}
            className="px-4 py-2.5 bg-gradient-to-r from-orange-500 to-red-500 text-white rounded-lg hover:shadow-lg transition flex items-center gap-2"
          >
            <Plus size={18} />
            Thêm đơn hàng
          </button>
        </div>


        <div className="grid grid-cols-1 md:grid-cols-5 gap-4 mb-6">
          <StatCard label="Tổng đơn" value={stats.total} color="bg-gradient-to-br from-purple-500 to-pink-600" />
          <StatCard label="Chờ xử lý" value={stats.pending} color="bg-gradient-to-br from-yellow-500 to-orange-600" />
          <StatCard label="Đã xác nhận" value={stats.confirmed} color="bg-gradient-to-br from-blue-500 to-cyan-600" />
          <StatCard label="Đã giao" value={stats.delivered} color="bg-gradient-to-br from-green-500 to-emerald-600" />
          <StatCard label="Doanh thu" value={`${formatCurrency(stats.totalRevenue)}₫`} color="bg-gradient-to-br from-indigo-500 to-purple-600" isRevenue />
        </div>

        {message && (
          <div className="mb-4 p-4 bg-green-50 border border-green-200 text-green-700 rounded-lg flex items-center gap-2">
            <CheckCircle size={20} />
            <span>{message}</span>
          </div>
        )}

        <div className="bg-white rounded-xl shadow-sm p-6 mb-6">
          <div className="flex flex-wrap gap-4">
            <div className="flex-1 min-w-[250px]">
              <div className="relative">
                <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" size={20} />
                <input
                  type="text"
                  placeholder="Tìm theo mã đơn hoặc phương thức thanh toán..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="w-full pl-10 pr-4 py-2.5 border border-gray-300 rounded-lg focus:ring-2 focus:ring-orange-500 focus:border-transparent"
                />
              </div>
            </div>

            <select
              value={filterStatus}
              onChange={(e) => setFilterStatus(e.target.value)}
              className="px-4 py-2.5 border border-gray-300 rounded-lg focus:ring-2 focus:ring-orange-500 focus:border-transparent"
            >
              <option value="all">Tất cả trạng thái</option>
              <option value="pending">Chờ xử lý</option>
              <option value="confirmed">Đã xác nhận</option>
              <option value="delivered">Đã giao</option>
              <option value="cancelled">Đã hủy</option>
            </select>
          </div>
        </div>

        {/* Orders Table */}
        <div className="bg-white rounded-xl shadow-sm overflow-hidden">
          {loading ? (
            <div className="p-12 text-center">
              <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-orange-500 mx-auto"></div>
              <p className="mt-4 text-gray-500">Đang tải...</p>
            </div>
          ) : filteredOrders.length === 0 ? (
            <div className="p-12 text-center">
              <div className="text-6xl mb-4">📦</div>
              <p className="text-gray-500">Không tìm thấy đơn hàng nào</p>
            </div>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead className="bg-gray-50 border-b border-gray-200">
                  <tr>
                    <th className="px-6 py-4 text-left text-xs font-semibold text-gray-600 uppercase">Mã đơn</th>
                    <th className="px-6 py-4 text-left text-xs font-semibold text-gray-600 uppercase">Tổng tiền</th>
                    <th className="px-6 py-4 text-left text-xs font-semibold text-gray-600 uppercase">Thanh toán</th>
                    <th className="px-6 py-4 text-left text-xs font-semibold text-gray-600 uppercase">Trạng thái</th>
                    <th className="px-6 py-4 text-left text-xs font-semibold text-gray-600 uppercase">Ngày đặt</th>
                    <th className="px-6 py-4 text-left text-xs font-semibold text-gray-600 uppercase">Thao tác</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-100">
                  {filteredOrders.map((order) => {
                    const statusConfig = getStatusConfig(order.status);
                    return (
                      <tr key={order.id} className="hover:bg-gray-50 transition">
                        <td className="px-6 py-4 font-bold text-gray-800">#{order.id}</td>
                        <td className="px-6 py-4 font-bold text-orange-600">
                          {formatCurrency(order.total_price)}₫
                        </td>
                        <td className="px-6 py-4 text-sm text-gray-600">
                          {order.payment_method || "N/A"}
                        </td>
                        <td className="px-6 py-4">
                          <select
                            value={order.status}
                            onChange={(e) => handleStatusChange(order.id, e.target.value)}
                            className={`px-3 py-1.5 rounded-lg text-xs font-semibold border ${statusConfig.color} focus:ring-2 focus:ring-orange-500`}
                          >
                            <option value="pending">Chờ xử lý</option>
                            <option value="confirmed">Đã xác nhận</option>
                            <option value="delivered">Đã giao</option>
                            <option value="cancelled">Đã hủy</option>
                          </select>
                        </td>
                        <td className="px-6 py-4 text-sm text-gray-600">
                          {formatDate(order.created_at)}
                        </td>
                        <td className="px-6 py-4">
                          <div className="flex items-center gap-2">
                            <Link
                              to={`/admin/orders/${order.id}`}
                              className="p-2 text-blue-600 hover:bg-blue-50 rounded-lg transition"
                              title="Xem chi tiết"
                            >
                              <Eye size={18} />
                            </Link>
                            <button
                              onClick={() => navigate(`/admin/orders/edit/${order.id}`)}
                              className="p-2 text-yellow-600 hover:bg-yellow-50 rounded-lg transition"
                              title="Sửa đơn hàng"
                            >
                              <Edit size={18} />
                            </button>
                            <button
                              onClick={() => handleDelete(order.id)}
                              className="p-2 text-red-600 hover:bg-red-50 rounded-lg transition"
                              title="Xóa đơn hàng"
                            >
                              <Trash2 size={18} />
                            </button>
                          </div>
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>
          )}
        </div>

        {/* Back Button */}
        <div className="mt-6">
          <button
            onClick={() => navigate("/admin")}
            className="px-6 py-3 bg-gray-200 text-gray-700 rounded-lg hover:bg-gray-300 transition font-semibold"
          >
            ← Trở về Dashboard
          </button>
        </div>
      </div>
    </div>
  );
}

function StatCard({ label, value, color, isRevenue }) {
  return (
    <div className={`${color} rounded-xl shadow-lg p-4 text-white`}>
      <p className="text-xs opacity-90 mb-1">{label}</p>
      <p className={`font-bold ${isRevenue ? "text-lg" : "text-2xl"}`}>{value}</p>
    </div>
  );
}
