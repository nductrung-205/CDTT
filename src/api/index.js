import axios from "axios";

const API = axios.create({
  baseURL: process.env.REACT_APP_API_URL,
  headers: {
    "Content-Type": "application/json",
    Accept: "application/json",
  },
  withCredentials: true,
});


API.interceptors.request.use(
  (config) => {
    const token = localStorage.getItem("token");
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
  },
  (error) => {
    return Promise.reject(error);
  }
);


API.interceptors.response.use(
  (response) => {
    return response;
  },
  (error) => {
    const url = error.config?.url || 'unknown';
    const status = error.response?.status || 'no response';

    console.error(`❌ [${url}] ${status}`);


    if (error.response?.status === 401) {
      console.warn('⚠️  Unauthorized - Token invalid/expired');

      if (!url.includes('/login')) {
        localStorage.removeItem("token");
        localStorage.removeItem("user");
        window.location.href = "/login";
      }
    }

    return Promise.reject(error);
  }
);

export const uploadImage = (imageFile) => {
  const formData = new FormData();
  formData.append("image", imageFile); // 'image' phải khớp với tên trường trong backend validation ('image' => 'required|image|...')

  return API.post("/images/upload", formData, {
    headers: {
      "Content-Type": "multipart/form-data", // Quan trọng: Phải là multipart/form-data khi gửi file
    },
  });
};

export const getCategories = () => API.get("/categories");
export const getCategoryDetail = (id) => API.get(`/categories/${id}`);
export const createCategory = (data) => API.post("/admin/categories", data);
export const updateCategory = (id, data) => API.put(`/admin/categories/${id}`, data);
export const deleteCategory = (id) => API.delete(`/admin/categories/${id}`);


export const getProducts = () => API.get("/products");
export const getProductDetail = (id) => API.get(`/products/${id}`);
export const createProduct = (data) => API.post("/admin/products", data);
export const updateProduct = (id, data) => API.put(`/admin/products/${id}`, data);
export const deleteProduct = (id) => API.delete(`/admin/products/${id}`);


export const createOrder = (data) => API.post("/orders", data);
export const getOrderDetail = (id) => API.get(`/orders/${id}`);
export const cancelOrder = (id) => API.put(`/orders/${id}/cancel`);

export const getMyOrders = async () => {
  try {
    const response = await API.get("/orders/my-orders");
    console.log("📦 Raw API response:", response.data);

    const orders = Array.isArray(response.data) ? response.data : [];
    console.log("📦 Processed orders:", orders);

    return orders;
  } catch (error) {
    console.error("❌ Error in getMyOrders:", error);
    throw error;
  }
};

export const deleteOrder = (id) => API.delete(`/admin/orders/${id}`);
export const getAdminOrders = () => API.get("/admin/orders");
export const getAdminOrderDetail = (id) => API.get(`/admin/orders/${id}`);
export const updateOrderStatus = (id, status) => API.put(`/admin/orders/${id}/status`, { status });

export const postComment = (data) => API.post("/comments", data);
export const postReview = (data) => API.post("/reviews", data);


export const loginUser = (data) => API.post("/login", data);
export const registerUser = (data) => API.post("/register", data);
export const logoutUser = () => API.post("/logout");
export const getProfile = () => API.get("/me");
export const changePassword = () => API.post("/changePassword");


export const getUsers = () => API.get("/admin/users");
export const getUserDetail = (id) => API.get(`/admin/users/${id}`);
export const createUser = (data) => API.post("/admin/users", data);
export const updateUser = (id, data) => API.put(`/admin/users/${id}`, data);
export const deleteUser = (id) => API.delete(`/admin/users/${id}`);
export const updateUserRole = (id, role) => API.put(`/admin/users/${id}/role`, { role });

export default API;