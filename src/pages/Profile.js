import React, { useState, useEffect } from "react";
import { Link, useNavigate } from "react-router-dom";
import { useAuth } from "../context/AuthContext";
import { getMyOrders } from "../api";

export default function Profile() {
  const { user, logout, updateUser } = useAuth();
  const navigate = useNavigate();
  const [activeTab, setActiveTab] = useState("info");
  const [orders, setOrders] = useState([]);
  const [loading, setLoading] = useState(false);
  const [showEditModal, setShowEditModal] = useState(false);
  const [showPasswordModal, setShowPasswordModal] = useState(false);
  const [editForm, setEditForm] = useState({
    fullname: user?.fullname || "",
    phone: user?.phone || "",
    address: user?.address || "",
  });
  const [passwordForm, setPasswordForm] = useState({
    current_password: "",
    new_password: "",
    new_password_confirmation: "",
  });
  const [errors, setErrors] = useState({});
  const [successMessage, setSuccessMessage] = useState("");

  useEffect(() => {
    fetchOrders();
  }, []);

  useEffect(() => {
    if (activeTab === "orders") {
      fetchOrders();
    }
  }, [activeTab]);

  const fetchOrders = async () => {
    setLoading(true);
    try {
      const data = await getMyOrders();
      console.log("📦 Orders fetched:", data);
      setOrders(Array.isArray(data) ? data : []);
    } catch (error) {
      console.error("❌ Lỗi tải đơn hàng:", error);
      setOrders([]);
    } finally {
      setLoading(false);
    }
  };

  const handleUpdateProfile = async () => {
    setErrors({});
    setSuccessMessage("");
    
    try {
      const token = localStorage.getItem("token");
      const response = await fetch("https://food-delivery-backend-1-nyzt.onrender.com/update-profile", {
        method: "PUT",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify(editForm),
      });

      const data = await response.json();

      if (!response.ok) {
        setErrors(data.errors || { general: data.message });
        return;
      }

      updateUser(data.user);
      setSuccessMessage("Cập nhật thông tin thành công!");
      setTimeout(() => {
        setShowEditModal(false);
        setSuccessMessage("");
      }, 1500);
    } catch (error) {
      console.error("Error updating profile:", error);
      setErrors({ general: "Có lỗi xảy ra. Vui lòng thử lại!" });
    }
  };

  const handleChangePassword = async () => {
    setErrors({});
    setSuccessMessage("");

    if (!passwordForm.current_password || !passwordForm.new_password || !passwordForm.new_password_confirmation) {
      setErrors({ general: "Vui lòng điền đầy đủ thông tin" });
      return;
    }

    if (passwordForm.new_password !== passwordForm.new_password_confirmation) {
      setErrors({ new_password_confirmation: "Xác nhận mật khẩu không khớp" });
      return;
    }

    if (passwordForm.new_password.length < 6) {
      setErrors({ new_password: "Mật khẩu phải có ít nhất 6 ký tự" });
      return;
    }

    try {
      const token = localStorage.getItem("token");
      const response = await fetch("https://food-delivery-backend-1-nyzt.onrender.com/api/change-password", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify(passwordForm),
      });

      const data = await response.json();

      if (!response.ok) {
        setErrors(data.errors || { general: data.message });
        return;
      }

      setSuccessMessage("Đổi mật khẩu thành công!");
      setPasswordForm({
        current_password: "",
        new_password: "",
        new_password_confirmation: "",
      });
      
      setTimeout(() => {
        setShowPasswordModal(false);
        setSuccessMessage("");
      }, 1500);
    } catch (error) {
      console.error("Error changing password:", error);
      setErrors({ general: "Có lỗi xảy ra. Vui lòng thử lại!" });
    }
  };

  const handleLogout = async () => {
    await logout();
    navigate("/login");
  };

  const roleLabel = user?.role === 0 ? "Quản trị viên" : "Khách hàng";
  const roleColor = user?.role === 0 ? "bg-purple-100 text-purple-800" : "bg-blue-100 text-blue-800";

  const getStatusColor = (status) => {
    const colors = {
      pending: "bg-yellow-100 text-yellow-800",
      confirmed: "bg-blue-100 text-blue-800",
      delivered: "bg-green-100 text-green-800",
      cancelled: "bg-red-100 text-red-800",
    };
    return colors[status] || "bg-gray-100 text-gray-800";
  };

  const getStatusText = (status) => {
    const texts = {
      pending: "Đang chờ",
      confirmed: "Đã xác nhận",
      delivered: "Đã giao",
      cancelled: "Đã hủy",
    };
    return texts[status] || status;
  };

  if (!user) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50">
        <div className="text-center">
          <p className="text-gray-600 mb-4">Bạn chưa đăng nhập</p>
          <button
            onClick={() => navigate("/login")}
            className="px-6 py-2 bg-orange-500 text-white rounded-lg hover:bg-orange-600"
          >
            Đăng nhập ngay
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="bg-white shadow-sm py-4 px-4 mb-6">
        <Link to="/" className="text-orange-600 hover:text-orange-700 font-medium">
          ← Quay lại trang chủ
        </Link>
      </div>

      <div className="max-w-6xl mx-auto px-4 pb-8">
        <div className="bg-gradient-to-r from-orange-500 to-red-500 rounded-lg shadow-lg p-6 mb-6 text-white">
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-4">
              <div className="w-20 h-20 bg-white rounded-full flex items-center justify-center text-orange-500 text-3xl font-bold">
                {user.fullname?.charAt(0).toUpperCase() || "U"}
              </div>
              <div>
                <h1 className="text-2xl font-bold">{user.fullname}</h1>
                <p className="text-orange-100">{user.email}</p>
                <span className={`inline-block mt-2 px-3 py-1 rounded-full text-xs font-semibold ${roleColor}`}>
                  {roleLabel}
                </span>
              </div>
            </div>
            <button
              onClick={handleLogout}
              className="px-4 py-2 bg-white text-orange-500 rounded-lg hover:bg-orange-50 transition font-semibold"
            >
              Đăng xuất
            </button>
          </div>
        </div>

        <div className="bg-white rounded-lg shadow-md mb-6">
          <div className="flex border-b">
            <button
              onClick={() => setActiveTab("info")}
              className={`flex-1 py-4 px-6 text-center font-semibold transition ${
                activeTab === "info"
                  ? "text-orange-500 border-b-2 border-orange-500"
                  : "text-gray-600 hover:text-orange-500"
              }`}
            >
              Thông tin cá nhân
            </button>
            <button
              onClick={() => setActiveTab("orders")}
              className={`flex-1 py-4 px-6 text-center font-semibold transition ${
                activeTab === "orders"
                  ? "text-orange-500 border-b-2 border-orange-500"
                  : "text-gray-600 hover:text-orange-500"
              }`}
            >
              Đơn hàng của tôi
            </button>
            <button
              onClick={() => setActiveTab("settings")}
              className={`flex-1 py-4 px-6 text-center font-semibold transition ${
                activeTab === "settings"
                  ? "text-orange-500 border-b-2 border-orange-500"
                  : "text-gray-600 hover:text-orange-500"
              }`}
            >
              Cài đặt
            </button>
          </div>
        </div>

        <div className="bg-white rounded-lg shadow-md p-6">
          {activeTab === "info" && (
            <div>
              <div className="flex items-center justify-between mb-6">
                <h2 className="text-xl font-bold text-gray-800">Thông tin tài khoản</h2>
                <button
                  onClick={() => {
                    setEditForm({
                      fullname: user.fullname || "",
                      phone: user.phone || "",
                      address: user.address || "",
                    });
                    setShowEditModal(true);
                  }}
                  className="px-4 py-2 bg-orange-500 text-white rounded-lg hover:bg-orange-600 transition"
                >
                  Chỉnh sửa
                </button>
              </div>
              <div className="grid md:grid-cols-2 gap-6">
                <div className="space-y-4">
                  <div className="p-4 bg-gray-50 rounded-lg">
                    <p className="text-sm text-gray-600 mb-1">Họ và tên</p>
                    <p className="text-lg font-semibold text-gray-800">{user.fullname}</p>
                  </div>
                  <div className="p-4 bg-gray-50 rounded-lg">
                    <p className="text-sm text-gray-600 mb-1">Email</p>
                    <p className="text-lg font-semibold text-gray-800">{user.email}</p>
                  </div>
                </div>
                <div className="space-y-4">
                  <div className="p-4 bg-gray-50 rounded-lg">
                    <p className="text-sm text-gray-600 mb-1">Số điện thoại</p>
                    <p className="text-lg font-semibold text-gray-800">
                      {user.phone || "Chưa cập nhật"}
                    </p>
                  </div>
                  <div className="p-4 bg-gray-50 rounded-lg">
                    <p className="text-sm text-gray-600 mb-1">Địa chỉ giao hàng</p>
                    <p className="text-lg font-semibold text-gray-800">
                      {user.address || "Chưa cập nhật"}
                    </p>
                  </div>
                </div>
              </div>

              <div className="grid grid-cols-3 gap-4 mt-8">
                <div className="p-4 bg-gradient-to-br from-green-50 to-green-100 rounded-lg text-center">
                  <p className="text-3xl font-bold text-green-600">{orders.length}</p>
                  <p className="text-sm text-gray-600 mt-1">Tổng đơn hàng</p>
                </div>
                <div className="p-4 bg-gradient-to-br from-blue-50 to-blue-100 rounded-lg text-center">
                  <p className="text-3xl font-bold text-blue-600">
                    {orders.filter((o) => o.status === "delivered").length}
                  </p>
                  <p className="text-sm text-gray-600 mt-1">Đã giao hàng</p>
                </div>
                <div className="p-4 bg-gradient-to-br from-yellow-50 to-yellow-100 rounded-lg text-center">
                  <p className="text-3xl font-bold text-yellow-600">
                    {orders.filter((o) => o.status === "pending").length}
                  </p>
                  <p className="text-sm text-gray-600 mt-1">Đang chờ</p>
                </div>
              </div>
            </div>
          )}

          {activeTab === "orders" && (
            <div>
              <h2 className="text-xl font-bold text-gray-800 mb-6">Lịch sử đơn hàng</h2>
              {loading ? (
                <div className="text-center py-12">
                  <div className="inline-block animate-spin rounded-full h-12 w-12 border-b-2 border-orange-500 mb-4"></div>
                  <p className="text-gray-500">Đang tải...</p>
                </div>
              ) : orders.length === 0 ? (
                <div className="text-center py-12">
                  <p className="text-gray-500 mb-4">Bạn chưa có đơn hàng nào</p>
                  <button
                    onClick={() => navigate("/menu")}
                    className="px-6 py-2 bg-orange-500 text-white rounded-lg hover:bg-orange-600"
                  >
                    Đặt món ngay
                  </button>
                </div>
              ) : (
                <div className="space-y-4">
                  {orders.map((order) => (
                    <div
                      key={order.id}
                      className="border rounded-lg p-4 hover:shadow-md transition cursor-pointer"
                      onClick={() => navigate(`/orders/${order.id}`)}
                    >
                      <div className="flex items-center justify-between mb-3">
                        <div>
                          <p className="font-semibold text-gray-800">Đơn hàng #{order.id}</p>
                          <p className="text-sm text-gray-500">
                            {new Date(order.created_at).toLocaleDateString("vi-VN")}
                          </p>
                        </div>
                        <span
                          className={`px-3 py-1 rounded-full text-xs font-semibold ${getStatusColor(
                            order.status
                          )}`}
                        >
                          {getStatusText(order.status)}
                        </span>
                      </div>
                      <div className="flex items-center justify-between">
                        <p className="text-sm text-gray-600">
                          {order.order_items?.length || 0} món • Tổng:{" "}
                          <span className="font-semibold text-orange-600">
                            {order.total_price?.toLocaleString()}₫
                          </span>
                        </p>
                        <button className="text-orange-500 hover:text-orange-600 text-sm font-semibold">
                          Xem chi tiết
                        </button>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>
          )}

          {activeTab === "settings" && (
            <div>
              <h2 className="text-xl font-bold text-gray-800 mb-6">Cài đặt tài khoản</h2>
              <div className="space-y-4">
                <div 
                  onClick={() => setShowPasswordModal(true)}
                  className="p-4 border rounded-lg hover:bg-gray-50 cursor-pointer flex items-center justify-between"
                >
                  <div>
                    <p className="font-semibold text-gray-800">Đổi mật khẩu</p>
                    <p className="text-sm text-gray-600">Cập nhật mật khẩu của bạn</p>
                  </div>
                  <span className="text-gray-400">→</span>
                </div>
                <div className="p-4 border rounded-lg hover:bg-gray-50 cursor-pointer flex items-center justify-between">
                  <div>
                    <p className="font-semibold text-gray-800">Thông báo</p>
                    <p className="text-sm text-gray-600">Quản lý thông báo email & push</p>
                  </div>
                  <span className="text-gray-400">→</span>
                </div>
                <div className="p-4 border rounded-lg hover:bg-gray-50 cursor-pointer flex items-center justify-between">
                  <div>
                    <p className="font-semibold text-gray-800">Bảo mật</p>
                    <p className="text-sm text-gray-600">Xác thực 2 bước & thiết lập bảo mật</p>
                  </div>
                  <span className="text-gray-400">→</span>
                </div>
              </div>
            </div>
          )}
        </div>
      </div>

      {showEditModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-lg p-6 max-w-md w-full">
            <h3 className="text-xl font-bold mb-4">Chỉnh sửa thông tin</h3>
            
            {errors.general && (
              <div className="mb-4 p-3 bg-red-50 border border-red-200 rounded-lg text-red-600 text-sm">
                {errors.general}
              </div>
            )}
            
            {successMessage && (
              <div className="mb-4 p-3 bg-green-50 border border-green-200 rounded-lg text-green-600 text-sm">
                {successMessage}
              </div>
            )}

            <div className="space-y-4">
              <div>
                <label className="block text-sm font-semibold text-gray-700 mb-2">Họ và tên</label>
                <input
                  type="text"
                  value={editForm.fullname}
                  onChange={(e) => setEditForm({ ...editForm, fullname: e.target.value })}
                  className="w-full px-4 py-2 border rounded-lg focus:ring-2 focus:ring-orange-500"
                />
                {errors.fullname && <p className="text-red-500 text-xs mt-1">{errors.fullname[0]}</p>}
              </div>
              <div>
                <label className="block text-sm font-semibold text-gray-700 mb-2">
                  Số điện thoại
                </label>
                <input
                  type="tel"
                  value={editForm.phone}
                  onChange={(e) => setEditForm({ ...editForm, phone: e.target.value })}
                  className="w-full px-4 py-2 border rounded-lg focus:ring-2 focus:ring-orange-500"
                />
                {errors.phone && <p className="text-red-500 text-xs mt-1">{errors.phone[0]}</p>}
              </div>
              <div>
                <label className="block text-sm font-semibold text-gray-700 mb-2">
                  Địa chỉ giao hàng
                </label>
                <textarea
                  value={editForm.address}
                  onChange={(e) => setEditForm({ ...editForm, address: e.target.value })}
                  className="w-full px-4 py-2 border rounded-lg focus:ring-2 focus:ring-orange-500"
                  rows="3"
                />
                {errors.address && <p className="text-red-500 text-xs mt-1">{errors.address[0]}</p>}
              </div>
            </div>
            <div className="flex space-x-3 mt-6">
              <button
                onClick={() => {
                  setShowEditModal(false);
                  setErrors({});
                  setSuccessMessage("");
                }}
                className="flex-1 px-4 py-2 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50"
              >
                Hủy
              </button>
              <button
                onClick={handleUpdateProfile}
                className="flex-1 px-4 py-2 bg-orange-500 text-white rounded-lg hover:bg-orange-600"
              >
                Lưu thay đổi
              </button>
            </div>
          </div>
        </div>
      )}

      {showPasswordModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-lg p-6 max-w-md w-full">
            <h3 className="text-xl font-bold mb-4">Đổi mật khẩu</h3>
            
            {errors.general && (
              <div className="mb-4 p-3 bg-red-50 border border-red-200 rounded-lg text-red-600 text-sm">
                {errors.general}
              </div>
            )}
            
            {successMessage && (
              <div className="mb-4 p-3 bg-green-50 border border-green-200 rounded-lg text-green-600 text-sm">
                {successMessage}
              </div>
            )}

            <div className="space-y-4">
              <div>
                <label className="block text-sm font-semibold text-gray-700 mb-2">
                  Mật khẩu hiện tại
                </label>
                <input
                  type="password"
                  value={passwordForm.current_password}
                  onChange={(e) => setPasswordForm({ ...passwordForm, current_password: e.target.value })}
                  className="w-full px-4 py-2 border rounded-lg focus:ring-2 focus:ring-orange-500"
                  placeholder="Nhập mật khẩu hiện tại"
                />
                {errors.current_password && (
                  <p className="text-red-500 text-xs mt-1">{errors.current_password[0]}</p>
                )}
              </div>
              <div>
                <label className="block text-sm font-semibold text-gray-700 mb-2">
                  Mật khẩu mới
                </label>
                <input
                  type="password"
                  value={passwordForm.new_password}
                  onChange={(e) => setPasswordForm({ ...passwordForm, new_password: e.target.value })}
                  className="w-full px-4 py-2 border rounded-lg focus:ring-2 focus:ring-orange-500"
                  placeholder="Nhập mật khẩu mới (tối thiểu 6 ký tự)"
                />
                {errors.new_password && (
                  <p className="text-red-500 text-xs mt-1">{errors.new_password[0] || errors.new_password}</p>
                )}
              </div>
              <div>
                <label className="block text-sm font-semibold text-gray-700 mb-2">
                  Xác nhận mật khẩu mới
                </label>
                <input
                  type="password"
                  value={passwordForm.new_password_confirmation}
                  onChange={(e) => setPasswordForm({ ...passwordForm, new_password_confirmation: e.target.value })}
                  className="w-full px-4 py-2 border rounded-lg focus:ring-2 focus:ring-orange-500"
                  placeholder="Nhập lại mật khẩu mới"
                />
                {errors.new_password_confirmation && (
                  <p className="text-red-500 text-xs mt-1">{errors.new_password_confirmation[0] || errors.new_password_confirmation}</p>
                )}
              </div>
            </div>
            <div className="flex space-x-3 mt-6">
              <button
                onClick={() => {
                  setShowPasswordModal(false);
                  setPasswordForm({
                    current_password: "",
                    new_password: "",
                    new_password_confirmation: "",
                  });
                  setErrors({});
                  setSuccessMessage("");
                }}
                className="flex-1 px-4 py-2 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50"
              >
                Hủy
              </button>
              <button
                onClick={handleChangePassword}
                className="flex-1 px-4 py-2 bg-orange-500 text-white rounded-lg hover:bg-orange-600"
              >
                Đổi mật khẩu
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}