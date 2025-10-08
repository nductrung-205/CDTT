import React, { useEffect, useState } from "react";
import Header from "../components/Header";
import Footer from "../components/Footer";
import { Link } from "react-router-dom";
import Swal from 'sweetalert2';

import { getMyOrders, cancelOrder } from '../api';

export default function Orders() {
  const [orders, setOrders] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [cancellingOrderId, setCancellingOrderId] = useState(null);

  useEffect(() => {
    const fetchUserOrders = async () => {
      try {
        setLoading(true);
        const response = await getMyOrders();
        setOrders(response.data.reverse());
      } catch (err) {
        console.error("Error fetching user orders:", err);
        setError("Không thể tải đơn hàng của bạn. Vui lòng thử lại.");
      } finally {
        setLoading(false);
      }
    };

    fetchUserOrders();
  }, []);

  const handleCancelOrder = async (orderId) => {
    Swal.fire({
      title: 'Xác nhận hủy đơn hàng?',
      text: "Bạn sẽ không thể khôi phục đơn hàng này sau khi hủy!",
      icon: 'warning',
      showCancelButton: true,
      confirmButtonColor: '#d33',
      cancelButtonColor: '#3085d6',
      confirmButtonText: 'Có, hủy đơn hàng!',
      cancelButtonText: 'Không, giữ lại'
    }).then(async (result) => {
      if (result.isConfirmed) {
        setCancellingOrderId(orderId);
        try {
          await cancelOrder(orderId);
          Swal.fire(
            'Đã hủy!',
            'Đơn hàng của bạn đã được hủy thành công.',
            'success'
          );

          const response = await getMyOrders();
          setOrders(response.data.reverse());
        } catch (err) {
          console.error("Error cancelling order:", err);
          Swal.fire(
            'Lỗi!',
            err.response?.data?.message || 'Không thể hủy đơn hàng. Vui lòng thử lại.',
            'error'
          );
        } finally {
          setCancellingOrderId(null);
        }
      }
    });
  };

  if (loading) {
    return (
      <div className="min-h-screen flex flex-col justify-center items-center bg-gray-50">
        <p className="text-gray-600">Đang tải đơn hàng...</p>
      </div>
    );
  }

  if (error) {
    return (
      <div className="min-h-screen flex flex-col justify-center items-center bg-gray-50">
        <p className="text-red-500">{error}</p>
        <button
          onClick={() => window.location.reload()}
          className="mt-4 px-6 py-3 bg-orange-500 text-white rounded-lg hover:bg-orange-600"
        >
          Thử lại
        </button>
      </div>
    );
  }

  
  return (
    <div className="min-h-screen flex flex-col bg-gray-50">
      <Header />

      <main className="flex-1 w-full max-w-5xl mx-auto px-4 py-8">
        <h1 className="text-2xl font-bold text-orange-600 mb-6">📦 Đơn hàng của tôi</h1>

        {orders.length === 0 ? (
          <div className="text-center">
            <p className="text-gray-500 mb-4">Bạn chưa có đơn hàng nào.</p>
            <Link
              to="/"
              className="px-6 py-3 bg-orange-500 text-white rounded-lg hover:bg-orange-600"
            >
              🛒 Tiếp tục mua sắm
            </Link>
          </div>
        ) : (
          <div className="space-y-6">
            {orders.map((order) => (
              <div
                key={order.id}
                className="bg-white shadow rounded-lg p-4 border border-gray-200"
              >
                <div className="flex justify-between items-center mb-2">
                  <h2 className="font-semibold text-lg">Đơn #{order.id}</h2>

                  <span
                    className={`px-3 py-1 rounded text-sm ${order.status === "pending" ? "bg-yellow-100 text-yellow-700" :
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
                </div>
                <p className="text-sm text-gray-500 mb-3">
                  Ngày đặt: {new Date(order.ordered_at).toLocaleString()}
                </p>


                <div className="divide-y">
                  {order.order_items.map((item) => (
                    <div
                      key={item.id}
                      className="flex justify-between items-center py-2"
                    >
                      <div className="flex items-center gap-3">

                        <img
                          src={item.product?.image_url || 'placeholder.jpg'}
                          alt={item.product?.name || 'Sản phẩm'}
                          className="w-14 h-14 object-cover rounded"
                        />
                        <div>
                          <p className="font-medium">{item.product?.name || 'Sản phẩm'}</p>
                          <p className="text-sm text-gray-500">
                            SL: {item.quantity}
                          </p>
                        </div>
                      </div>
                      <p className="text-red-600 font-semibold">
                        {(item.price * item.quantity).toLocaleString()}₫
                      </p>
                    </div>
                  ))}
                </div>


                <div className="flex justify-between items-center mt-4 font-bold">
                  <span>Tổng cộng:</span>
                  <span className="text-red-600">
                    {order.total_price.toLocaleString()}₫
                  </span>
                </div>

                <div className="mt-3 flex justify-end items-center gap-2">
                  <button
                    onClick={() => handleCancelOrder(order.id)}
                    className="px-4 py-2 bg-red-500 text-white rounded-lg hover:bg-red-600 text-sm disabled:opacity-50 disabled:cursor-not-allowed"
                    disabled={
                      cancellingOrderId === order.id ||
                      order.status === 'cancelled' ||
                      order.status === 'delivered'
                    }
                  >
                    {cancellingOrderId === order.id ? 'Đang hủy...' : 'Hủy đơn'}
                  </button>

                  <Link
                    to={`/orders/${order.id}`}
                    className="text-sm text-blue-600 hover:underline px-4 py-2"
                  >
                    Xem chi tiết →
                  </Link>
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