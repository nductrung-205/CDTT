import React from "react";
import { useCart } from "../context/CartContext";
import Header from "../components/Header";
import Footer from "../components/Footer";
import { Link, useNavigate } from "react-router-dom";

function Cart() {
    const navigate = useNavigate();
    const { cart, removeFromCart, clearCart, increaseQty, decreaseQty } = useCart();

    const subtotal = cart.reduce((sum, item) => sum + item.price * item.quantity, 0);
    const deliveryFee = cart.length > 0 ? 15000 : 0;
    const discount = subtotal > 200000 ? 20000 : 0;
    const total = subtotal + deliveryFee - discount;

    const handleRemove = (id) => {
        if (window.confirm("Bạn có chắc chắn muốn xóa món này khỏi giỏ hàng?")) {
            removeFromCart(id);
        }
    };

    const handleClearCart = () => {
        if (window.confirm("Bạn có chắc chắn muốn xóa tất cả món ăn trong giỏ hàng?")) {
            clearCart();
        }
    };

    return (
        <>
            <Header />

            <main className="min-h-screen bg-gradient-to-b from-orange-50 to-white py-8 px-4">
                <div className="max-w-6xl mx-auto">
                 
                    <div className="text-center mb-8">
                        <h1 className="text-4xl font-bold text-gray-800 mb-2">
                            🛒 Giỏ hàng của bạn
                        </h1>
                        <p className="text-gray-600">
                            {cart.length > 0
                                ? `Bạn có ${cart.length} món trong giỏ hàng`
                                : "Giỏ hàng đang trống"}
                        </p>
                    </div>

                    {cart.length === 0 ? (
                     
                        <div className="flex flex-col items-center justify-center py-16">
                            <div className="w-64 h-64 mb-8 bg-gray-100 rounded-full flex items-center justify-center">
                                <span className="text-9xl">🍽️</span>
                            </div>
                            <h2 className="text-2xl font-bold text-gray-800 mb-2">
                                Giỏ hàng đang trống
                            </h2>
                            <p className="text-gray-600 mb-6 text-center max-w-md">
                                Hãy khám phá thực đơn phong phú của chúng tôi và thêm những món ăn yêu thích vào giỏ hàng!
                            </p>
                            <Link
                                to="/menu"
                                className="px-8 py-3 bg-gradient-to-r from-orange-500 to-red-500 text-white rounded-full hover:shadow-lg transition transform hover:scale-105 font-semibold"
                            >
                                🍕 Khám phá thực đơn
                            </Link>
                        </div>
                    ) : (
                        <div className="grid lg:grid-cols-3 gap-8">
                            
                            <div className="lg:col-span-2 space-y-4">
                                <div className="bg-white rounded-2xl shadow-lg p-6">
                                    <div className="flex items-center justify-between mb-6">
                                        <h2 className="text-xl font-bold text-gray-800">
                                            Món đã chọn ({cart.length})
                                        </h2>
                                        <button
                                            onClick={handleClearCart}
                                            className="text-red-500 hover:text-red-600 font-semibold text-sm"
                                        >
                                            🗑️ Xóa tất cả
                                        </button>
                                    </div>

                                    <div className="space-y-4">
                                        {cart.map((item) => (
                                            <div
                                                key={item.id}
                                                className="flex gap-4 p-4 bg-gray-50 rounded-xl hover:bg-gray-100 transition"
                                            >
                                               
                                                <div className="flex-shrink-0">
                                                    <img
                                                        src={item.image_url}
                                                        alt={item.name}
                                                        className="w-24 h-24 object-cover rounded-lg shadow-md"
                                                    />
                                                </div>

                                               
                                                <div className="flex-1">
                                                    <h3 className="font-bold text-gray-800 mb-1">
                                                        {item.name}
                                                    </h3>
                                                    <p className="text-orange-600 font-semibold text-lg mb-3">
                                                        {item.price.toLocaleString()}₫
                                                    </p>

                                                   
                                                    <div className="flex items-center gap-3">
                                                        <div className="flex items-center bg-white rounded-lg shadow-sm border border-gray-200">
                                                            <button
                                                                onClick={() => {
                                                                    if (item.quantity === 1) {
                                                                        handleRemove(item.id);
                                                                    } else {
                                                                        decreaseQty(item.id);
                                                                    }
                                                                }}
                                                                className="w-8 h-8 flex items-center justify-center text-gray-600 hover:bg-gray-100 rounded-l-lg transition"
                                                            >
                                                                {item.quantity === 1 ? "🗑️" : "−"}
                                                            </button>
                                                            <span className="w-12 text-center font-semibold text-gray-800">
                                                                {item.quantity}
                                                            </span>
                                                            <button
                                                                onClick={() => increaseQty(item.id)}
                                                                className="w-8 h-8 flex items-center justify-center text-gray-600 hover:bg-gray-100 rounded-r-lg transition"
                                                            >
                                                                +
                                                            </button>
                                                        </div>
                                                        <span className="text-sm text-gray-500">
                                                            = {(item.price * item.quantity).toLocaleString()}₫
                                                        </span>
                                                    </div>
                                                </div>

                                            
                                                <button
                                                    onClick={() => handleRemove(item.id)}
                                                    className="self-start p-2 text-gray-400 hover:text-red-500 transition"
                                                    title="Xóa món"
                                                >
                                                    ✕
                                                </button>
                                            </div>
                                        ))}
                                    </div>
                                </div>

                               
                                <div className="bg-white rounded-2xl shadow-lg p-6">
                                    <h3 className="font-bold text-gray-800 mb-4">🎟️ Mã giảm giá</h3>
                                    <div className="flex gap-3">
                                        <input
                                            type="text"
                                            placeholder="Nhập mã giảm giá"
                                            className="flex-1 px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-orange-500"
                                        />
                                        <button className="px-6 py-3 bg-gray-200 text-gray-700 rounded-lg hover:bg-gray-300 font-semibold transition">
                                            Áp dụng
                                        </button>
                                    </div>
                                    {discount > 0 && (
                                        <div className="mt-4 p-3 bg-green-50 border border-green-200 rounded-lg">
                                            <p className="text-green-700 text-sm">
                                                ✓ Giảm giá {discount.toLocaleString()}₫ cho đơn hàng trên 200.000₫
                                            </p>
                                        </div>
                                    )}
                                </div>
                            </div>

                           
                            <div className="lg:col-span-1">
                                <div className="bg-white rounded-2xl shadow-lg p-6 sticky top-4">
                                    <h2 className="text-xl font-bold text-gray-800 mb-6">
                                        💳 Tổng đơn hàng
                                    </h2>

                                    <div className="space-y-4 mb-6">
                                        <div className="flex justify-between text-gray-600">
                                            <span>Tạm tính</span>
                                            <span className="font-semibold">{subtotal.toLocaleString()}₫</span>
                                        </div>
                                        <div className="flex justify-between text-gray-600">
                                            <span>Phí giao hàng</span>
                                            <span className="font-semibold">{deliveryFee.toLocaleString()}₫</span>
                                        </div>
                                        {discount > 0 && (
                                            <div className="flex justify-between text-green-600">
                                                <span>Giảm giá</span>
                                                <span className="font-semibold">-{discount.toLocaleString()}₫</span>
                                            </div>
                                        )}
                                        <div className="border-t pt-4 flex justify-between text-lg font-bold text-gray-800">
                                            <span>Tổng cộng</span>
                                            <span className="text-orange-600">{total.toLocaleString()}₫</span>
                                        </div>
                                    </div>

                                    
                                    <button
                                        onClick={() => navigate("/checkout")}
                                        className="w-full py-4 bg-gradient-to-r from-orange-500 to-red-500 text-white rounded-xl hover:shadow-lg transition transform hover:scale-105 font-bold text-lg"
                                    >
                                        🚀 Tiến hành thanh toán
                                    </button>

                                   
                                    <div className="mt-6 space-y-3">
                                        <div className="flex items-center gap-3 text-sm text-gray-600">
                                            <span className="text-xl">✓</span>
                                            <span>Giao hàng nhanh trong 30 phút</span>
                                        </div>
                                        <div className="flex items-center gap-3 text-sm text-gray-600">
                                            <span className="text-xl">✓</span>
                                            <span>Đảm bảo món ăn nóng sốt</span>
                                        </div>
                                        <div className="flex items-center gap-3 text-sm text-gray-600">
                                            <span className="text-xl">✓</span>
                                            <span>Miễn phí đổi trả trong 24h</span>
                                        </div>
                                    </div>

                                   
                                    <Link
                                        to="/products"
                                        className="block text-center mt-4 text-orange-600 hover:text-orange-700 font-semibold"
                                    >
                                        ← Tiếp tục mua sắm
                                    </Link>
                                </div>

                               
                                <div className="mt-6 bg-gradient-to-br from-orange-50 to-red-50 rounded-2xl p-6">
                                    <h3 className="font-bold text-gray-800 mb-4 text-center">
                                        🏆 Cam kết của chúng tôi
                                    </h3>
                                    <div className="space-y-3 text-sm text-gray-700">
                                        <div className="flex items-center gap-2">
                                            <span className="text-2xl">🔒</span>
                                            <span>Thanh toán an toàn 100%</span>
                                        </div>
                                        <div className="flex items-center gap-2">
                                            <span className="text-2xl">⭐</span>
                                            <span>Đánh giá 4.8/5 từ khách hàng</span>
                                        </div>
                                        <div className="flex items-center gap-2">
                                            <span className="text-2xl">📞</span>
                                            <span>Hỗ trợ 24/7</span>
                                        </div>
                                    </div>
                                </div>
                            </div>
                        </div>
                    )}
                </div>
            </main>

            <Footer />
        </>
    );
}

export default Cart;