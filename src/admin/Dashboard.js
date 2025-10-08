import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import {
  ShoppingCart, Package, Users, TrendingUp,
  DollarSign, Clock, CheckCircle, AlertCircle,
  Eye, Bell, Menu, X, LogOut
} from "lucide-react";
import { getAdminOrders, getProducts, getUsers } from "../api";

export default function Dashboard() {
  const navigate = useNavigate();
  const [sidebarOpen, setSidebarOpen] = useState(true);
  const [loading, setLoading] = useState(true);
  const [stats, setStats] = useState({
    totalRevenue: 0,
    totalOrders: 0,
    totalProducts: 0,
    totalUsers: 0,
    pendingOrders: 0,
    completedOrders: 0,
    deliveredOrders: 0,
  });

  const [recentOrders, setRecentOrders] = useState([]);
  const [topProducts, setTopProducts] = useState([]);
  const [user, setUser] = useState(null);

  useEffect(() => {
  
    const token = localStorage.getItem("token");
    const userData = JSON.parse(localStorage.getItem("user") || "{}");

    if (!token || userData.role !== 0) {
      navigate("/login");
      return;
    }

    setUser(userData);
    fetchDashboardData();
  }, [navigate]);

  const fetchDashboardData = async () => {
    try {
      setLoading(true);

      const ordersResponse = await getAdminOrders();
      console.log("📦 Orders Response:", ordersResponse);

      const orders = Array.isArray(ordersResponse.data) ? ordersResponse.data : [];
      console.log("📦 Orders Array:", orders);

      const productsResponse = await getProducts();
      const products = Array.isArray(productsResponse.data) ? productsResponse.data : [];

      const usersResponse = await getUsers();
      const users = Array.isArray(usersResponse.data) ? usersResponse.data : [];

    
      const totalRevenue = orders
        .filter(o => {
          const isValid = o.status === "delivered" ;
          console.log(`Order #${o.id}: ${o.total_price}đ - Status: ${o.status} - Count: ${isValid}`);
          return isValid;
        })
        .reduce((sum, order) => {
          const price = parseFloat(order.total_price) || 0;
          return sum + price;
        }, 0);

      console.log("💰 Total Revenue:", totalRevenue);

      const pendingOrders = orders.filter(o => o.status === "pending").length;
      const confirmedOrders = orders.filter(o => o.status === "confirmed").length;
      const deliveredOrders = orders.filter(o => o.status === "delivered").length;

      setStats({
        totalRevenue: isNaN(totalRevenue) ? 0 : totalRevenue,
        totalOrders: orders.length,
        totalProducts: products.length,
        totalUsers: users.length,
        pendingOrders,
        confirmedOrders,
        deliveredOrders,
      });


      const sortedOrders = [...orders]
        .sort((a, b) => new Date(b.created_at) - new Date(a.created_at))
        .slice(0, 5)
        .map(order => ({
          id: order.id,
          customer_name: order.user?.fullname || "Khách hàng",
          total: order.total_price,
          status: order.status,
          created_at: order.created_at,
        }));
      setRecentOrders(sortedOrders);

      const productSales = {};
      orders.forEach(order => {
        order.order_items?.forEach(item => {
          const productId = item.product_id;
          if (!productSales[productId]) {
            productSales[productId] = {
              id: productId,
              name: item.product?.name || "Sản phẩm",
              price: item.product?.price || 0,
              sold: 0,
              image: item.product?.image,
            };
          }
          productSales[productId].sold += item.quantity;
        });
      });

      const topProductsList = Object.values(productSales)
        .sort((a, b) => b.sold - a.sold)
        .slice(0, 5);

      setTopProducts(topProductsList);

    } catch (error) {
      console.error("❌ Error fetching dashboard data:", error);
      
      setStats({
        totalRevenue: 0,
        totalOrders: 0,
        totalProducts: 0,
        totalUsers: 0,
        pendingOrders: 0,
        confirmedOrders: 0,
        deliveredOrders: 0,
      });
    } finally {
      setLoading(false);
    }
  };

  const handleLogout = () => {
    if (window.confirm("Bạn có chắc chắn muốn đăng xuất?")) {
      localStorage.removeItem("token");
      localStorage.removeItem("user");
      navigate("/login");
    }
  };

  const formatCurrency = (amount) => {
    return new Intl.NumberFormat('vi-VN', {
      style: 'currency',
      currency: 'VND'
    }).format(amount);
  };

  const getStatusColor = (status) => {
    const colors = {
      pending: 'bg-yellow-100 text-yellow-800',
      confirmed: 'bg-blue-100 text-blue-800',
      delivered: 'bg-green-100 text-green-800',
      cancelled: 'bg-red-100 text-red-800',
    };
    return colors[status] || 'bg-gray-100 text-gray-800';
  };

  const getStatusText = (status) => {
    const texts = {
      pending: 'Đang chờ',
      confirmed: 'Đã xác nhận',
      delivered: 'Đã giao',
      cancelled: 'Đã hủy',
    };
    return texts[status] || status;
  };

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50">
        <div className="text-center">
          <div className="animate-spin rounded-full h-16 w-16 border-b-2 border-orange-500 mx-auto mb-4"></div>
          <p className="text-gray-600">Đang tải dữ liệu...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="flex min-h-screen bg-gray-50">
      {/* Sidebar */}
      <aside className={`${sidebarOpen ? 'w-64' : 'w-20'} bg-gradient-to-b from-orange-600 to-red-600 text-white transition-all duration-300 shadow-xl`}>
        <div className="p-4 flex items-center justify-between border-b border-white/20">
          {sidebarOpen && (
            <div className="flex items-center space-x-2">
              <div className="w-10 h-10 bg-white rounded-lg flex items-center justify-center">
                <span className="text-2xl">🍜</span>
              </div>
              <span className="text-xl font-bold">FoodAdmin</span>
            </div>
          )}
          <button
            onClick={() => setSidebarOpen(!sidebarOpen)}
            className="p-2 hover:bg-white/10 rounded-lg transition"
          >
            {sidebarOpen ? <X size={20} /> : <Menu size={20} />}
          </button>
        </div>

        <nav className="p-4 space-y-2">
          <NavItem
            icon={<TrendingUp size={20} />}
            label="Dashboard"
            active
            collapsed={!sidebarOpen}
            onClick={() => navigate("/admin")}
          />
          <NavItem
            icon={<Package size={20} />}
            label="Sản phẩm"
            collapsed={!sidebarOpen}
            onClick={() => navigate("/admin/products")}
          />
          <NavItem
            icon={<ShoppingCart size={20} />}
            label="Đơn hàng"
            collapsed={!sidebarOpen}
            onClick={() => navigate("/admin/orders")}
          />
          <NavItem
            icon={<Users size={20} />}
            label="Người dùng"
            collapsed={!sidebarOpen}
            onClick={() => navigate("/admin/users")}
          />
        </nav>

        {/* Logout Button */}
        <div className="absolute bottom-4 left-0 right-0 px-4">
          <button
            onClick={handleLogout}
            className="w-full flex items-center space-x-3 px-4 py-3 bg-white/10 hover:bg-white/20 rounded-lg transition text-white"
          >
            <LogOut size={20} />
            {sidebarOpen && <span className="text-sm font-semibold">Đăng xuất</span>}
          </button>
        </div>
      </aside>

      {/* Main Content */}
      <main className="flex-1 overflow-auto">
        {/* Top Bar */}
        <header className="bg-white shadow-sm sticky top-0 z-10">
          <div className="px-6 py-4 flex items-center justify-between">
            <div>
              <h1 className="text-2xl font-bold text-gray-800">Dashboard</h1>
              <p className="text-sm text-gray-500">Tổng quan hoạt động kinh doanh</p>
            </div>
            <div className="flex items-center space-x-4">
              <button className="p-2 hover:bg-gray-100 rounded-lg relative">
                <Bell size={20} />
                {stats.pendingOrders > 0 && (
                  <span className="absolute top-1 right-1 w-5 h-5 bg-red-500 rounded-full flex items-center justify-center text-white text-xs font-bold">
                    {stats.pendingOrders}
                  </span>
                )}
              </button>
              <div className="flex items-center space-x-3">
                <div className="w-10 h-10 bg-orange-500 rounded-full flex items-center justify-center text-white font-bold">
                  {user?.fullname?.charAt(0).toUpperCase() || "A"}
                </div>
                <div>
                  <p className="text-sm font-semibold">{user?.fullname || "Admin User"}</p>
                  <p className="text-xs text-gray-500">Quản trị viên</p>
                </div>
              </div>
            </div>
          </div>
        </header>

        <div className="p-6 space-y-6">
          {/* Stats Cards */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
            <StatsCard
              title="Tổng doanh thu"
              value={formatCurrency(stats.totalRevenue)}
              icon={<DollarSign />}
              color="bg-gradient-to-br from-green-500 to-emerald-600"
              trend="+12.5%"
            />
            <StatsCard
              title="Đơn hàng"
              value={stats.totalOrders}
              icon={<ShoppingCart />}
              color="bg-gradient-to-br from-blue-500 to-cyan-600"
              trend="+8.2%"
            />
            <StatsCard
              title="Sản phẩm"
              value={stats.totalProducts}
              icon={<Package />}
              color="bg-gradient-to-br from-purple-500 to-pink-600"
            />
            <StatsCard
              title="Khách hàng"
              value={stats.totalUsers}
              icon={<Users />}
              color="bg-gradient-to-br from-orange-500 to-red-600"
              trend="+15.3%"
            />
          </div>

          {/* Quick Stats */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            <QuickStat
              icon={<Clock className="text-yellow-600" />}
              label="Chờ xử lý"
              value={stats.pendingOrders}
              bgColor="bg-yellow-50"
            />
            <QuickStat
              icon={<CheckCircle className="text-green-600" />}
              label="Đã giao hàng"
              value={stats.deliveredOrders}
              bgColor="bg-green-50"
            />
            <QuickStat
              icon={<AlertCircle className="text-blue-600" />}
              label="Đã xác nhận"
              value={stats.confirmedOrders}
              bgColor="bg-blue-50"
            />
          </div>

          {/* Recent Orders & Top Products */}
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
            {/* Recent Orders */}
            <div className="lg:col-span-2 bg-white rounded-xl shadow-sm">
              <div className="p-6 border-b border-gray-100 flex items-center justify-between">
                <h2 className="text-lg font-bold text-gray-800">Đơn hàng gần đây</h2>
                <button
                  onClick={() => navigate("/admin/orders")}
                  className="text-sm text-orange-600 hover:text-orange-700 font-semibold"
                >
                  Xem tất cả →
                </button>
              </div>
              <div className="overflow-x-auto">
                <table className="w-full">
                  <thead className="bg-gray-50">
                    <tr>
                      <th className="px-6 py-3 text-left text-xs font-semibold text-gray-600 uppercase">Mã ĐH</th>
                      <th className="px-6 py-3 text-left text-xs font-semibold text-gray-600 uppercase">Khách hàng</th>
                      <th className="px-6 py-3 text-left text-xs font-semibold text-gray-600 uppercase">Tổng tiền</th>
                      <th className="px-6 py-3 text-left text-xs font-semibold text-gray-600 uppercase">Trạng thái</th>
                      <th className="px-6 py-3 text-left text-xs font-semibold text-gray-600 uppercase">Thao tác</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-gray-100">
                    {recentOrders.length > 0 ? (
                      recentOrders.map((order) => (
                        <tr key={order.id} className="hover:bg-gray-50 transition">
                          <td className="px-6 py-4 text-sm font-medium text-gray-800">#{order.id}</td>
                          <td className="px-6 py-4 text-sm text-gray-600">{order.customer_name}</td>
                          <td className="px-6 py-4 text-sm font-semibold text-gray-800">
                            {formatCurrency(order.total)}
                          </td>
                          <td className="px-6 py-4">
                            <span className={`px-3 py-1 rounded-full text-xs font-semibold ${getStatusColor(order.status)}`}>
                              {getStatusText(order.status)}
                            </span>
                          </td>
                          <td className="px-6 py-4">
                            <button
                              onClick={() => navigate(`/admin/orders/${order.id}`)}
                              className="text-orange-600 hover:text-orange-700"
                            >
                              <Eye size={18} />
                            </button>
                          </td>
                        </tr>
                      ))
                    ) : (
                      <tr>
                        <td colSpan="5" className="px-6 py-12 text-center">
                          <div className="text-gray-400">
                            <ShoppingCart size={48} className="mx-auto mb-2 opacity-20" />
                            <p>Chưa có đơn hàng nào</p>
                          </div>
                        </td>
                      </tr>
                    )}
                  </tbody>
                </table>
              </div>
            </div>

            {/* Top Products */}
            <div className="bg-white rounded-xl shadow-sm">
              <div className="p-6 border-b border-gray-100">
                <h2 className="text-lg font-bold text-gray-800">Sản phẩm bán chạy</h2>
              </div>
              <div className="p-6 space-y-4">
                {topProducts.length > 0 ? (
                  topProducts.map((product, index) => (
                    <div key={product.id} className="flex items-center space-x-3">
                      <div className="flex-shrink-0 w-12 h-12 bg-gradient-to-br from-orange-100 to-red-100 rounded-lg flex items-center justify-center font-bold text-orange-600">
                        #{index + 1}
                      </div>
                      <div className="flex-1 min-w-0">
                        <p className="text-sm font-semibold text-gray-800 truncate">{product.name}</p>
                        <p className="text-xs text-gray-500">{product.sold} đã bán</p>
                      </div>
                      <div className="text-right">
                        <p className="text-sm font-bold text-orange-600">
                          {formatCurrency(product.price)}
                        </p>
                      </div>
                    </div>
                  ))
                ) : (
                  <div className="text-center py-8 text-gray-400">
                    <Package size={48} className="mx-auto mb-2 opacity-20" />
                    <p className="text-sm">Chưa có dữ liệu</p>
                  </div>
                )}
              </div>
            </div>
          </div>
        </div>
      </main>
    </div>
  );
}

function NavItem({ icon, label, active, collapsed, onClick }) {
  const baseClasses = "flex items-center space-x-3 px-4 py-3 rounded-lg transition-all duration-200 cursor-pointer";
  const activeClasses = active
    ? "bg-white/20 text-white font-semibold shadow-lg"
    : "text-white/80 hover:bg-white/10 hover:text-white";

  return (
    <div onClick={onClick} className={`${baseClasses} ${activeClasses}`}>
      <span>{icon}</span>
      {!collapsed && <span className="text-sm">{label}</span>}
    </div>
  );
}

function StatsCard({ title, value, icon, color, trend }) {
  return (
    <div className={`${color} rounded-xl shadow-lg p-6 text-white`}>
      <div className="flex items-center justify-between mb-4">
        <div className="p-3 bg-white/20 rounded-lg backdrop-blur-sm">
          {icon}
        </div>
        {trend && (
          <span className="text-xs font-semibold bg-white/20 px-2 py-1 rounded-full">
            {trend}
          </span>
        )}
      </div>
      <div>
        <p className="text-sm opacity-90 mb-1">{title}</p>
        <p className="text-2xl font-bold">{value}</p>
      </div>
    </div>
  );
}

function QuickStat({ icon, label, value, bgColor }) {
  return (
    <div className={`${bgColor} rounded-xl p-6`}>
      <div className="flex items-center space-x-4">
        <div className="p-3 bg-white rounded-lg shadow-sm">
          {icon}
        </div>
        <div>
          <p className="text-sm text-gray-600 mb-1">{label}</p>
          <p className="text-2xl font-bold text-gray-800">{value}</p>
        </div>
      </div>
    </div>
  );
}