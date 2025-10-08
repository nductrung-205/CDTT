import React, { useEffect, useState } from "react";
import { useParams, useNavigate } from "react-router-dom";
import Header from "../components/Header";
import Footer from "../components/Footer";

import { getOrderDetail, cancelOrder } from '../api';
import Swal from 'sweetalert2';


export default function OrderDetail() {
  const { id } = useParams();
  const navigate = useNavigate();
  const [order, setOrder] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [cancelling, setCancelling] = useState(false);


  useEffect(() => {
    const fetchOrder = async () => {
      try {
        setLoading(true);
        const response = await getOrderDetail(id);
        setOrder(response.data);
      } catch (err) {
        console.error("Error fetching order detail:", err);
        setError("Không thể tải chi tiết đơn hàng này. Vui lòng thử lại.");
      } finally {
        setLoading(false);
      }
    };

    fetchOrder();
  }, [id]);

  if (loading) {
    return (
      <div className="min-h-screen flex flex-col justify-center items-center bg-gray-50">
        <p className="text-gray-600">Đang tải chi tiết đơn hàng...</p>
      </div>
    );
  }

  if (error) {
    return (
      <div className="min-h-screen flex flex-col justify-center items-center bg-gray-50">
        <p className="text-red-500">{error}</p>
        <button
          onClick={() => navigate("/orders")}
          className="mt-4 px-6 py-2 bg-orange-500 text-white rounded hover:bg-orange-600"
        >
          Quay lại danh sách
        </button>
      </div>
    );
  }

  if (!order) {
    return (
      <div className="min-h-screen flex flex-col">
        <Header />
        <main className="flex-1 flex flex-col items-center justify-center">
          <p className="text-gray-600 mb-4">Không tìm thấy đơn hàng.</p>
          <button
            onClick={() => navigate("/orders")}
            className="px-6 py-2 bg-orange-500 text-white rounded hover:bg-orange-600"
          >
            Quay lại danh sách
          </button>
        </main>
        <Footer />
      </div>
    );
  }

  const handleCancelOrder = async () => {
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
        setCancelling(true);
        try {
          const response = await cancelOrder(order.id);
          Swal.fire('Đã hủy!', 'Đơn hàng đã được hủy thành công.', 'success');
          setOrder(response.data.order); // cập nhật lại đơn hàng
        } catch (err) {
          console.error("Error cancelling order:", err);
          Swal.fire(
            'Lỗi!',
            err.response?.data?.message || 'Không thể hủy đơn hàng. Vui lòng thử lại.',
            'error'
          );
        } finally {
          setCancelling(false);
        }
      }
    });
  };


  return (
    <div className="min-h-screen flex flex-col bg-gray-50">
      <Header />

      <main className="flex-1 w-full max-w-4xl mx-auto px-4 py-8">
        <h1 className="text-2xl font-bold text-orange-600 mb-6">
          📦 Chi tiết đơn hàng #{order.id}
        </h1>


        <div className="bg-white shadow rounded-lg p-4 mb-6">
          <p className="text-sm text-gray-500 mb-3">
            Ngày đặt: {new Date(order.ordered_at).toLocaleString()}
          </p>
          <p className="mb-2">
            <span className="font-medium">Trạng thái:</span>{" "}
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
          </p>

          <p className="mb-2">
            <span className="font-medium">Người đặt:</span>{" "}
            {order.user?.fullname || 'Không rõ'} ({order.user?.email || 'Không rõ'})
          </p>


        </div>


        <div className="bg-white shadow rounded-lg p-4 mb-6">
          <h2 className="font-semibold mb-4">Sản phẩm</h2>
          <div className="divide-y">
            {order.order_items.map((item) => (
              <div
                key={item.id}
                className="flex justify-between items-center py-3"
              >
                <div className="flex items-center gap-3">
                  <img
                    src={item.product?.image_url || 'placeholder.jpg'}
                    alt={item.product?.name || 'Sản phẩm'}
                    className="w-16 h-16 object-cover rounded"
                  />
                  <div>
                    <p className="font-medium">{item.product?.name || 'Sản phẩm'}</p>
                    <p className="text-sm text-gray-500">SL: {item.quantity}</p>
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
        </div>

        <div className="flex gap-4">
          <button
            onClick={() => navigate("/orders")}
            className="px-6 py-2 bg-gray-300 rounded hover:bg-gray-400"
          >
            Quay lại danh sách
          </button>
          <button
            onClick={() => navigate("/")}
            className="px-6 py-2 bg-orange-500 text-white rounded hover:bg-orange-600"
          >
            Tiếp tục mua sắm
          </button>

          <button
            onClick={handleCancelOrder}
            className="px-6 py-2 bg-red-500 text-white rounded hover:bg-red-600 disabled:opacity-50 disabled:cursor-not-allowed"
            disabled={cancelling}
          >
            {cancelling ? 'Đang hủy...' : 'Hủy đơn hàng'}
          </button>
        </div>

      </main>

      <Footer />
    </div>
  );
}