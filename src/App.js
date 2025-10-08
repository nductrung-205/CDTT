import { BrowserRouter, Routes, Route } from 'react-router-dom';
import Home from './pages/Home';
import Dashboard from './admin/Dashboard';
import Products from './admin/Products';
import Orders from './admin/Orders';
import EditProduct from './admin/products/edit/id/EditProduct';
import AddProduct from './admin/products/add/AddProduct';
import ProductDetail from './pages/ProductDetail';
import { CartProvider } from './context/CartContext';
import Cart from './pages/Cart';
import ProductList from './pages/ProductList';
import Checkout from './pages/Checkout';
import OrderSuccess from './pages/OrderSuccess';

import OrderDetail from "./pages/OrderDetail";
import Menu from './pages/Menu';
import { AuthProvider } from './context/AuthContext';
import Login from './pages/Login';
import Register from './pages/Register';
import Profile from './pages/Profile';
import Users from './admin/Users';
import AdminRoute from './components/AdminRoute';
import ProtectedRoute from './components/ProtectedRoute';
import AdminLogin from './admin/AdminLogin';
import MyOrders from './pages/MyOrders';
import AddUser from './admin/users/add/AddUser';
import EditUser from './admin/users/edit/id/EditUser';
import AddOrder from './admin/orders/add/AddOrder';
import EditOrder from './admin/orders/edit/id/EditOrder';

function App() {
  return (
    <AuthProvider>
      <CartProvider>
        <BrowserRouter>
          <Routes>

            <Route path="/" element={<Home />} />
            <Route path="/products" element={<ProductList />} />
            <Route path="/products/:id" element={<ProductDetail />} />
            <Route path="/cart" element={<Cart />} />
            <Route path="/menu" element={<Menu />} />
            <Route path="/login" element={<Login />} />
            <Route path="/register" element={<Register />} />
            <Route path="/success" element={<OrderSuccess />} />


            <Route
              path="/profile"
              element={
                <ProtectedRoute>
                  <Profile />
                </ProtectedRoute>
              }
            />
            <Route
              path="/checkout"
              element={
                <ProtectedRoute>
                  <Checkout />
                </ProtectedRoute>
              }
            />
            <Route
              path="/orders"
              element={
                <ProtectedRoute>
                  <MyOrders />
                </ProtectedRoute>
              }
            />
            <Route
              path="/orders/:id"
              element={
                <ProtectedRoute>
                  <OrderDetail />
                </ProtectedRoute>
              }
            />


            <Route path="/admin/login" element={<AdminLogin />} />

            <Route
              path="/admin"
              element={
                <AdminRoute>
                  <Dashboard />
                </AdminRoute>
              }
            />
            <Route
              path="/admin/products"
              element={
                <AdminRoute>
                  <Products />
                </AdminRoute>
              }
            />
            <Route
              path="/admin/products/add"
              element={
                <AdminRoute>
                  <AddProduct />
                </AdminRoute>
              }
            />
            <Route
              path="/admin/products/edit/:id"
              element={
                <AdminRoute>
                  <EditProduct />
                </AdminRoute>
              }

            />
            <Route
              path="/admin/users/add"
              element={
                <AdminRoute>
                  <AddUser />
                </AdminRoute>
              }
            />
            <Route
              path="/admin/users/edit/:id"
              element={
                <AdminRoute>
                  <EditUser />
                </AdminRoute>
              }
            />
            <Route
              path="/admin/orders"
              element={
                <AdminRoute>
                  <Orders />
                </AdminRoute>
              }
            />

            <Route
              path="/admin/orders/add"
              element={
                <AdminRoute>
                  < AddOrder/>
                </AdminRoute>
              }
            />
            <Route
              path="/admin/orders/edit/:id"
              element={
                <AdminRoute>
                  <EditOrder />
                </AdminRoute>
              }
            />

            <Route
              path="/admin/orders/:id"
              element={
                <AdminRoute>
                  <OrderDetail />
                </AdminRoute>
              }
            />
            <Route
              path="/admin/users"
              element={
                <AdminRoute>
                  <Users />
                </AdminRoute>
              }
            />
          </Routes>

        </BrowserRouter>
      </CartProvider>
    </AuthProvider>
  );
}

export default App;