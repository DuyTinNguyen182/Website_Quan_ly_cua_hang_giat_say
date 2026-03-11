import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { useAuth } from "../context/AuthContext";
import { FiEye, FiEyeOff, FiPhone, FiAlertCircle, FiLock } from "react-icons/fi";
import axiosInstance from "../api/axiosInstance";

export default function LoginPage() {
  const navigate = useNavigate();
  const { login } = useAuth();
  const [phone, setPhone] = useState("");
  const [password, setPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError("");

    if (!phone.trim() || !password.trim()) {
      setError("Vui lòng nhập đầy đủ số điện thoại và mật khẩu!");
      return;
    }

    setLoading(true);
    try {
      const { data } = await axiosInstance.post("/auth/login", { phone, password });

      login({
        id: data.user.id,
        name: data.user.full_name,
        role: data.user.role,
      });
      navigate("/home");
    } catch (err) {
      setError(err.response?.data?.message || "Không thể kết nối đến máy chủ. Vui lòng thử lại!");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen w-full flex items-center justify-center bg-gradient-to-br from-blue-100 via-purple-100 to-pink-100">
      <div className="w-full max-w-md mx-4">
        <div className="bg-white rounded-3xl shadow-2xl px-10 py-12">

          {/* Logo */}
          <div className="flex flex-col items-center mb-10">
            <div className="flex items-center gap-3 mb-2">
              <div className="w-13 h-13 rounded-full bg-amber-400 flex items-center justify-center shadow-lg shadow-amber-200">
                <span className="text-white text-3xl font-extrabold">U</span>
              </div>
              <span className="text-4xl font-bold">
                <span className="text-amber-400">vi</span>
                <span className="text-gray-700">wash</span>
              </span>
            </div>
            <p className="text-[11px] tracking-widest text-gray-400 font-semibold uppercase">
              Hệ thống giặt ủi Trà Vinh
            </p>
          </div>

          {/* Error */}
          {error && (
            <div className="flex items-center gap-2 bg-red-50 border border-red-200 rounded-xl px-4 py-3 mb-5">
              <FiAlertCircle className="text-red-500 shrink-0" size={16} />
              <span className="text-sm text-red-600 font-medium">{error}</span>
            </div>
          )}

          {/* Form */}
          <form onSubmit={handleSubmit} className="flex flex-col gap-5">

            {/* Số điện thoại */}
            <div>
              <label className="block text-xs font-semibold text-gray-500 mb-1.5 uppercase tracking-wide">
                Số điện thoại
              </label>
              <div className="flex items-center gap-3 border border-gray-200 rounded-xl px-4 py-3 focus-within:border-indigo-400 focus-within:ring-2 focus-within:ring-indigo-100 transition-all">
                <FiPhone size={17} className="text-gray-400 shrink-0" />
                <input
                  type="tel"
                  placeholder="Nhập số điện thoại"
                  value={phone}
                  onChange={(e) => setPhone(e.target.value)}
                  className="flex-1 outline-none text-[15px] text-gray-700 bg-transparent placeholder-gray-300"
                />
              </div>
            </div>

            {/* Mật khẩu */}
            <div>
              <label className="block text-xs font-semibold text-gray-500 mb-1.5 uppercase tracking-wide">
                Mật khẩu
              </label>
              <div className="flex items-center gap-3 border border-gray-200 rounded-xl px-4 py-3 focus-within:border-indigo-400 focus-within:ring-2 focus-within:ring-indigo-100 transition-all">
                <FiLock size={17} className="text-gray-400 shrink-0" />
                <input
                  type={showPassword ? "text" : "password"}
                  placeholder="Nhập mật khẩu"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  className="flex-1 outline-none text-[15px] text-gray-700 bg-transparent placeholder-gray-300"
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="text-gray-400 hover:text-gray-600 transition-colors shrink-0"
                >
                  {showPassword ? <FiEye size={18} /> : <FiEyeOff size={18} />}
                </button>
              </div>
            </div>

            {/* Nút đăng nhập */}
            <button
              type="submit"
              disabled={loading}
              className="w-full py-4 rounded-2xl text-white font-semibold text-base bg-gradient-to-r from-indigo-500 via-purple-500 to-violet-400 shadow-lg shadow-indigo-200 hover:opacity-90 active:scale-[0.98] transition-all disabled:opacity-60 disabled:cursor-not-allowed mt-1"
            >
              {loading ? "Đang đăng nhập..." : "Đăng nhập"}
            </button>
          </form>

          {/* Hotline */}
          <div className="flex justify-center mt-8">
            <a
              href="tel:0931014232"
              className="inline-flex items-center gap-2 px-6 py-2.5 rounded-full border border-pink-200 text-pink-500 text-sm font-medium hover:bg-pink-50 transition-colors"
            >
              <FiPhone size={14} />
              Hotline: 0931 014 232
            </a>
          </div>

        </div>
      </div>
    </div>
  );
}
