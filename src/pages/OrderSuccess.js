import React from "react";
import { useLocation, useNavigate } from "react-router-dom";
import Header from "../components/Header";
import Footer from "../components/Footer";

function OrderSuccess() {
    const location = useLocation();
    const navigate = useNavigate();
    const order = location.state?.order;

    if (!order) {
        return (
            <div className="min-h-screen flex flex-col bg-gray-50">
                <Header />
                <div className="flex-1 flex items-center justify-center">
                    <div className="text-center">
                        <p className="text-gray-600 mb-4">Không tìm thấy thông tin đơn hàng</p>
                        <button
                            onClick={() => navigate("/")}
                            className="px-6 py-2 bg-orange-500 text-white rounded-lg hover:bg-orange-600"
                        >
                            Về trang chủ
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

            <main className="flex-1 w-full max-w-3xl mx-auto px-4 py-12">
                <div className="bg-white rounded-2xl shadow-xl p-8 text-center">
                    <div className="mb-6">
                        <span className="text-8xl">✅</span>
                    </div>
                    
                    <h1 className="text-3xl font-bold text-green-600 mb-4">
                        Đặt hàng thành công!
                    </h1>
                    
                    <p className="text-gray-600 mb-8">
                        Cảm ơn bạn đã đặt hàng. Chúng tôi sẽ liên hệ với bạn sớm nhất.
                    </p>

                    <div className="bg-orange-50 rounded-xl p-6 mb-8 text-left">
                        <h2 className="text-xl font-bold text-gray-800 mb-4">
                            Thông tin đơn hàng
                        </h2>
                        
                        <div className="space-y-3">
                            <div className="flex justify-between">
                                <span className="text-gray-600">Mã đơn hàng:</span>
                                <span className="font-semibold">#{order.id}</span>
                            </div>
                            
                            <div className="flex justify-between">
                                <span className="text-gray-600">Người nhận:</span>
                                <span className="font-semibold">{order.customer?.name}</span>
                            </div>
                            
                            <div className="flex justify-between">
                                <span className="text-gray-600">Số điện thoại:</span>
                                <span className="font-semibold">{order.customer?.phone || 'N/A'}</span>
                            </div>
                            
                            <div className="flex justify-between">
                                <span className="text-gray-600">Địa chỉ:</span>
                                <span className="font-semibold text-right">
                                    {order.customer?.address}, {order.customer?.ward}, {order.customer?.district}, {order.customer?.city}
                                </span>
                            </div>
                            
                            <div className="border-t pt-3 mt-3">
                                <div className="flex justify-between text-lg">
                                    <span className="text-gray-800 font-semibold">Tổng tiền:</span>
                                    <span className="text-orange-600 font-bold">
                                        {order.total?.toLocaleString()}₫
                                    </span>
                                </div>
                            </div>
                        </div>
                    </div>

                    <div className="space-y-3">
                        <button
                            onClick={() => navigate("/orders")}
                            className="w-full px-6 py-3 bg-gradient-to-r from-orange-500 to-red-500 text-white rounded-xl hover:shadow-lg transition font-semibold"
                        >
                            Xem đơn hàng của tôi
                        </button>
                        
                        <button
                            onClick={() => navigate("/")}
                            className="w-full px-6 py-3 bg-gray-100 text-gray-700 rounded-xl hover:bg-gray-200 transition font-semibold"
                        >
                            Về trang chủ
                        </button>
                    </div>
                </div>
            </main>

            <Footer />
        </div>
    );
}

export default OrderSuccess;