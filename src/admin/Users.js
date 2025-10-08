import React, { useEffect, useState } from "react";
import { Search, UserPlus, Shield, User, Trash2, Edit } from "lucide-react";
import { useNavigate } from "react-router-dom";
import { getUsers, deleteUser, updateUser } from "../api";

export default function Users() {
  const [users, setUsers] = useState([]);
  const [filteredUsers, setFilteredUsers] = useState([]);
  const [message, setMessage] = useState("");
  const [filterRole, setFilterRole] = useState("all");
  const [searchTerm, setSearchTerm] = useState("");
  const [loading, setLoading] = useState(true);
  const navigate = useNavigate();

  const fetchUsers = async () => {
    try {
      setLoading(true);
      const response = await getUsers();
      const data = response.data;
      setUsers(Array.isArray(data) ? data : []);
      setFilteredUsers(Array.isArray(data) ? data : []);
    } catch (err) {
      console.error("Error fetching users:", err);
      setUsers([]);
      setFilteredUsers([]);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchUsers();
  }, []);

  useEffect(() => {
    let result = [...users];

    if (filterRole !== "all") {
      result = result.filter((u) => u.role === parseInt(filterRole));
    }

    if (searchTerm) {
      result = result.filter(
        (u) =>
          u.fullname.toLowerCase().includes(searchTerm.toLowerCase()) ||
          u.email.toLowerCase().includes(searchTerm.toLowerCase())
      );
    }

    setFilteredUsers(result);
  }, [filterRole, searchTerm, users]);

  const handleDelete = async (id) => {
    if (window.confirm("Bạn có chắc chắn muốn xóa người dùng này?")) {
      try {
        await deleteUser(id);
        fetchUsers();
        setMessage("✅ Xóa người dùng thành công!");
        setTimeout(() => setMessage(""), 3000);
      } catch (err) {
        console.error("Error deleting user:", err);
        setMessage("❌ Lỗi khi xóa người dùng!");
        setTimeout(() => setMessage(""), 3000);
      }
    }
  };

  const handleRoleChange = async (id, newRole) => {
    try {
      await updateUser(id, { role: newRole });
      fetchUsers();
      setMessage("✅ Cập nhật quyền thành công!");
      setTimeout(() => setMessage(""), 3000);
    } catch (err) {
      console.error("Error updating role:", err);
      setMessage("❌ Lỗi khi cập nhật quyền!");
      setTimeout(() => setMessage(""), 3000);
    }
  };

  const getRoleConfig = (role) => {
    if (role === 0) {
      return {
        label: "Admin",
        color: "bg-purple-100 text-purple-800 border-purple-200",
        icon: <Shield size={14} />,
      };
    }
    return {
      label: "User",
      color: "bg-blue-100 text-blue-800 border-blue-200",
      icon: <User size={14} />,
    };
  };

  const formatDate = (dateString) => {
    return new Date(dateString).toLocaleDateString("vi-VN");
  };

  const getStatistics = () => {
    return {
      total: users.length,
      admins: users.filter((u) => u.role === 0).length,
      customers: users.filter((u) => u.role === 1).length,
    };
  };

  const stats = getStatistics();

  return (
    <div className="min-h-screen bg-gray-50 p-6">
      <div className="max-w-7xl mx-auto">
        {/* Header */}
        <div className="flex justify-between items-start mb-6">
          <div>
            <h1 className="text-3xl font-bold text-gray-800 mb-2">Quản lý người dùng</h1>
            <p className="text-gray-600">Quản lý tài khoản và phân quyền người dùng</p>
          </div>
          <button
            onClick={() => navigate("/admin/users/add")}
            className="px-4 py-2.5 bg-gradient-to-r from-orange-500 to-red-500 text-white rounded-lg hover:shadow-lg transition flex items-center gap-2"
          >
            <UserPlus size={18} />
            Thêm người dùng
          </button>
        </div>

        {/* Statistics Cards */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-6">
          <div className="bg-gradient-to-br from-blue-500 to-cyan-600 rounded-xl shadow-lg p-6 text-white">
            <p className="text-sm opacity-90 mb-1">Tổng người dùng</p>
            <p className="text-3xl font-bold">{stats.total}</p>
          </div>
          <div className="bg-gradient-to-br from-purple-500 to-pink-600 rounded-xl shadow-lg p-6 text-white">
            <p className="text-sm opacity-90 mb-1">Quản trị viên</p>
            <p className="text-3xl font-bold">{stats.admins}</p>
          </div>
          <div className="bg-gradient-to-br from-green-500 to-emerald-600 rounded-xl shadow-lg p-6 text-white">
            <p className="text-sm opacity-90 mb-1">Khách hàng</p>
            <p className="text-3xl font-bold">{stats.customers}</p>
          </div>
        </div>

        {message && (
          <div className="mb-4 p-4 bg-green-50 border border-green-200 text-green-700 rounded-lg">
            {message}
          </div>
        )}

        {/* Filters */}
        <div className="bg-white rounded-xl shadow-sm p-6 mb-6">
          <div className="flex flex-wrap gap-4">
            <div className="flex-1 min-w-[300px]">
              <div className="relative">
                <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" size={20} />
                <input
                  type="text"
                  placeholder="Tìm theo tên hoặc email..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="w-full pl-10 pr-4 py-2.5 border border-gray-300 rounded-lg focus:ring-2 focus:ring-orange-500 focus:border-transparent"
                />
              </div>
            </div>

            <select
              value={filterRole}
              onChange={(e) => setFilterRole(e.target.value)}
              className="px-4 py-2.5 border border-gray-300 rounded-lg focus:ring-2 focus:ring-orange-500 focus:border-transparent"
            >
              <option value="all">Tất cả quyền</option>
              <option value="0">Admin</option>
              <option value="1">User</option>
            </select>
          </div>
        </div>

        {/* Users Table */}
        <div className="bg-white rounded-xl shadow-sm overflow-hidden">
          {loading ? (
            <div className="p-12 text-center">
              <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-orange-500 mx-auto"></div>
              <p className="mt-4 text-gray-500">Đang tải...</p>
            </div>
          ) : filteredUsers.length === 0 ? (
            <div className="p-12 text-center">
              <div className="text-6xl mb-4">👤</div>
              <p className="text-gray-500">Không tìm thấy người dùng nào</p>
            </div>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead className="bg-gray-50 border-b border-gray-200">
                  <tr>
                    <th className="px-6 py-4 text-left text-xs font-semibold text-gray-600 uppercase">ID</th>
                    <th className="px-6 py-4 text-left text-xs font-semibold text-gray-600 uppercase">Họ tên</th>
                    <th className="px-6 py-4 text-left text-xs font-semibold text-gray-600 uppercase">Email</th>
                    <th className="px-6 py-4 text-left text-xs font-semibold text-gray-600 uppercase">Quyền</th>
                    <th className="px-6 py-4 text-left text-xs font-semibold text-gray-600 uppercase">Ngày tạo</th>
                    <th className="px-6 py-4 text-left text-xs font-semibold text-gray-600 uppercase">Thao tác</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-100">
                  {filteredUsers.map((user) => {
                    const roleConfig = getRoleConfig(user.role);
                    return (
                      <tr key={user.id} className="hover:bg-gray-50 transition">
                        <td className="px-6 py-4 font-bold text-gray-800">#{user.id}</td>
                        <td className="px-6 py-4">
                          <div className="flex items-center gap-3">
                            <div className="w-10 h-10 bg-gradient-to-br from-orange-400 to-red-500 rounded-full flex items-center justify-center text-white font-bold">
                              {user.fullname.charAt(0).toUpperCase()}
                            </div>
                            <span className="font-semibold text-gray-800">{user.fullname}</span>
                          </div>
                        </td>
                        <td className="px-6 py-4 text-sm text-gray-600">{user.email}</td>
                        <td className="px-6 py-4">
                          <select
                            value={user.role}
                            onChange={(e) => handleRoleChange(user.id, parseInt(e.target.value))}
                            className={`px-3 py-1.5 rounded-lg text-xs font-semibold border ${roleConfig.color} focus:ring-2 focus:ring-orange-500`}
                          >
                            <option value={0}>Admin</option>
                            <option value={1}>User</option>
                          </select>
                        </td>
                        <td className="px-6 py-4 text-sm text-gray-600">{formatDate(user.created_at)}</td>
                        <td className="px-6 py-4">
                          <div className="flex items-center gap-2">
                            <button
                              onClick={() => navigate(`/admin/users/edit/${user.id}`)}
                              className="p-2 text-orange-600 hover:bg-orange-50 rounded-lg transition"
                            >
                              <Edit size={18} />
                            </button>
                            <button
                              onClick={() => handleDelete(user.id)}
                              className="p-2 text-red-600 hover:bg-red-50 rounded-lg transition"
                            >
                              <Trash2 size={18} />
                            </button>
                          </div>
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>
          )}
        </div>

        {/* Back Button */}
        <div className="mt-6">
          <button
            onClick={() => navigate("/admin")}
            className="px-6 py-3 bg-gray-200 text-gray-700 rounded-lg hover:bg-gray-300 transition font-semibold"
          >
            ← Trở về Dashboard
          </button>
        </div>
      </div>
    </div>
  );
}