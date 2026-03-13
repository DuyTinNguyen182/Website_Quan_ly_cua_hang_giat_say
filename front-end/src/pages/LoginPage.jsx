import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { useAuth } from "../context/AuthContext";
import { FiEye, FiEyeOff, FiPhone, FiAlertCircle, FiLock } from "react-icons/fi";
import axiosInstance from "../api/axiosInstance";

/* Floating bubble decoration */
const bubbles = [
  { size: 80,  left: "5%",  delay: "0s",   duration: "12s", color: "rgba(37,99,235,0.1)"  },
  { size: 45,  left: "15%", delay: "2s",   duration: "14s", color: "rgba(6,182,212,0.12)"  },
  { size: 100, left: "28%", delay: "4s",   duration: "18s", color: "rgba(37,99,235,0.07)"  },
  { size: 35,  left: "52%", delay: "1s",   duration: "11s", color: "rgba(139,92,246,0.1)"  },
  { size: 65,  left: "68%", delay: "3s",   duration: "15s", color: "rgba(37,99,235,0.08)"  },
  { size: 55,  left: "82%", delay: "5s",   duration: "13s", color: "rgba(6,182,212,0.09)"  },
  { size: 28,  left: "91%", delay: "0.5s", duration: "9s",  color: "rgba(251,146,60,0.12)" },
  { size: 42,  left: "40%", delay: "6s",   duration: "16s", color: "rgba(16,185,129,0.09)" },
  { size: 22,  left: "75%", delay: "2.5s", duration: "10s", color: "rgba(37,99,235,0.15)"  },
  { size: 60,  left: "60%", delay: "7s",   duration: "20s", color: "rgba(139,92,246,0.07)" },
];

export default function LoginPage() {
  const navigate = useNavigate();
  const { login } = useAuth();
  const [phone, setPhone] = useState("");
  const [password, setPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);
  const [tilt, setTilt] = useState({ x: 0, y: 0 });

  const handleMouseMove = (e) => {
    const rect = e.currentTarget.getBoundingClientRect();
    const cx = rect.left + rect.width / 2;
    const cy = rect.top + rect.height / 2;
    const x = ((e.clientX - cx) / rect.width) * 10;
    const y = ((e.clientY - cy) / rect.height) * -10;
    setTilt({ x, y });
  };

  const handleMouseLeave = () => setTilt({ x: 0, y: 0 });

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
    <div className="min-h-screen w-full flex items-center justify-center bg-animated-gradient-login relative overflow-hidden">

      {/* Mesh grid background */}
      <div className="absolute inset-0 pointer-events-none"
           style={{backgroundImage:"linear-gradient(rgba(37,99,235,0.04) 1px, transparent 1px),linear-gradient(90deg, rgba(37,99,235,0.04) 1px, transparent 1px)", backgroundSize:"40px 40px"}} />

      {/* Radial glow spots */}
      <div className="absolute -top-32 -left-32 w-96 h-96 bg-blue-300/20 rounded-full blur-3xl animate-float" />
      <div className="absolute -bottom-20 -right-20 w-80 h-80 bg-cyan-300/20 rounded-full blur-3xl animate-float-rev" />
      <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[600px] h-[600px] bg-blue-200/10 rounded-full blur-3xl pointer-events-none" />

      {/* Floating bubbles */}
      {bubbles.map((b, i) => (
        <div
          key={i}
          className="bubble"
          style={{
            width: b.size,
            height: b.size,
            left: b.left,
            bottom: "-100px",
            background: b.color,
            animationDelay: b.delay,
            animationDuration: b.duration,
            backdropFilter: "blur(2px)",
          }}
        />
      ))}

      {/* Floating wash icons decoration */}
      <div className="absolute top-12 left-10 text-blue-200 animate-float opacity-40 select-none pointer-events-none text-5xl">🫧</div>
      <div className="absolute top-24 right-16 text-cyan-200 animate-float-rev opacity-35 select-none pointer-events-none text-4xl" style={{animationDelay:"1.2s"}}>🧺</div>
      <div className="absolute bottom-20 left-20 text-blue-200 animate-float opacity-30 select-none pointer-events-none text-4xl" style={{animationDelay:"2s"}}>👕</div>
      <div className="absolute bottom-32 right-12 text-sky-200 animate-float-rev opacity-30 select-none pointer-events-none text-5xl" style={{animationDelay:"0.8s"}}>✨</div>

      {/* Login card with 3D tilt */}
      <div className="w-full max-w-md mx-4 relative z-10"
           onMouseMove={handleMouseMove}
           onMouseLeave={handleMouseLeave}
           style={{perspective: "1000px"}}>
        <div className="bg-white rounded-3xl shadow-2xl px-10 py-12 animate-scale-in transition-transform duration-200"
             style={{
               boxShadow: "0 30px 80px rgba(37,99,235,0.2), 0 10px 30px rgba(0,0,0,0.07)",
               transform: `perspective(1000px) rotateX(${tilt.y}deg) rotateY(${tilt.x}deg)`,
             }}>

          {/* Logo */}
          <div className="flex flex-col items-center mb-10 animate-fade-up">
            <div className="flex items-center gap-3 mb-2">
              <div className="w-14 h-14 rounded-2xl bg-gradient-to-br from-blue-500 to-cyan-400 flex items-center justify-center shadow-xl shadow-blue-200/60 animate-bounce-soft logo-glow cursor-pointer relative overflow-hidden">
                {/* Shine sweep */}
                <div className="absolute inset-0 bg-gradient-to-br from-white/30 to-transparent" />
                <span className="text-white text-3xl font-extrabold relative z-10">U</span>
              </div>
              <div className="flex flex-col">
                <span className="text-3xl font-bold leading-none">
                  <span className="text-blue-500">TV</span>
                  <span className="text-gray-700">wash</span>
                </span>
                <span className="text-[9px] tracking-[0.2em] text-gray-500 font-semibold uppercase mt-0.5">Management System</span>
              </div>
            </div>
            <p className="text-[11px] tracking-widest text-gray-500 font-semibold uppercase mt-1">
              Hệ thống giặt ủi Trà Vinh
            </p>
            <div className="mt-3 h-0.5 w-20 bg-gradient-to-r from-blue-400 via-cyan-400 to-blue-400 rounded-full" style={{backgroundSize:"200% 100%", animation:"shimmer 2s linear infinite"}} />
          </div>

          {/* Error */}
          {error && (
            <div className="flex items-center gap-2 bg-red-50 border border-red-200 rounded-xl px-4 py-3 mb-5 animate-fade-down">
              <FiAlertCircle className="text-red-500 shrink-0" size={16} />
              <span className="text-sm text-red-600 font-medium">{error}</span>
            </div>
          )}

          {/* Form */}
          <form onSubmit={handleSubmit} className="flex flex-col gap-5">

            {/* Số điện thoại */}
            <div className="animate-fade-up delay-100">
              <label className="block text-xs font-semibold text-gray-700 mb-1.5 uppercase tracking-wide">
                Số điện thoại
              </label>
              <div className="input-glow flex items-center gap-3 border border-gray-200 rounded-xl px-4 py-3 transition-all">
                <FiPhone size={17} className="text-indigo-400 shrink-0" />
                <input
                  type="tel"
                  placeholder="Nhập số điện thoại"
                  value={phone}
                  onChange={(e) => setPhone(e.target.value)}
                  className="flex-1 outline-none text-[15px] text-gray-800 bg-transparent placeholder-gray-400"
                />
              </div>
            </div>

            {/* Mật khẩu */}
            <div className="animate-fade-up delay-200">
              <label className="block text-xs font-semibold text-gray-700 mb-1.5 uppercase tracking-wide">
                Mật khẩu
              </label>
              <div className="input-glow flex items-center gap-3 border border-gray-200 rounded-xl px-4 py-3 transition-all">
                <FiLock size={17} className="text-indigo-400 shrink-0" />
                <input
                  type={showPassword ? "text" : "password"}
                  placeholder="Nhập mật khẩu"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  className="flex-1 outline-none text-[15px] text-gray-800 bg-transparent placeholder-gray-400"
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="text-gray-400 hover:text-indigo-500 transition-colors shrink-0"
                >
                  {showPassword ? <FiEye size={18} /> : <FiEyeOff size={18} />}
                </button>
              </div>
            </div>

            {/* Nút đăng nhập */}
            <div className="animate-fade-up delay-300">
              <button
                type="submit"
                disabled={loading}
                className="ripple-btn btn-magnetic w-full py-4 rounded-2xl text-white font-bold text-base btn-shimmer shadow-lg shadow-blue-200 hover:shadow-xl hover:shadow-blue-300 disabled:opacity-60 disabled:cursor-not-allowed mt-1"
              >
                {loading ? (
                  <span className="flex items-center justify-center gap-2">
                    <span className="inline-block w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" />
                    Đang đăng nhập...
                  </span>
                ) : (
                  <span className="flex items-center justify-center gap-2">
                    <span className="material-symbols-outlined text-[18px]">login</span>
                    Đăng nhập
                  </span>
                )}
              </button>
            </div>
          </form>

          {/* Hotline */}
          <div className="flex justify-center mt-8 animate-fade-up delay-400">
            <a
              href="tel:0931014232"
              className="inline-flex items-center gap-2 px-6 py-2.5 rounded-full border border-blue-200 text-blue-500 text-sm font-medium hover:bg-blue-50 hover:border-blue-400 hover:shadow-md hover:shadow-blue-100 hover:scale-105 transition-all"
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



