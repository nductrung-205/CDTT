import React, { useState, useEffect } from "react";
import { useCart } from "../context/CartContext";
import Header from "../components/Header";
import Footer from "../components/Footer";
import { Link, useNavigate } from "react-router-dom";
import { createOrder } from "../api";
import { useAuth } from "../context/AuthContext";

function Checkout() {
    const { cart, clearCart } = useCart();
    const navigate = useNavigate();
    const { user } = useAuth();

    const [form, setForm] = useState({
        name: user?.fullname || "",
        phone: "",
        city: "",
        district: "",
        ward: "",
        address: "",
        type: "Nhà Riêng",
        note: "",
        paymentMethod: "COD",
    });
    const [isSubmitting, setIsSubmitting] = useState(false);

    const [provinces, setProvinces] = useState([]);
    const [districts, setDistricts] = useState([]);
    const [wards, setWards] = useState([]);

    useEffect(() => {
        fetch("https://provinces.open-api.vn/api/?depth=1")
            .then((res) => res.json())
            .then((data) => setProvinces(data));
    }, []);


    const handleCityChange = (e) => {
        const code = e.target.value;
        const selectedCity = provinces.find(p => p.code === parseInt(code));
        setForm({ ...form, city: selectedCity ? selectedCity.name : "", district: "", ward: "" }); 
        setDistricts([]);
        setWards([]);

        if (code) {
            fetch(`https://provinces.open-api.vn/api/p/${code}?depth=2`)
                .then((res) => res.json())
                .then((data) => setDistricts(data.districts));
        }
    };

    const handleDistrictChange = (e) => {
        const code = e.target.value;
        const selectedDistrict = districts.find(d => d.code === parseInt(code));
        setForm({ ...form, district: selectedDistrict ? selectedDistrict.name : "", ward: "" }); 

        if (code) {
            fetch(`https://provinces.open-api.vn/api/d/${code}?depth=2`)
                .then((res) => res.json())
                .then((data) => setWards(data.wards));
        }
    };

    const handleChange = (e) => {
        setForm({ ...form, [e.target.name]: e.target.value });
    };

    const subtotal = cart.reduce((sum, item) => sum + item.price * item.quantity, 0);
    const deliveryFee = 15000;
    const discount = subtotal > 200000 ? 20000 : 0;
    const total = subtotal + deliveryFee - discount;


    const handleSubmit = async (e) => {
        e.preventDefault();


        if (cart.length === 0) {
            alert("Giỏ hàng của bạn đang trống!");
            return;
        }


        if (!form.name || !form.phone || !form.city || !form.district || !form.ward || !form.address) {
            alert("Vui lòng điền đầy đủ thông tin giao hàng bắt buộc!");
            return;
        }

        setIsSubmitting(true);

        try {

            const orderPayload = {
                items: cart.map(item => ({
                    product_id: item.id,
                    quantity: item.quantity,
                    price: item.price,
                })),
                total_price: total,
                payment_method: form.paymentMethod,
                customer: {
                    name: form.name,
                    phone: form.phone,
                    city: form.city,
                    district: form.district,
                    ward: form.ward,
                    address: form.address,
                    type: form.type,
                    note: form.note,
                }
            };

            console.log("📤 Sending order:", orderPayload);


            const apiResponse = await createOrder(orderPayload);


            const orderData = apiResponse.data;

            console.log("✅ Order created:", orderData);

            clearCart();


            navigate("/success", { state: { order: orderData } });

        } catch (error) {
            console.error("❌ Lỗi khi đặt hàng:", error);


            if (error.response?.data?.errors) {

                const errorMessages = Object.values(error.response.data.errors).flat();
                alert("Lỗi nhập liệu:\n" + errorMessages.join("\n"));
            } else if (error.response?.data?.message) {

                alert(error.response.data.message);
            } else {

                alert("Có lỗi xảy ra khi đặt hàng. Vui lòng thử lại!");
            }
        } finally {
            setIsSubmitting(false);
        }
    };

    return (
        <div className="min-h-screen flex flex-col bg-gray-50">
            <Header />

            <main className="flex-1 w-full max-w-7xl mx-auto px-4 py-8">


                {cart.length === 0 ? (
                    <div className="flex flex-col items-center justify-center py-16 bg-white rounded-2xl shadow-lg">
                        <span className="text-8xl mb-4">🛒</span>
                        <h2 className="text-2xl font-bold text-gray-800 mb-2">Giỏ hàng trống</h2>
                        <p className="text-gray-600 mb-6">Hãy thêm món ăn vào giỏ hàng để tiếp tục</p>
                        <Link
                            to="/products"
                            className="px-8 py-3 bg-gradient-to-r from-orange-500 to-red-500 text-white rounded-full hover:shadow-lg transition font-semibold"
                        >
                            Khám phá thực đơn
                        </Link>
                    </div>
                ) : (
                    <div className="grid lg:grid-cols-3 gap-6">

                        <div className="lg:col-span-2 space-y-6">

                            <div className="bg-white shadow-lg rounded-2xl p-6">
                                <h2 className="text-xl font-bold text-gray-800 mb-6 flex items-center">
                                    <span className="text-2xl mr-2">📍</span>
                                    Thông tin giao hàng
                                </h2>
                                <form className="space-y-4">
                                    <div className="grid md:grid-cols-2 gap-4">
                                        <div>
                                            <label className="block text-sm font-semibold text-gray-700 mb-2">
                                                Họ và tên *
                                            </label>
                                            <input
                                                type="text"
                                                name="name"
                                                placeholder="VD: Nguyễn Văn A"
                                                value={form.name}
                                                onChange={handleChange}
                                                className="w-full border border-gray-300 rounded-lg p-3 focus:outline-none focus:ring-2 focus:ring-orange-500"
                                                required
                                            />
                                        </div>
                                        <div>
                                            <label className="block text-sm font-semibold text-gray-700 mb-2">
                                                Số điện thoại *
                                            </label>
                                            <input
                                                type="tel"
                                                name="phone"
                                                placeholder="VD: 0912345678"
                                                value={form.phone}
                                                onChange={handleChange}
                                                className="w-full border border-gray-300 rounded-lg p-3 focus:outline-none focus:ring-2 focus:ring-orange-500"
                                                required
                                            />
                                        </div>
                                    </div>

                                    <div className="grid md:grid-cols-3 gap-4">
                                        <div>
                                            <label className="block text-sm font-semibold text-gray-700 mb-2">
                                                Tỉnh/Thành phố *
                                            </label>
                                            <select
                                                value={provinces.find(p => p.name === form.city)?.code || ""} 
                                                onChange={handleCityChange}
                                                className="w-full border border-gray-300 rounded-lg p-3 focus:outline-none focus:ring-2 focus:ring-orange-500"
                                                required
                                            >
                                                <option value="">-- Chọn --</option>
                                                {provinces.map((p) => (
                                                    <option key={p.code} value={p.code}>
                                                        {p.name}
                                                    </option>
                                                ))}
                                            </select>
                                        </div>
                                        <div>
                                            <label className="block text-sm font-semibold text-gray-700 mb-2">
                                                Quận/Huyện *
                                            </label>
                                            <select
                                                value={districts.find(d => d.name === form.district)?.code || ""}
                                                onChange={handleDistrictChange}
                                                className="w-full border border-gray-300 rounded-lg p-3 focus:outline-none focus:ring-2 focus:ring-orange-500"
                                                disabled={!districts.length}
                                                required
                                            >
                                                <option value="">-- Chọn --</option>
                                                {districts.map((d) => (
                                                    <option key={d.code} value={d.code}>
                                                        {d.name}
                                                    </option>
                                                ))}
                                            </select>
                                        </div>
                                        <div>
                                            <label className="block text-sm font-semibold text-gray-700 mb-2">
                                                Phường/Xã *
                                            </label>
                                            <select
                                                name="ward"
                                                value={form.ward}
                                                onChange={handleChange}
                                                className="w-full border border-gray-300 rounded-lg p-3 focus:outline-none focus:ring-2 focus:ring-orange-500"
                                                disabled={!wards.length}
                                                required
                                            >
                                                <option value="">-- Chọn --</option>
                                                {wards.map((w) => (
                                                    <option key={w.code} value={w.name}>
                                                        {w.name}
                                                    </option>
                                                ))}
                                            </select>
                                        </div>
                                    </div>

                                    <div>
                                        <label className="block text-sm font-semibold text-gray-700 mb-2">
                                            Địa chỉ cụ thể *
                                        </label>
                                        <input
                                            type="text"
                                            name="address"
                                            placeholder="Số nhà, tên đường..."
                                            value={form.address}
                                            onChange={handleChange}
                                            className="w-full border border-gray-300 rounded-lg p-3 focus:outline-none focus:ring-2 focus:ring-orange-500"
                                            required
                                        />
                                    </div>

                                    <div>
                                        <label className="block text-sm font-semibold text-gray-700 mb-3">
                                            Loại địa chỉ
                                        </label>
                                        <div className="flex gap-4">
                                            <label className="flex items-center cursor-pointer">
                                                <input
                                                    type="radio"
                                                    name="type"
                                                    value="Nhà Riêng"
                                                    checked={form.type === "Nhà Riêng"}
                                                    onChange={handleChange}
                                                    className="w-4 h-4 text-orange-600 focus:ring-orange-500"
                                                />
                                                <span className="ml-2">🏠 Nhà Riêng</span>
                                            </label>
                                            <label className="flex items-center cursor-pointer">
                                                <input
                                                    type="radio"
                                                    name="type"
                                                    value="Văn Phòng"
                                                    checked={form.type === "Văn Phòng"}
                                                    onChange={handleChange}
                                                    className="w-4 h-4 text-orange-600 focus:ring-orange-500"
                                                />
                                                <span className="ml-2">🏢 Văn Phòng</span>
                                            </label>
                                        </div>
                                    </div>

                                    <div>
                                        <label className="block text-sm font-semibold text-gray-700 mb-2">
                                            Ghi chú (tùy chọn)
                                        </label>
                                        <textarea
                                            name="note"
                                            placeholder="Ghi chú đơn hàng (không cay, nhiều rau...)"
                                            value={form.note}
                                            onChange={handleChange}
                                            className="w-full border border-gray-300 rounded-lg p-3 focus:outline-none focus:ring-2 focus:ring-orange-500"
                                            rows="3"
                                        />
                                    </div>
                                </form>
                            </div>


                        </div>


                        <div className="lg:col-span-1">
                            <div className="bg-white shadow-lg rounded-2xl p-6 sticky top-4">
                                <h2 className="text-xl font-bold text-gray-800 mb-6">
                                    Đơn hàng của bạn
                                </h2>

                                <button
                                    onClick={handleSubmit}
                                    className={`w-full py-4 bg-gradient-to-r from-orange-500 to-red-500 text-white rounded-xl hover:shadow-lg transition transform hover:scale-105 font-bold mb-3 ${isSubmitting ? 'opacity-70 cursor-not-allowed' : ''}`}
                                    disabled={isSubmitting} 
                                >
                                    {isSubmitting ? 'Đang đặt hàng...' : 'Đặt hàng ngay'}
                                </button>
                                <button
                                    onClick={() => navigate("/cart")}
                                    className="w-full py-3 bg-gray-100 text-gray-700 rounded-xl hover:bg-gray-200 transition font-semibold"
                                >
                                    Quay lại giỏ hàng
                                </button>

                               
                            </div>
                        </div>
                    </div>
                )}
            </main>

            <Footer />
        </div>
    );
}

export default Checkout;