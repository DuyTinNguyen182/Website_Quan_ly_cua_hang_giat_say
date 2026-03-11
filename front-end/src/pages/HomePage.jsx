import { useNavigate } from "react-router-dom";
import { useEffect, useState } from "react";

const ActionCard = ({ icon, title, description, hoverClass, iconBgClass, onClick }) => (
  <div
    onClick={onClick}
    className={`bg-white p-6 rounded-xl border-2 border-dashed border-slate-200 text-center transition-all cursor-pointer group ${hoverClass}`}
  >
    <div
      className={`w-14 h-14 text-white rounded-full flex items-center justify-center mx-auto mb-3 group-hover:scale-105 transition-transform ${iconBgClass}`}
    >
      <span className="material-symbols-outlined text-3xl">{icon}</span>
    </div>
    <h3 className="text-sm font-bold text-accent-blue mb-1 uppercase tracking-wide">
      {title}
    </h3>
    <p className="text-slate-400 text-[11px]">{description}</p>
  </div>
);

const FeatureCard = ({ icon, title, description, isLogout = false }) => {
  const baseClasses =
    "feature-card flex items-center gap-4 p-4 rounded-xl cursor-pointer transition-all border";
  const normalClasses =
    "bg-soft-blue-tint hover:bg-blue-100/50 border-blue-50";
  const logoutClasses = "bg-pink-50 hover:bg-pink-100 border-pink-100/50";

  return (
    <div
      className={`${baseClasses} ${isLogout ? logoutClasses : normalClasses}`}
    >
      <div
        className={`flex-shrink-0 ${isLogout ? "text-pink-500" : "text-accent-blue"}`}
      >
        <span className="material-symbols-outlined text-3xl">{icon}</span>
      </div>
      <div>
        <h4
          className={`font-bold text-xs uppercase ${isLogout ? "text-pink-600" : "text-accent-blue"}`}
        >
          {title}
        </h4>
        <p className="text-[10px] text-slate-400">{description}</p>
      </div>
    </div>
  );
};

export default function HomePage() {
  const navigate = useNavigate();
  const [user, setUser] = useState({ name: "Người dùng", store: "" });

  useEffect(() => {
    const stored = localStorage.getItem("user");
    if (stored) {
      setUser(JSON.parse(stored));
    } else {
      // Chưa đăng nhập → quay về login
      navigate("/login");
    }
  }, [navigate]);

  const handleLogout = () => {
    localStorage.removeItem("user");
    navigate("/login");
  };

  return (
    <>
      {/* Navbar */}
      <nav className="bg-nav-bg text-white shadow-md sticky top-0 z-50">
        <div className="max-w-full mx-auto px-4 lg:px-6 h-14 flex items-center justify-between">
          <div className="flex items-center gap-6">
            {/* Logo */}
            <div className="flex items-center gap-2 flex-shrink-0">
              <div className="w-8 h-8 bg-orange-500 rounded-lg flex items-center justify-center shadow-sm">
                <span className="text-white font-bold text-lg">U</span>
              </div>
              <span className="text-xl font-bold tracking-tight lowercase">
                viwash
              </span>
            </div>

            {/* Nav links */}
            <div className="hidden xl:flex items-center gap-1">
              <a
                className="nav-item-active px-3 py-1.5 rounded-md flex items-center gap-1.5 text-[11px] font-bold hover:bg-white/10 transition-colors nav-link-text"
                href="#"
              >
                <span className="material-symbols-outlined text-[18px]">
                  home
                </span>
                TRANG CHỦ
              </a>
              <a
                className="px-3 py-1.5 rounded-md flex items-center gap-1.5 text-[11px] font-bold hover:bg-white/10 transition-colors nav-link-text"
                href="/nhan-do"
                onClick={(e) => { e.preventDefault(); navigate("/nhan-do"); }}
              >
                <span className="material-symbols-outlined text-[18px]">
                  add_circle
                </span>
                NHẬN ĐỒ
              </a>
              <a
                className="px-3 py-1.5 rounded-md flex items-center gap-1.5 text-[11px] font-bold hover:bg-white/10 transition-colors nav-link-text"
                href="/danh-sach-do"
                onClick={(e) => { e.preventDefault(); navigate("/danh-sach-do"); }}
              >
                <span className="material-symbols-outlined text-[18px]">
                  fact_check
                </span>
                DANH SÁCH ĐỒ
              </a>
              <a
                className="px-3 py-1.5 rounded-md flex items-center gap-1.5 text-[11px] font-bold hover:bg-white/10 transition-colors nav-link-text"
                href="/thu-chi"
                onClick={(e) => { e.preventDefault(); navigate("/thu-chi"); }}
              >
                <span className="material-symbols-outlined text-[18px]">
                  payments
                </span>
                THU - CHI
              </a>
              <div className="relative group">
                <button className="px-3 py-1.5 rounded-md flex items-center gap-1 text-[11px] font-bold hover:bg-white/10 transition-colors nav-link-text">
                  <span className="material-symbols-outlined text-[18px]">
                    analytics
                  </span>
                  KẾT QUẢ KINH DOANH
                  <span className="material-symbols-outlined text-[16px]">
                    expand_more
                  </span>
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
                <button className="px-3 py-1.5 rounded-md flex items-center gap-1 text-[11px] font-bold hover:bg-white/10 transition-colors nav-link-text">
                  <span className="material-symbols-outlined text-[18px]">
                    assignment
                  </span>
                  KHAI BÁO
                  <span className="material-symbols-outlined text-[16px]">
                    expand_more
                  </span>
                </button>
              </div>
              <div className="relative group">
                <button className="px-3 py-1.5 rounded-md flex items-center gap-1 text-[11px] font-bold hover:bg-white/10 transition-colors nav-link-text">
                  <span className="material-symbols-outlined text-[18px]">
                    settings
                  </span>
                  HỆ THỐNG
                  <span className="material-symbols-outlined text-[16px]">
                    expand_more
                  </span>
                </button>
              </div>
            </div>
          </div>

          {/* User info */}
          <div className="flex items-center gap-3">
            <div className="flex items-center gap-2 bg-white/15 px-3 py-1 rounded-md cursor-pointer hover:bg-white/25 transition-all">
              <span className="material-symbols-outlined text-[18px]">
                account_circle
              </span>
              <span className="text-[11px] font-semibold whitespace-nowrap">
                Chào, {user.name}
              </span>
            </div>
          </div>
        </div>
      </nav>

      {/* Main content */}
      <main className="max-w-[1200px] mx-auto px-4 py-6 space-y-6">
        {/* Action cards */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          <ActionCard
            icon="add"
            title="Nhận Đồ"
            description="Nhận đồ và lập phiếu cho khách"
            hoverClass="hover:border-accent-green/50"
            iconBgClass="bg-accent-green"
            onClick={() => navigate("/nhan-do")}
          />
          <ActionCard
            icon="playlist_add_check"
            title="Danh Sách Đồ"
            description="Quản lý tình trạng đơn hàng"
            hoverClass="hover:border-accent-blue/50"
            iconBgClass="bg-accent-blue"
            onClick={() => navigate("/danh-sach-do")}
          />
          <ActionCard
            icon="swap_horiz"
            title="Thu - Chi"
            description="Thu, Chi ngoài dịch vụ giặt ủi"
            hoverClass="hover:border-accent-orange/50"
            iconBgClass="bg-accent-orange"
            onClick={() => navigate("/thu-chi")}
          />
        </div>

        {/* Feature cards */}
        <div className="bg-white p-6 md:p-8 rounded-[2rem] border border-slate-100 shadow-sm">
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
            <FeatureCard
              icon="menu_book"
              title="Sổ Quỹ Cửa Hàng"
              description="Các khoản thu chi cửa hàng"
            />
            <FeatureCard
              icon="bar_chart"
              title="Báo Cáo Kinh Doanh"
              description="Xem biểu đồ & báo cáo kinh doanh"
            />
            <FeatureCard
              icon="groups"
              title="Khách Hàng"
              description="Danh sách khách hàng"
            />
            <FeatureCard
              icon="payments"
              title="Bảng Giá"
              description="Bảng giá dịch vụ"
            />
            <FeatureCard
              icon="playlist_add_check"
              title="Trạng Thái"
              description="Danh sách trạng thái phiếu"
            />
            <FeatureCard
              icon="straighten"
              title="Đơn Vị Tính"
              description="Danh sách đơn vị tính"
            />
            <FeatureCard
              icon="shelves"
              title="Kệ Lưu Đồ"
              description="Danh sách kệ cất đồ"
            />
            <FeatureCard
              icon="account_balance"
              title="Ngân Hàng"
              description="Danh sách ngân hàng"
            />
            <FeatureCard
              icon="store"
              title="Cửa Hàng"
              description="Thông tin cửa hàng"
            />
            <FeatureCard
              icon="card_giftcard"
              title="Khuyến Mãi"
              description="Thiết lập tích điểm, khuyến mãi"
            />
            <FeatureCard
              icon="print"
              title="Mẫu In"
              description="Thiết kế mẫu in"
            />
            <FeatureCard
              icon="admin_panel_settings"
              title="Phân Quyền"
              description="Quản lý & phân quyền nhân viên"
            />
            <FeatureCard
              icon="history_edu"
              title="Nhật Ký"
              description="Quản lý lịch sử thao tác"
            />
            <FeatureCard
              icon="help_outline"
              title="Hướng Dẫn"
              description="Hướng dẫn sử dụng"
            />
            <div onClick={handleLogout}>
              <FeatureCard
                icon="logout"
                title="Đăng Xuất"
                description="Rời khỏi hệ thống"
                isLogout={true}
              />
            </div>
          </div>
        </div>
      </main>

      {/* Footer */}
      <footer className="max-w-[1200px] mx-auto px-4 py-6 text-center text-slate-400 text-[10px]">
        <p>© 2024 Viwash - Laundry Management System</p>
      </footer>
    </>
  );
}
