import { useNavigate } from "react-router-dom";
import { useAuth } from "../context/AuthContext";
import { useState } from "react";

const NavLink = ({ href, icon, label, active, navigate }) => (
  <a
    href={href}
    onClick={(e) => {
      e.preventDefault();
      navigate(href);
    }}
    className={`px-3 py-1.5 rounded-md flex items-center gap-1.5 text-[11px] font-bold hover:bg-white/10 transition-all nav-link-text nav-link-underline relative ${active ? "nav-item-active active" : ""}`}
  >
    <span className="material-symbols-outlined text-[18px] transition-transform group-hover:scale-110">{icon}</span>
    {label}
  </a>
);

export default function Header({ activePage }) {
  const navigate = useNavigate();
  const { user, logout } = useAuth();
  const [logoHover, setLogoHover] = useState(false);
  const [showLogoutConfirm, setShowLogoutConfirm] = useState(false);

  const handleLogout = () => {
    logout();
    navigate("/login");
  };

  return (<>
    <nav className="bg-nav-bg text-white sticky top-0 z-50 shrink-0 overflow-visible"
         style={{boxShadow:"0 4px 24px rgba(37,99,235,0.4), 0 1px 0 rgba(255,255,255,0.1) inset"}}>
      {/* Subtle animated shine overlay */}
      <div className="absolute inset-0 pointer-events-none overflow-hidden">
        <div className="absolute inset-0 bg-gradient-to-r from-white/0 via-white/5 to-white/0" style={{backgroundSize:"200% 100%", animation:"shimmer 4s linear infinite"}} />
      </div>
      <div className="max-w-full mx-auto px-4 lg:px-6 h-14 flex items-center justify-between relative z-10">
        <div className="flex items-center gap-6">
          {/* Logo */}
          <div
            className="flex items-center gap-2 flex-shrink-0 cursor-pointer group"
            onClick={() => navigate("/home")}
            onMouseEnter={() => setLogoHover(true)}
            onMouseLeave={() => setLogoHover(false)}
          >
            <div className={`w-8 h-8 bg-gradient-to-br from-amber-400 to-orange-500 rounded-xl flex items-center justify-center shadow-md logo-glow transition-all duration-300 ${logoHover ? "animate-logo-wiggle" : ""}`} style={{boxShadow:"0 4px 12px rgba(251,146,60,0.5)"}}>
              <span className="text-white font-bold text-lg">U</span>
            </div>
            <span className="text-xl font-bold tracking-tight lowercase transition-all duration-200 group-hover:text-orange-200">
              TVwash
            </span>
          </div>

          {/* Nav links */}
          <div className="hidden xl:flex items-center gap-1">
            <NavLink href="/home" icon="home" label="TRANG CHỦ" active={activePage === "home"} navigate={navigate} />
            <NavLink href="/nhan-do" icon="add_circle" label="NHẬN ĐỒ" active={activePage === "nhan-do"} navigate={navigate} />
            <NavLink href="/danh-sach-do" icon="fact_check" label="DANH SÁCH ĐỒ" active={activePage === "danh-sach-do"} navigate={navigate} />
            <NavLink href="/thu-chi" icon="payments" label="THU - CHI" active={activePage === "thu-chi"} navigate={navigate} />
            
            {user?.role === "ADMIN" && (
              <div className="relative group">
                <button className={`px-3 py-1.5 rounded-md flex items-center gap-1 text-[11px] font-bold hover:bg-white/10 transition-all nav-link-text ${activePage === "ket-qua-kinh-doanh" || activePage === "bao-cao-doanh-thu" ? "nav-item-active" : ""}`}>
                  <span className="material-symbols-outlined text-[18px]">analytics</span>
                  KẾT QUẢ KINH DOANH
                  <span className="material-symbols-outlined text-[16px] transition-transform duration-200 group-hover:rotate-180">expand_more</span>
                </button>
                <div className="absolute top-full left-0 mt-1 bg-white rounded-xl shadow-2xl border border-gray-100 py-1.5 min-w-[200px] opacity-0 invisible -translate-y-2 scale-95 group-hover:opacity-100 group-hover:visible group-hover:translate-y-0 group-hover:scale-100 transition-all duration-200 z-50">
                  <button onClick={() => navigate("/bao-cao-doanh-thu")} className="w-full text-left px-4 py-2.5 text-xs font-semibold text-gray-700 hover:bg-indigo-50 hover:text-nav-bg transition-colors flex items-center gap-2">
                    <span className="material-symbols-outlined text-[16px]">bar_chart</span>
                    Báo cáo doanh thu tháng
                  </button>
                  <button onClick={() => navigate("/ket-qua-kinh-doanh")} className="w-full text-left px-4 py-2.5 text-xs font-semibold text-gray-700 hover:bg-indigo-50 hover:text-nav-bg transition-colors flex items-center gap-2">
                    <span className="material-symbols-outlined text-[16px]">account_balance_wallet</span>
                    Sổ quỹ cửa hàng
                  </button>
                </div>
              </div>
            )}
            
            <div className="relative group">
              <button className={`px-3 py-1.5 rounded-md flex items-center gap-1 text-[11px] font-bold hover:bg-white/10 transition-all nav-link-text ${["cua-hang","khach-hang","ke-luu-do","don-vi-tinh","bang-gia-dich-vu","tai-khoan-ngan-hang"].includes(activePage) ? "nav-item-active" : ""}`}>
                <span className="material-symbols-outlined text-[18px]">assignment</span>
                KHAI BÁO
                <span className="material-symbols-outlined text-[16px] transition-transform duration-200 group-hover:rotate-180">expand_more</span>
              </button>
              <div className="absolute top-full left-0 mt-1 bg-white rounded-xl shadow-2xl border border-gray-100 py-1.5 min-w-[210px] opacity-0 invisible -translate-y-2 scale-95 group-hover:opacity-100 group-hover:visible group-hover:translate-y-0 group-hover:scale-100 transition-all duration-200 z-50">
                <button onClick={() => navigate("/khach-hang")} className="w-full text-left px-4 py-2.5 text-xs font-semibold text-gray-700 hover:bg-indigo-50 hover:text-nav-bg transition-colors flex items-center gap-2">
                  <span className="material-symbols-outlined text-[16px]">group</span>
                  Khách hàng
                </button>
                {user?.role === "ADMIN" && (
                  <>
                    <button onClick={() => navigate("/ke-luu-do")} className="w-full text-left px-4 py-2.5 text-xs font-semibold text-gray-700 hover:bg-indigo-50 hover:text-nav-bg transition-colors flex items-center gap-2">
                      <span className="material-symbols-outlined text-[16px]">shelves</span>
                      Kệ lưu đồ
                    </button>
                    <button onClick={() => navigate("/don-vi-tinh")} className="w-full text-left px-4 py-2.5 text-xs font-semibold text-gray-700 hover:bg-indigo-50 hover:text-nav-bg transition-colors flex items-center gap-2">
                      <span className="material-symbols-outlined text-[16px]">straighten</span>
                      Đơn vị tính
                    </button>
                    <button onClick={() => navigate("/bang-gia-dich-vu")} className="w-full text-left px-4 py-2.5 text-xs font-semibold text-gray-700 hover:bg-indigo-50 hover:text-nav-bg transition-colors flex items-center gap-2">
                      <span className="material-symbols-outlined text-[16px]">sell</span>
                      Bảng giá dịch vụ
                    </button>
                  </>
                )}
              </div>
            </div>
            
            {user?.role === "ADMIN" && (
              <div className="relative group">
                <button className={`px-3 py-1.5 rounded-md flex items-center gap-1 text-[11px] font-bold hover:bg-white/10 transition-all nav-link-text ${["phan-quyen","mau-hoa-don","nhat-ky"].includes(activePage) ? "nav-item-active" : ""}`}>
                  <span className="material-symbols-outlined text-[18px]">settings</span>
                  HỆ THỐNG
                  <span className="material-symbols-outlined text-[16px] transition-transform duration-200 group-hover:rotate-180">expand_more</span>
                </button>
                <div className="absolute top-full left-0 mt-1 bg-white rounded-xl shadow-2xl border border-gray-100 py-1.5 min-w-[220px] opacity-0 invisible -translate-y-2 scale-95 group-hover:opacity-100 group-hover:visible group-hover:translate-y-0 group-hover:scale-100 transition-all duration-200 z-50">
                  <button onClick={() => navigate("/phan-quyen")} className="w-full text-left px-4 py-2.5 text-xs font-semibold text-gray-700 hover:bg-indigo-50 hover:text-nav-bg transition-colors flex items-center gap-2">
                    <span className="material-symbols-outlined text-[16px]">manage_accounts</span>
                    Tài khoản người dùng
                  </button>
                  <button onClick={() => navigate("/nhat-ky")} className="w-full text-left px-4 py-2.5 text-xs font-semibold text-gray-700 hover:bg-indigo-50 hover:text-nav-bg transition-colors flex items-center gap-2">
                    <span className="material-symbols-outlined text-[16px]">history</span>
                    Nhật ký hệ thống
                  </button>
                </div>
              </div>
            )}
          </div>
        </div>

        {/* User info */}
        <div className="flex items-center gap-3">
          <div className="relative group">
            <div className="flex items-center gap-2 bg-white/15 backdrop-blur-sm text-white px-3 py-1.5 rounded-full cursor-pointer hover:bg-white/25 transition-all shadow-sm hover:shadow-md border border-white/20">
              <span className="material-symbols-outlined text-[22px] animate-heartbeat">account_circle</span>
              <div className="flex flex-col leading-tight">
                <span className="text-[11px] font-bold whitespace-nowrap text-white">
                  {user?.role === "ADMIN" ? "Quản trị viên" : "Admin"}
                </span>
                <span className="text-[10px] font-normal whitespace-nowrap text-white/70">
                  {user?.full_name ?? (user?.role === "ADMIN" ? "Admin" : "Staff")}
                </span>
              </div>
              <span className="material-symbols-outlined text-[16px] text-white/80 transition-transform duration-200 group-hover:rotate-180">expand_more</span>
            </div>
            <div className="absolute top-full right-0 mt-2 glass-card rounded-2xl shadow-2xl py-2 min-w-[220px] opacity-0 invisible -translate-y-3 scale-95 group-hover:opacity-100 group-hover:visible group-hover:translate-y-0 group-hover:scale-100 transition-all duration-250 z-50"
                 style={{boxShadow:"0 20px 60px rgba(37,99,235,0.18), 0 4px 16px rgba(0,0,0,0.08)"}}>
              {/* User badge inside dropdown */}
              <div className="px-4 py-3 border-b border-gray-100/80 mb-1">
                <div className="flex items-center gap-2">
                  <div className="w-7 h-7 rounded-full bg-gradient-to-br from-blue-500 to-cyan-400 flex items-center justify-center shadow">
                    <span className="text-white text-xs font-bold">{(user?.full_name ?? "A")[0].toUpperCase()}</span>
                  </div>
                  <div>
                    <div className="text-[11px] font-bold text-gray-800">{user?.full_name ?? "Admin"}</div>
                    <div className="text-[10px] text-gray-400">{user?.role === "ADMIN" ? "Quản trị viên" : "Nhân viên"}</div>
                  </div>
                </div>
              </div>
              <button onClick={() => navigate("/doi-mat-khau")} className="w-full text-left px-4 py-2.5 text-xs font-semibold text-gray-700 hover:bg-blue-50 hover:text-nav-bg transition-colors flex items-center gap-2 rounded-lg mx-auto">
                <span className="material-symbols-outlined text-[16px]">lock_reset</span>
                Đổi mật khẩu
              </button>
              <div className="border-t border-gray-100 my-1" />
              <button
                onClick={() => setShowLogoutConfirm(true)}
                className="w-full text-left px-4 py-2.5 text-xs font-semibold text-red-500 hover:bg-red-50 transition-colors flex items-center gap-2"
              >
                <span className="material-symbols-outlined text-[16px]">logout</span>
                Đăng xuất khỏi {user?.full_name ?? "hệ thống"}
              </button>
            </div>
          </div>
        </div>
      </div>
    </nav>

      {/* ─── Logout Confirmation Modal ─── */}
      {showLogoutConfirm && (
        <div className="fixed inset-0 z-[200] flex items-center justify-center bg-black/50 backdrop-blur-sm"
             onClick={() => setShowLogoutConfirm(false)}>
          <div className="bg-white rounded-2xl shadow-2xl w-full max-w-sm mx-4 animate-scale-in"
               onClick={(e) => e.stopPropagation()}>
            {/* Icon */}
            <div className="flex flex-col items-center pt-8 pb-4 px-6">
              <div className="w-14 h-14 rounded-full bg-red-50 flex items-center justify-center mb-4">
                <span className="material-symbols-outlined text-[32px] text-red-500">logout</span>
              </div>
              <h3 className="text-base font-bold text-gray-800 mb-1">Xác nhận đăng xuất</h3>
              <p className="text-sm text-gray-500 text-center">Bạn có chắc muốn đăng xuất khỏi hệ thống không?</p>
            </div>
            {/* Buttons */}
            <div className="flex gap-3 px-6 pb-6 pt-2">
              <button
                onClick={() => setShowLogoutConfirm(false)}
                className="flex-1 py-2.5 rounded-xl text-sm font-bold text-gray-600 bg-gray-100 hover:bg-gray-200 transition-colors"
              >
                Hủy
              </button>
              <button
                onClick={handleLogout}
                className="flex-1 py-2.5 rounded-xl text-sm font-bold text-white bg-red-500 hover:bg-red-600 transition-colors"
              >
                Đăng xuất
              </button>
            </div>
          </div>
        </div>
      )}
    </>
  );
}
