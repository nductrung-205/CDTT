import React, { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import Header from "../components/Header";
import Footer from "../components/Footer";
import { getMyOrders } from '../api';

export default function MyOrders() {
  const navigate = useNavigate();
  const [orders, setOrders] = useState([]); 
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    const fetchOrders = async () => {
      try {
        setLoading(true);
        const data = await getMyOrders();

        console.log("Fetched orders:", data);

        if (Array.isArray(data)) {
          setOrders(data);
        } else {
          console.error("Orders data is not an array:", data);
          setOrders([]);
        }
        
      } catch (err) {
        console.error("Failed to fetch orders:", err);
        
        if (err.response?.status === 401) {
          setError("Bạn cần đăng nhập để xem đơn hàng.");
          navigate("/login");
        } else {
          setError("Không thể tải danh sách đơn hàng. Vui lòng thử lại.");
        }
      } finally {
        setLoading(false);
      }
    };

    fetchOrders();
  }, [navigate]);

  if (loading) {
    return (
      <div className="min-h-screen flex flex-col bg-gray-50">
        <Header />
        <div className="flex-1 flex justify-center items-center">
          <div className="text-center">
            <div className="inline-block animate-spin rounded-full h-12 w-12 border-b-2 border-orange-500 mb-4"></div>
            <p className="text-gray-600">Đang tải đơn hàng của bạn...</p>
          </div>
        </div>
        <Footer />
      </div>
    );
  }

  if (error) {
    return (
      <div className="min-h-screen flex flex-col bg-gray-50">
        <Header />
        <div className="flex-1 flex justify-center items-center">
          <div className="text-center">
            <p className="text-red-500 text-lg mb-4">{error}</p>
            <button
              onClick={() => navigate("/")}
              className="px-6 py-2 bg-orange-500 text-white rounded hover:bg-orange-600"
            >
              Quay lại trang chủ
            </button>
          </div>
        </div>
        <Footer />
      </div>
    );
  }

  return (
    <div className="min-h-screen flex flex-col bg-gray-50">
      <Header />

      <main className="flex-1 w-full max-w-4xl mx-auto px-4 py-8">
        <h1 className="text-3xl font-bold text-orange-600 mb-8 text-center">
          Đơn hàng của tôi
        </h1>

        {!Array.isArray(orders) || orders.length === 0 ? (
          <div className="text-center p-8 bg-white shadow rounded-lg">
            <p className="text-gray-600 text-lg mb-4">Bạn chưa có đơn hàng nào.</p>
            <button
              onClick={() => navigate("/")}
              className="px-6 py-2 bg-orange-500 text-white rounded hover:bg-orange-600"
            >
              Bắt đầu mua sắm
            </button>
          </div>
        ) : (
          <div className="space-y-6">
            {orders.map((order) => (
              <div
                key={order.id}
                className="bg-white shadow rounded-lg p-6 flex flex-col md:flex-row justify-between items-start md:items-center"
              >
                <div className="mb-4 md:mb-0">
                  <p className="text-lg font-semibold text-gray-800">
                    Mã đơn hàng: #{order.id}
                  </p>
                  <p className="text-gray-600 text-sm">
                    Ngày đặt: {new Date(order.created_at).toLocaleString('vi-VN')}
                  </p>
                  <p className="text-gray-600 text-sm">
                    Tổng tiền:{" "}
                    <span className="font-bold text-red-600">
                      {order.total_price?.toLocaleString() || '0'}₫
                    </span>
                  </p>
                </div>
                <div className="flex items-center gap-4">
                  <span
                    className={`px-3 py-1 rounded-full text-sm font-medium ${
                      order.status === "pending" ? "bg-yellow-100 text-yellow-700" :
                      order.status === "confirmed" ? "bg-blue-100 text-blue-700" :
                      order.status === "delivered" ? "bg-green-100 text-green-700" :
                      "bg-red-100 text-red-700"
                    }`}
                  >
                    {order.status === "pending" && "Đang chờ"}
                    {order.status === "confirmed" && "Đã xác nhận"}
                    {order.status === "delivered" && "Đã giao"}
                    {order.status === "cancelled" && "Đã hủy"}
                  </span>
                  <button
                    onClick={() => navigate(`/orders/${order.id}`)}
                    className="px-4 py-2 bg-blue-500 text-white rounded hover:bg-blue-600 text-sm"
                  >
                    Xem chi tiết
                  </button>
                </div>
              </div>
            ))}
          </div>
        )}
      </main>

      <Footer />
    </div>
  );
}