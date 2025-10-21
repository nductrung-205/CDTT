import React, { useEffect, useState } from "react";
import { getProducts } from "../api";
import Header from "../components/Header";
import Footer from "../components/Footer";
import Carousel from "../components/Carousel";
import { Link, useNavigate } from "react-router-dom";
import { useCart } from "../context/CartContext";

function Home() {
  const [products, setProducts] = useState([]);
  const [loading, setLoading] = useState(true);
  const { addToCart } = useCart();
  const navigate = useNavigate();

  useEffect(() => {
    getProducts()
      .then((res) => {
        const productsData = Array.isArray(res.data)
          ? res.data
          : res.data?.data || [];
        console.log("🍜 Products loaded:", productsData.length);
        setProducts(productsData);
        setLoading(false);
      })
      .catch((err) => {
        console.error("❌ Lỗi khi lấy sản phẩm:", err);
        setProducts([]);
        setLoading(false);
      });
  }, []);

  const featuredProducts = products.slice(0, 8);

  return (
    <div className="min-h-screen bg-gray-50">
      <Header />

      <main className="max-w-7xl mx-auto px-4 py-8">
        <Carousel />

        {/* --- Danh mục món ăn --- */}
        <section className="mt-16 mb-12">
          <h2 className="text-3xl font-bold text-center text-gray-800 mb-8">
            🍽️ Danh mục món ăn
          </h2>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-6">
            {[
              { name: "Món chính", icon: "🍛", color: "from-orange-400 to-red-400" },
              { name: "Món phụ", icon: "🍟", color: "from-yellow-400 to-orange-400" },
              { name: "Tráng miệng", icon: "🍰", color: "from-green-400 to-emerald-400" },
              { name: "Đồ uống", icon: "🍹", color: "from-blue-400 to-cyan-400" },
            ].map((cat) => (
              <Link
                key={cat.name}
                to="/menu"
                className={`bg-gradient-to-br ${cat.color} rounded-2xl p-6 text-center text-white hover:shadow-xl transition transform hover:scale-105`}
              >
                <div className="text-5xl mb-3">{cat.icon}</div>
                <p className="font-bold text-lg">{cat.name}</p>
              </Link>
            ))}
          </div>
        </section>

        {/* --- Món ăn nổi bật --- */}
        <section className="mb-16">
          <div className="flex items-center justify-between mb-8">
            <h2 className="text-3xl font-bold text-gray-800">⭐ Món ăn nổi bật</h2>
            <Link
              to="/menu"
              className="px-6 py-2 bg-orange-500 text-white rounded-full hover:bg-orange-600 transition font-semibold"
            >
              Xem tất cả →
            </Link>
          </div>

          {loading ? (
            // Hiển thị khung loading
            <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6">
              {[...Array(8)].map((_, i) => (
                <div key={i} className="bg-white rounded-2xl shadow-md animate-pulse">
                  <div className="w-full h-48 bg-gray-200 rounded-t-2xl"></div>
                  <div className="p-4 space-y-3">
                    <div className="h-4 bg-gray-200 rounded"></div>
                    <div className="h-4 bg-gray-200 rounded w-2/3"></div>
                  </div>
                </div>
              ))}
            </div>
          ) : (
            // Hiển thị sản phẩm
            <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6">
              {featuredProducts.map((p) => (
                <div
                  key={p.id}
                  className="bg-white rounded-2xl shadow-md hover:shadow-xl transition duration-300 group overflow-hidden"
                >
                  <Link
                    to={`/products/${p.id}`}
                    className="block relative overflow-hidden"
                  >
                    <img
                      src={p.image || "/no-image.png"}
                      alt={p.name}
                      className="w-full h-48 object-cover group-hover:scale-110 transition duration-500"
                    />
                    <div className="absolute top-3 right-3 bg-orange-500 text-white px-3 py-1 rounded-full text-sm font-bold">
                      Hot
                    </div>
                  </Link>

                  <div className="p-4">
                    <Link to={`/products/${p.id}`}>
                      <h3 className="text-lg font-bold text-gray-800 mb-1 group-hover:text-orange-600 transition line-clamp-1">
                        {p.name}
                      </h3>
                    </Link>

                    <p className="text-sm text-gray-500 mb-2 line-clamp-1">
                      {p.category?.name || "Chưa phân loại"}
                    </p>

                    <div className="flex items-center justify-between mb-4">
                      <p className="text-orange-600 font-bold text-xl">
                        {p.price.toLocaleString()}₫
                      </p>
                      <div className="flex items-center gap-1 text-yellow-500">
                        <span>⭐</span>
                        <span className="text-sm text-gray-600 font-semibold">4.8</span>
                      </div>
                    </div>

                    <button
                      className="w-full py-2.5 bg-gradient-to-r from-orange-500 to-red-500 text-white rounded-xl hover:shadow-lg transition transform hover:scale-105 font-semibold"
                      onClick={() => {
                        addToCart({ ...p, quantity: 1 });
                        navigate("/cart");
                      }}
                    >
                      🛒 Thêm vào giỏ
                    </button>
                  </div>
                </div>
              ))}
            </div>
          )}
        </section>

        {/* --- Ưu điểm dịch vụ --- */}
        <section className="mb-16">
          <div className="grid md:grid-cols-3 gap-8">
            {[
              {
                icon: "🚚",
                title: "Giao hàng nhanh",
                desc: "Giao hàng trong 30 phút hoặc miễn phí",
                bg: "bg-orange-100",
              },
              {
                icon: "✓",
                title: "Chất lượng đảm bảo",
                desc: "Nguyên liệu tươi mới, vệ sinh an toàn",
                bg: "bg-green-100",
              },
              {
                icon: "💰",
                title: "Giá tốt nhất",
                desc: "Nhiều ưu đãi và khuyến mãi hấp dẫn",
                bg: "bg-blue-100",
              },
            ].map((item) => (
              <div
                key={item.title}
                className="bg-white rounded-2xl p-6 text-center shadow-md hover:shadow-xl transition"
              >
                <div
                  className={`w-16 h-16 ${item.bg} rounded-full flex items-center justify-center mx-auto mb-4`}
                >
                  <span className="text-3xl">{item.icon}</span>
                </div>
                <h3 className="font-bold text-lg mb-2">{item.title}</h3>
                <p className="text-gray-600 text-sm">{item.desc}</p>
              </div>
            ))}
          </div>
        </section>

        {/* --- Ưu đãi đặc biệt --- */}
        <section className="mb-16">
          <div className="bg-gradient-to-r from-orange-500 to-red-500 rounded-2xl p-12 text-center text-white">
            <h2 className="text-3xl font-bold mb-4">Đăng ký nhận ưu đãi đặc biệt</h2>
            <p className="text-lg mb-6">
              Giảm giá 20% cho đơn hàng đầu tiên khi đăng ký ngay hôm nay!
            </p>
            <Link
              to="/register"
              className="inline-block px-8 py-3 bg-white text-orange-600 rounded-full font-bold hover:bg-gray-100 transition"
            >
              Đăng ký ngay
            </Link>
          </div>
        </section>
      </main>

      <Footer />
    </div>
  );
}

export default Home;
