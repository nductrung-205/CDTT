import React, { useEffect, useState } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { getProductDetail } from "../api";
import { useCart } from "../context/CartContext";
import Header from "../components/Header";
import Footer from "../components/Footer";

function ProductDetail() {
  const { id } = useParams();
  const [product, setProduct] = useState(null);
  const [quantity, setQuantity] = useState(1);
  const { addToCart } = useCart();
  const navigate = useNavigate();

  useEffect(() => {
    getProductDetail(id).then((res) => setProduct(res.data));
  }, [id]);

  if (!product) {
    return (
      <>
        <Header />
        <div className="flex items-center justify-center min-h-screen bg-gray-50">
          <div className="text-center">
            <div className="inline-block animate-spin rounded-full h-12 w-12 border-b-2 border-orange-500 mb-4"></div>
            <p className="text-gray-600 text-lg">Đang tải...</p>
          </div>
        </div>
        <Footer />
      </>
    );
  }

  const handleAddToCart = () => {
    addToCart({ ...product, quantity });
    
  };

  const handleBuyNow = () => {
    addToCart({ ...product, quantity });
    navigate("/cart");
  };

  const totalPrice = product.price * quantity;

  return (
    <>
      <Header />
      <div className="bg-gradient-to-b from-orange-50 to-white min-h-screen">
       
        <div className="max-w-7xl mx-auto px-4 py-4">
          <div className="flex items-center gap-2 text-sm text-gray-600">
            <span 
              onClick={() => navigate("/")} 
              className="hover:text-orange-600 cursor-pointer"
            >
              Trang chủ
            </span>
            <span>/</span>
            <span 
              onClick={() => navigate("/menu")} 
              className="hover:text-orange-600 cursor-pointer"
            >
              Thực đơn
            </span>
            <span>/</span>
            <span className="text-orange-600 font-medium">{product.name}</span>
          </div>
        </div>

       
        <div className="max-w-7xl mx-auto px-4 pb-16">
          <div className="bg-white rounded-2xl shadow-xl overflow-hidden">
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-0">
            
              <div className="relative bg-gradient-to-br from-orange-100 to-orange-50 p-8 lg:p-12">
                <div className="relative">
                  <img
                    src={product.image_url}
                    alt={product.name}
                    className="w-full h-[400px] lg:h-[500px] object-cover rounded-2xl shadow-2xl transform hover:scale-105 transition-transform duration-300"
                  />
                
                  {product.isNew && (
                    <div className="absolute top-4 left-4 bg-red-500 text-white px-3 py-1 rounded-full text-sm font-bold shadow-lg">
                      🔥 MỚI
                    </div>
                  )}
                  {product.discount && (
                    <div className="absolute top-4 right-4 bg-green-500 text-white px-3 py-1 rounded-full text-sm font-bold shadow-lg">
                      -{product.discount}%
                    </div>
                  )}
                </div>
              </div>

             
              <div className="p-8 lg:p-12 flex flex-col">
               
                <div className="mb-6">
                  <h1 className="text-4xl lg:text-5xl font-bold text-gray-900 mb-3">
                    {product.name}
                  </h1>
                  <div className="flex items-center gap-4 text-sm">
                 
                    <div className="flex items-center gap-1">
                      <span className="text-yellow-400">★★★★★</span>
                      <span className="text-gray-600">(4.8)</span>
                    </div>
                    
                    <span className="text-gray-500">• 1.2k+ đã đặt</span>
                  </div>
                </div>

                
                <div className="mb-6 bg-orange-50 rounded-xl p-4 border-2 border-orange-200">
                  <div className="flex items-baseline gap-3">
                    <span className="text-4xl font-bold text-orange-600">
                      {product.price.toLocaleString()}₫
                    </span>
                    {product.originalPrice && (
                      <span className="text-xl text-gray-400 line-through">
                        {product.originalPrice.toLocaleString()}₫
                      </span>
                    )}
                  </div>
                </div>

                <div className="mb-6 flex-grow">
                  <h3 className="text-lg font-semibold text-gray-900 mb-3">Mô tả món ăn</h3>
                  <p className="text-gray-600 leading-relaxed">
                    {product.description}
                  </p>
          
                  <div className="mt-4 grid grid-cols-2 gap-3">
                    <div className="flex items-center gap-2 text-sm text-gray-600">
                      <span>⏱️</span>
                      <span>Thời gian: 15-20 phút</span>
                    </div>
                    <div className="flex items-center gap-2 text-sm text-gray-600">
                      <span>🍽️</span>
                      <span>Phục vụ: 1-2 người</span>
                    </div>
                  </div>
                </div>

            
                <div className="mb-6 bg-gray-50 rounded-xl p-5">
                  <label className="block text-sm font-semibold text-gray-700 mb-3">
                    Số lượng
                  </label>
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-4 bg-white rounded-lg border-2 border-gray-200 p-1">
                      <button
                        onClick={() => setQuantity((q) => Math.max(1, q - 1))}
                        className="w-10 h-10 flex items-center justify-center bg-gray-100 rounded-lg hover:bg-orange-100 hover:text-orange-600 font-bold text-xl transition-colors"
                      >
                        −
                      </button>
                      <span className="text-2xl font-bold text-gray-900 w-12 text-center">
                        {quantity}
                      </span>
                      <button
                        onClick={() => setQuantity((q) => q + 1)}
                        className="w-10 h-10 flex items-center justify-center bg-gray-100 rounded-lg hover:bg-orange-100 hover:text-orange-600 font-bold text-xl transition-colors"
                      >
                        +
                      </button>
                    </div>
                    
                    <div className="text-right">
                      <p className="text-sm text-gray-500">Tạm tính</p>
                      <p className="text-2xl font-bold text-orange-600">
                        {totalPrice.toLocaleString()}₫
                      </p>
                    </div>
                  </div>
                </div>

             
                <div className="flex flex-col sm:flex-row gap-3">
                  <button
                    onClick={handleAddToCart}
                    className="flex-1 px-6 py-4 bg-white border-2 border-orange-500 text-orange-600 rounded-xl hover:bg-orange-50 font-bold text-lg transition-all transform hover:scale-105 active:scale-95 shadow-md"
                  >
                    <span className="flex items-center justify-center gap-2">
                      <span className="text-2xl">🛒</span>
                      Thêm vào giỏ
                    </span>
                  </button>
                  <button
                    onClick={handleBuyNow}
                    className="flex-1 px-6 py-4 bg-gradient-to-r from-orange-500 to-red-500 text-white rounded-xl hover:from-orange-600 hover:to-red-600 font-bold text-lg transition-all transform hover:scale-105 active:scale-95 shadow-lg"
                  >
                    <span className="flex items-center justify-center gap-2">
                      <span className="text-2xl">⚡</span>
                      Mua ngay
                    </span>
                  </button>
                </div>

              
                <div className="mt-6 grid grid-cols-3 gap-3 pt-6 border-t border-gray-200">
                  <div className="text-center">
                    <div className="text-2xl mb-1">✓</div>
                    <p className="text-xs text-gray-600">Tươi ngon</p>
                  </div>
                  <div className="text-center">
                    <div className="text-2xl mb-1">🚚</div>
                    <p className="text-xs text-gray-600">Giao nhanh</p>
                  </div>
                  <div className="text-center">
                    <div className="text-2xl mb-1">💯</div>
                    <p className="text-xs text-gray-600">Đảm bảo</p>
                  </div>
                </div>
              </div>
            </div>
          </div>

          <div className="mt-12">
            <h2 className="text-2xl font-bold text-gray-900 mb-6">Món ăn tương tự</h2>
            <div className="text-center text-gray-500 py-8 bg-white rounded-xl">
              Đang cập nhật...
            </div>
          </div>
        </div>
      </div>

      <Footer />
    </>
  );
}

export default ProductDetail;