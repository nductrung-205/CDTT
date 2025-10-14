import React, { useState, useEffect } from "react";
import { Link, useNavigate } from "react-router-dom";
import { getProducts } from "../api";
import { useCart } from "../context/CartContext";
import { useAuth } from "../context/AuthContext";

export default function Header() {
  const [keyword, setKeyword] = useState("");
  const [allProducts, setAllProducts] = useState([]);
  const [suggestions, setSuggestions] = useState([]);
  const [openMenu, setOpenMenu] = useState(false);
  const [scrolled, setScrolled] = useState(false);
  
  const navigate = useNavigate();
  const { cart } = useCart();
  const { user, logout } = useAuth();

  const totalItems = cart.reduce((sum, item) => sum + item.quantity, 0);

  useEffect(() => {
    getProducts().then((res) => setAllProducts(res.data));
    
    const handleScroll = () => {
      setScrolled(window.scrollY > 20);
    };
    window.addEventListener("scroll", handleScroll);
    return () => window.removeEventListener("scroll", handleScroll);
  }, []);

  const handleSearch = (e) => {
    e.preventDefault();
    if (keyword.trim() !== "") {
      navigate(`/products?search=${encodeURIComponent(keyword)}`);
      setKeyword("");
      setSuggestions([]);
    }
  };

  const handleChange = (e) => {
    const value = e.target.value;
    setKeyword(value);

    if (value.trim() === "") {
      setSuggestions([]);
    } else {
      const filtered = allProducts.filter((p) =>
        p.name.toLowerCase().includes(value.toLowerCase())
      );
      setSuggestions(filtered.slice(0, 5));
    }
  };

  return (
    <header 
      className={`sticky top-0 z-50 transition-all duration-300 ${
        scrolled 
          ? "bg-white shadow-lg" 
          : "bg-gradient-to-r from-orange-500 to-red-500"
      }`}
    >
      <div className="max-w-7xl mx-auto px-4 py-4">
        <div className="flex justify-between items-center gap-6">
         
          <Link 
            to="/" 
            className={`text-2xl font-bold tracking-tight flex items-center gap-2 transition-colors ${
              scrolled ? "text-orange-600" : "text-white"
            }`}
          >
            <span className="text-3xl">🍜</span>
            <span className="hidden md:block">Nguyễn Đức Trung</span>
          </Link>

    
          <div className="relative flex-1 max-w-2xl">
            <form onSubmit={handleSearch} className="flex">
              <input
                type="text"
                placeholder="Tìm món ăn yêu thích..."
                value={keyword}
                onChange={handleChange}
                className={`w-full px-4 py-2.5 rounded-l-full outline-none transition-all ${
                  scrolled 
                    ? "bg-gray-100 text-gray-800 focus:bg-white focus:ring-2 focus:ring-orange-500" 
                    : "bg-white/90 text-gray-800 focus:bg-white"
                }`}
              />
              <button
                type="submit"
                className={`px-6 py-2.5 rounded-r-full font-semibold transition-all ${
                  scrolled
                    ? "bg-orange-500 text-white hover:bg-orange-600"
                    : "bg-orange-700 text-white hover:bg-orange-800"
                }`}
              >
                🔍
              </button>
            </form>

        
            {suggestions.length > 0 && (
              <ul className="absolute z-50 bg-white text-gray-800 mt-2 w-full rounded-xl shadow-2xl border border-gray-100 max-h-80 overflow-y-auto">
                {suggestions.map((p) => (
                  <li
                    key={p.id}
                    className="px-4 py-3 hover:bg-orange-50 cursor-pointer transition border-b last:border-b-0 flex items-center gap-3"
                    onClick={() => {
                      navigate(`/products/${p.id}`);
                      setKeyword("");
                      setSuggestions([]);
                    }}
                  >
                    <img 
                      src={p.image_url} 
                      alt={p.name}
                      className="w-12 h-12 object-cover rounded-lg"
                    />
                    <div className="flex-1">
                      <p className="font-semibold text-gray-800">{p.name}</p>
                      <p className="text-sm text-orange-600">{p.price.toLocaleString()}₫</p>
                    </div>
                  </li>
                ))}
              </ul>
            )}
          </div>

         
          <nav className="flex items-center gap-1">
            <Link 
              to="/" 
              className={`px-4 py-2 rounded-lg font-medium transition-all ${
                scrolled 
                  ? "text-gray-700 hover:bg-orange-50 hover:text-orange-600" 
                  : "text-white hover:bg-white/20"
              }`}
            >
              Trang chủ
            </Link>
            <Link 
              to="/menu" 
              className={`px-4 py-2 rounded-lg font-medium transition-all ${
                scrolled 
                  ? "text-gray-700 hover:bg-orange-50 hover:text-orange-600" 
                  : "text-white hover:bg-white/20"
              }`}
            >
              Thực đơn
            </Link>

         
            <Link 
              to="/cart" 
              className={`relative px-4 py-2 rounded-lg font-medium transition-all ${
                scrolled 
                  ? "text-gray-700 hover:bg-orange-50 hover:text-orange-600" 
                  : "text-white hover:bg-white/20"
              }`}
            >
              🛒 Giỏ hàng
              {totalItems > 0 && (
                <span className="absolute -top-1 -right-1 bg-red-500 text-white text-xs w-6 h-6 rounded-full flex items-center justify-center font-bold animate-pulse">
                  {totalItems}
                </span>
              )}
            </Link>

         
            {!user ? (
              <>
                <Link 
                  to="/login" 
                  className={`px-4 py-2 rounded-lg font-medium transition-all ${
                    scrolled 
                      ? "text-gray-700 hover:bg-orange-50 hover:text-orange-600" 
                      : "text-white hover:bg-white/20"
                  }`}
                >
                  Đăng nhập
                </Link>
                <Link 
                  to="/register" 
                  className={`px-5 py-2 rounded-full font-semibold transition-all ${
                    scrolled
                      ? "bg-orange-500 text-white hover:bg-orange-600"
                      : "bg-white text-orange-600 hover:bg-orange-50"
                  }`}
                >
                  Đăng ký
                </Link>
              </>
            ) : (
              <div className="relative">
                <button
                  onClick={() => setOpenMenu(!openMenu)}
                  className={`flex items-center gap-2 px-4 py-2 rounded-lg font-medium transition-all ${
                    scrolled 
                      ? "text-gray-700 hover:bg-orange-50" 
                      : "text-white hover:bg-white/20"
                  }`}
                >
                  <div className={`w-8 h-8 rounded-full flex items-center justify-center font-bold ${
                    scrolled ? "bg-orange-500 text-white" : "bg-white text-orange-600"
                  }`}>
                    {user.fullname?.charAt(0).toUpperCase() || "U"}
                  </div>
                  <span className="hidden md:block">{user.fullname || user.email}</span>
                </button>

                {openMenu && (
                  <div className="absolute right-0 mt-2 bg-white rounded-xl shadow-2xl w-56 border border-gray-100 overflow-hidden">
                    <div className="p-4 bg-gradient-to-r from-orange-50 to-red-50 border-b">
                      <p className="font-semibold text-gray-800">{user.fullname}</p>
                      <p className="text-sm text-gray-600">{user.email}</p>
                    </div>
                    
                    <Link
                      to="/profile"
                      className="block px-4 py-3 hover:bg-orange-50 transition text-gray-700"
                      onClick={() => setOpenMenu(false)}
                    >
                      👤 Tài khoản của tôi
                    </Link>
                    
                    <Link
                      to="/orders"
                      className="block px-4 py-3 hover:bg-orange-50 transition text-gray-700"
                      onClick={() => setOpenMenu(false)}
                    >
                      📦 Đơn hàng của tôi
                    </Link>

                    {user.role === 0 && (
                      <Link
                        to="/admin"
                        className="block px-4 py-3 hover:bg-orange-50 transition text-gray-700 border-t"
                        onClick={() => setOpenMenu(false)}
                      >
                        ⚙️ Quản trị
                      </Link>
                    )}

                    <button
                      onClick={() => {
                        logout();
                        setOpenMenu(false);
                        navigate("/");
                      }}
                      className="block w-full text-left px-4 py-3 hover:bg-red-50 transition text-red-600 border-t font-semibold"
                    >
                      🚪 Đăng xuất
                    </button>
                  </div>
                )}
              </div>
            )}
          </nav>
        </div>
      </div>
    </header>
  );
}