import { useNavigate } from "react-router-dom";
import { useEffect } from "react";
import { useAuth } from "../context/AuthContext";
import Header from "../components/Header";
import Footer from "../components/Footer";

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
  const { user, logout } = useAuth();

  useEffect(() => {
    if (!user) navigate("/login");
  }, [user, navigate]);

  const handleLogout = () => {
    logout();
    navigate("/login");
  };

  return (
    <>
      <Header activePage="home" />

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
            {/* Hàng 1 */}
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
            {/* Hàng 2 */}
            <FeatureCard
              icon="payments"
              title="Bảng Giá"
              description="Bảng giá dịch vụ"
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
            {/* Hàng 3 */}
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
              icon="print"
              title="Mẫu In"
              description="Thiết kế mẫu in"
            />
            {/* Hàng 4 */}
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

      <Footer />
    </>
  );
}
