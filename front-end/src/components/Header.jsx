import { useNavigate } from "react-router-dom";
import { useAuth } from "../context/AuthContext";

const NavLink = ({ href, icon, label, active, navigate }) => (
  <a
    href={href}
    onClick={(e) => {
      e.preventDefault();
      navigate(href);
    }}
    className={`px-3 py-1.5 rounded-md flex items-center gap-1.5 text-[11px] font-bold hover:bg-white/10 transition-colors nav-link-text ${active ? "nav-item-active" : ""}`}
  >
    <span className="material-symbols-outlined text-[18px]">{icon}</span>
    {label}
  </a>
);

export default function Header({ activePage }) {
  const navigate = useNavigate();
  const { user, logout } = useAuth();

  return (
    <nav className="bg-nav-bg text-white shadow-md sticky top-0 z-50 shrink-0">
      <div className="max-w-full mx-auto px-4 lg:px-6 h-14 flex items-center justify-between">
        <div className="flex items-center gap-6">
          {/* Logo */}
          <div
            className="flex items-center gap-2 flex-shrink-0 cursor-pointer"
            onClick={() => navigate("/home")}
          >
            <div className="w-8 h-8 bg-orange-500 rounded-lg flex items-center justify-center shadow-sm">
              <span className="text-white font-bold text-lg">U</span>
            </div>
            <span className="text-xl font-bold tracking-tight lowercase">
              viwash
            </span>
          </div>

          {/* Nav links */}
          <div className="hidden xl:flex items-center gap-1">
            <NavLink href="/home" icon="home" label="TRANG CHỦ" active={activePage === "home"} navigate={navigate} />
            <NavLink href="/nhan-do" icon="add_circle" label="NHẬN ĐỒ" active={activePage === "nhan-do"} navigate={navigate} />
            <NavLink href="/danh-sach-do" icon="fact_check" label="DANH SÁCH ĐỒ" active={activePage === "danh-sach-do"} navigate={navigate} />
            <NavLink href="/thu-chi" icon="payments" label="THU - CHI" active={activePage === "thu-chi"} navigate={navigate} />
            <div className="relative group">
              <button className={`px-3 py-1.5 rounded-md flex items-center gap-1 text-[11px] font-bold hover:bg-white/10 transition-colors nav-link-text ${activePage === "ket-qua-kinh-doanh" || activePage === "bao-cao-doanh-thu" ? "nav-item-active" : ""}`}>
                <span className="material-symbols-outlined text-[18px]">analytics</span>
                KẾT QUẢ KINH DOANH
                <span className="material-symbols-outlined text-[16px]">expand_more</span>
              </button>
              <div className="absolute top-full left-0 mt-1 bg-white rounded-lg shadow-xl border border-gray-200 py-1 min-w-[200px] opacity-0 invisible group-hover:opacity-100 group-hover:visible transition-all z-50">
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
            <div className="relative group">
              <button className={`px-3 py-1.5 rounded-md flex items-center gap-1 text-[11px] font-bold hover:bg-white/10 transition-colors nav-link-text ${["cua-hang","khach-hang","ke-luu-do","don-vi-tinh","bang-gia-dich-vu","tai-khoan-ngan-hang"].includes(activePage) ? "nav-item-active" : ""}`}>
                <span className="material-symbols-outlined text-[18px]">assignment</span>
                KHAI BÁO
                <span className="material-symbols-outlined text-[16px]">expand_more</span>
              </button>
              <div className="absolute top-full left-0 mt-1 bg-white rounded-lg shadow-xl border border-gray-200 py-1 min-w-[210px] opacity-0 invisible group-hover:opacity-100 group-hover:visible transition-all z-50">
                <button onClick={() => navigate("/cua-hang")} className="w-full text-left px-4 py-2.5 text-xs font-semibold text-gray-700 hover:bg-indigo-50 hover:text-nav-bg transition-colors flex items-center gap-2">
                  <span className="material-symbols-outlined text-[16px]">storefront</span>
                  Cửa hàng
                </button>
                <button onClick={() => navigate("/khach-hang")} className="w-full text-left px-4 py-2.5 text-xs font-semibold text-gray-700 hover:bg-indigo-50 hover:text-nav-bg transition-colors flex items-center gap-2">
                  <span className="material-symbols-outlined text-[16px]">group</span>
                  Khách hàng
                </button>
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
                <div className="border-t border-gray-100 my-1" />
                <button onClick={() => navigate("/tai-khoan-ngan-hang")} className="w-full text-left px-4 py-2.5 text-xs font-semibold text-gray-700 hover:bg-indigo-50 hover:text-nav-bg transition-colors flex items-center gap-2">
                  <span className="material-symbols-outlined text-[16px]">account_balance</span>
                  Tài khoản ngân hàng
                </button>
              </div>
            </div>
            <div className="relative group">
              <button className={`px-3 py-1.5 rounded-md flex items-center gap-1 text-[11px] font-bold hover:bg-white/10 transition-colors nav-link-text ${["phan-quyen","mau-hoa-don","nhat-ky"].includes(activePage) ? "nav-item-active" : ""}`}>
                <span className="material-symbols-outlined text-[18px]">settings</span>
                HỆ THỐNG
                <span className="material-symbols-outlined text-[16px]">expand_more</span>
              </button>
              <div className="absolute top-full left-0 mt-1 bg-white rounded-lg shadow-xl border border-gray-200 py-1 min-w-[220px] opacity-0 invisible group-hover:opacity-100 group-hover:visible transition-all z-50">
                <button onClick={() => navigate("/phan-quyen")} className="w-full text-left px-4 py-2.5 text-xs font-semibold text-gray-700 hover:bg-indigo-50 hover:text-nav-bg transition-colors flex items-center gap-2">
                  <span className="material-symbols-outlined text-[16px]">manage_accounts</span>
                  Phân quyền nhân viên
                </button>
                <button onClick={() => navigate("/mau-hoa-don")} className="w-full text-left px-4 py-2.5 text-xs font-semibold text-gray-700 hover:bg-indigo-50 hover:text-nav-bg transition-colors flex items-center gap-2">
                  <span className="material-symbols-outlined text-[16px]">receipt_long</span>
                  Thiết kế mẫu hóa đơn
                </button>
                <button onClick={() => navigate("/nhat-ky")} className="w-full text-left px-4 py-2.5 text-xs font-semibold text-gray-700 hover:bg-indigo-50 hover:text-nav-bg transition-colors flex items-center gap-2">
                  <span className="material-symbols-outlined text-[16px]">history</span>
                  Nhật ký hệ thống
                </button>
              </div>
            </div>
          </div>
        </div>

        {/* User info */}
        <div className="flex items-center gap-3">
          <div className="relative group">
            <div className="flex items-center gap-2 bg-white/15 px-3 py-1 rounded-md cursor-pointer hover:bg-white/25 transition-all">
              <span className="material-symbols-outlined text-[18px]">account_circle</span>
              <span className="text-[11px] font-semibold whitespace-nowrap">
                Chào, {user?.full_name ?? "Người dùng"}
              </span>
              <span className="material-symbols-outlined text-[16px]">expand_more</span>
            </div>
            <div className="absolute top-full right-0 mt-1 bg-white rounded-lg shadow-xl border border-gray-200 py-1 min-w-[210px] opacity-0 invisible group-hover:opacity-100 group-hover:visible transition-all z-50">
              <button onClick={() => navigate("/doi-mat-khau")} className="w-full text-left px-4 py-2.5 text-xs font-semibold text-gray-700 hover:bg-indigo-50 hover:text-nav-bg transition-colors flex items-center gap-2">
                <span className="material-symbols-outlined text-[16px]">lock_reset</span>
                Đổi mật khẩu
              </button>
              <div className="border-t border-gray-100 my-1" />
              <button
                onClick={() => { logout(); navigate("/login"); }}
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
  );
}
