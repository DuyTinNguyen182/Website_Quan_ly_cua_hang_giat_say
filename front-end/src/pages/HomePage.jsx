import { useNavigate } from "react-router-dom";
import { useEffect, useState } from "react";
import { useAuth } from "../context/AuthContext";
import Header from "../components/Header";
import Footer from "../components/Footer";

/* Greeting based on time */
function getGreeting() {
  const h = new Date().getHours();
  if (h < 6)  return { text: "Chào buổi đêm", icon: "🌙" };
  if (h < 12) return { text: "Chào buổi sáng", icon: "☀️" };
  if (h < 14) return { text: "Chào buổi trưa", icon: "🌤️" };
  if (h < 18) return { text: "Chào buổi chiều", icon: "🌅" };
  return { text: "Chào buổi tối", icon: "🌆" };
}

const ActionCard = ({ icon, title, description, gradient, accentLight, iconColor, shadowColor, onClick, delay }) => (
  <div
    onClick={onClick}
    className={`relative overflow-hidden bg-white rounded-2xl cursor-pointer group animate-fade-up ${delay} transition-all duration-300 hover:-translate-y-1.5 hover:shadow-xl border border-slate-100`}
    style={{boxShadow: `0 4px 18px ${shadowColor}`}}
  >
    {/* Colored top strip */}
    <div className="h-1.5 w-full" style={{background: gradient}} />
    {/* Hover bg tint */}
    <div className="absolute inset-0 opacity-0 group-hover:opacity-100 transition-opacity duration-300 pointer-events-none"
         style={{background: accentLight}} />
    <div className="relative z-10 p-6 text-center">
      <div className="w-16 h-16 rounded-full flex items-center justify-center mx-auto mb-4 transition-all duration-300 group-hover:scale-110 group-hover:rotate-6"
           style={{background: gradient, boxShadow: `0 6px 20px ${shadowColor}`}}>
        <span className={`material-symbols-outlined text-white text-3xl`}>{icon}</span>
      </div>
      <h3 className={`text-base font-extrabold mb-2 uppercase tracking-wider ${iconColor}`}>{title}</h3>
      <p className="text-slate-500 text-[13px] leading-relaxed">{description}</p>
      <div className="mt-4 inline-flex items-center gap-1 rounded-full px-4 py-2 transition-all duration-200 group-hover:gap-2"
           style={{background: accentLight}}>
        <span className={`text-[12px] font-semibold ${iconColor}`}>Mở ngay</span>
        <span className={`material-symbols-outlined text-[14px] ${iconColor}`}>arrow_forward</span>
      </div>
    </div>
  </div>
);

const FeatureCard = ({ icon, title, description, isLogout = false, iconColor, iconBg, accentColor, delay }) => {
  return (
    <div className={`group flex items-center gap-3.5 p-4 rounded-xl cursor-pointer transition-all duration-200 border hover:-translate-y-0.5 animate-slide-left ${delay}
      ${isLogout ? "bg-pink-50 border-pink-100 hover:bg-pink-100 hover:border-pink-200" : "bg-white border-slate-100 hover:border-blue-200 hover:shadow-md"}`}
         style={isLogout ? {} : {boxShadow:"0 2px 8px rgba(37,99,235,0.04)"}}>
      {/* Left accent bar */}
      <div className={`absolute left-0 top-3 bottom-3 w-0.5 rounded-full opacity-0 group-hover:opacity-100 transition-opacity ${isLogout ? "bg-pink-400" : accentColor}`}
           style={{position:"relative", width:"3px", height:"auto", borderRadius:"4px", flexShrink:0, alignSelf:"stretch",
                   background: isLogout ? "#f472b6" : undefined, backgroundColor: (!isLogout && accentColor) ? undefined : undefined}} />
      <div className={`w-10 h-10 rounded-xl flex items-center justify-center flex-shrink-0 transition-all duration-300 group-hover:scale-110 group-hover:rotate-6 ${isLogout ? "bg-pink-100" : iconBg}`}>
        <span className={`material-symbols-outlined text-xl ${isLogout ? "text-pink-500" : iconColor}`}>{icon}</span>
      </div>
      <div className="flex-1 min-w-0">
        <h4 className={`font-bold text-sm uppercase tracking-wide ${isLogout ? "text-pink-600" : "text-slate-700"}`}>{title}</h4>
        <p className="text-xs text-slate-400 mt-0.5 truncate">{description}</p>
      </div>
      <span className={`material-symbols-outlined text-[15px] opacity-0 group-hover:opacity-100 transition-all duration-200 group-hover:translate-x-0.5 ${isLogout ? "text-pink-400" : "text-blue-400"}`}>chevron_right</span>
    </div>
  );
};

export default function HomePage() {
  const navigate = useNavigate();
  const { user, logout } = useAuth();
  const [time, setTime] = useState(new Date());
  const greeting = getGreeting();

  useEffect(() => {
    if (!user) navigate("/login");
  }, [user, navigate]);

  useEffect(() => {
    const timer = setInterval(() => setTime(new Date()), 1000);
    return () => clearInterval(timer);
  }, []);

  const handleLogout = () => {
    logout();
    navigate("/login");
  };

  const formatTime = (d) =>
    d.toLocaleTimeString("vi-VN", { hour: "2-digit", minute: "2-digit", second: "2-digit" });

  const formatDate = (d) =>
    d.toLocaleDateString("vi-VN", { weekday: "long", day: "2-digit", month: "2-digit", year: "numeric" });

  return (
    <>
      <Header activePage="home" />

      <main className="max-w-[1200px] mx-auto px-4 py-6 space-y-6">

        {/* Welcome banner */}
        <div className="relative overflow-hidden rounded-3xl text-white animate-fade-down"
             style={{
               background: "linear-gradient(135deg, #2563eb 0%, #3b82f6 45%, #0ea5e9 100%)",
               boxShadow: "0 12px 40px rgba(37,99,235,0.4), 0 4px 12px rgba(0,0,0,0.1)"
             }}>
          {/* Animated mesh background */}
          <div className="absolute inset-0 opacity-20"
               style={{backgroundImage:"linear-gradient(rgba(255,255,255,0.15) 1px, transparent 1px),linear-gradient(90deg, rgba(255,255,255,0.15) 1px, transparent 1px)", backgroundSize:"30px 30px"}} />
          {/* Animated decoration blobs */}
          <div className="absolute -right-12 -top-12 w-48 h-48 bg-white/8 rounded-full animate-spin-slow" style={{animationDuration:"20s"}} />
          <div className="absolute right-24 -bottom-8 w-32 h-32 bg-cyan-400/15 rounded-full animate-morph-blob" style={{animationDuration:"12s"}} />
          <div className="absolute right-8 top-3 w-16 h-16 bg-white/10 rounded-full animate-float" />
          <div className="absolute left-1/3 -bottom-6 w-24 h-24 bg-blue-400/10 rounded-full animate-float-rev" />
          {/* Meteor decoration */}
          <div className="absolute top-3 right-40 meteor-line opacity-60" />
          <div className="absolute bottom-4 right-60 meteor-line opacity-40" style={{animationDelay:"1.5s"}} />

          <div className="relative z-10 flex flex-col sm:flex-row sm:items-center justify-between gap-3 px-6 py-5">
            <div>
              <div className="flex items-center gap-2 mb-1">
                <span className="text-2xl animate-wave inline-block">{greeting.icon}</span>
                <h2 className="text-lg font-bold">{greeting.text}, <span className="text-yellow-300 drop-shadow">{user?.name ?? "nhân viên"}</span>!</h2>
              </div>
              <p className="text-white/85 text-xs">Chào mừng bạn đến với hệ thống quản lý giặt ủi TVwash</p>
              <div className="flex items-center gap-2 mt-2">
                <div className="w-1.5 h-1.5 rounded-full bg-green-400 animate-pulse" />
                <span className="text-[10px] text-white/75">Hệ thống đang hoạt động bình thường</span>
              </div>
            </div>
            <div className="text-right rounded-2xl px-4 py-2.5" style={{background:"rgba(0,0,0,0.25)", backdropFilter:"blur(12px)", border:"1px solid rgba(255,255,255,0.2)"}}>
              <div className="text-xl font-mono font-bold tracking-wider text-yellow-300 drop-shadow">{formatTime(time)}</div>
              <div className="text-[11px] text-white/90 capitalize mt-0.5 font-medium">{formatDate(time)}</div>
            </div>
          </div>
        </div>

        {/* Action cards */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-5">
          <ActionCard
            icon="add_circle"
            title="Nhận Đồ"
            description="Nhận đồ và lập phiếu cho khách"
            gradient="linear-gradient(135deg, #10b981 0%, #059669 100%)"
            accentLight="rgba(16,185,129,0.07)"
            iconColor="text-emerald-600"
            shadowColor="rgba(16,185,129,0.18)"
            delay="delay-100"
            onClick={() => navigate("/nhan-do")}
          />
          <ActionCard
            icon="format_list_bulleted"
            title="Danh Sách Đồ"
            description="Quản lý tình trạng đơn hàng"
            gradient="linear-gradient(135deg, #3b82f6 0%, #2563eb 100%)"
            accentLight="rgba(59,130,246,0.07)"
            iconColor="text-blue-600"
            shadowColor="rgba(37,99,235,0.18)"
            delay="delay-200"
            onClick={() => navigate("/danh-sach-do")}
          />
          <ActionCard
            icon="account_balance_wallet"
            title="Thu - Chi"
            description="Thu, Chi ngoài dịch vụ giặt ủi"
            gradient="linear-gradient(135deg, #f97316 0%, #ea580c 100%)"
            accentLight="rgba(249,115,22,0.07)"
            iconColor="text-orange-600"
            shadowColor="rgba(249,115,22,0.18)"
            delay="delay-300"
            onClick={() => navigate("/thu-chi")}
          />
        </div>

        {/* Feature cards */}
        <div className="glass-card p-6 md:p-8 rounded-3xl animate-fade-up delay-300"
             style={{boxShadow:"0 8px 32px rgba(37,99,235,0.08)"}}>
          <div className="flex items-center gap-3 mb-6">
            <div className="w-8 h-8 rounded-xl bg-gradient-to-br from-nav-bg to-cyan-500 flex items-center justify-center shadow-md shadow-blue-200">
              <span className="material-symbols-outlined text-white text-[18px]">grid_view</span>
            </div>
            <h3 className="text-sm font-bold text-slate-700 uppercase tracking-wider">Chức năng hệ thống</h3>
            <div className="ml-auto h-px flex-1 bg-gradient-to-r from-blue-100 to-transparent max-w-[120px]" />
          </div>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3">
            <div onClick={() => navigate("/ket-qua-kinh-doanh")} className="group">
              <FeatureCard icon="menu_book" title="Sổ Quỹ Cửa Hàng" description="Các khoản thu chi cửa hàng"
                iconColor="text-emerald-600" iconBg="bg-emerald-50" accentColor="bg-emerald-400" delay="delay-100" />
            </div>
            <div onClick={() => navigate("/bao-cao-doanh-thu")} className="group">
              <FeatureCard icon="bar_chart" title="Báo Cáo Kinh Doanh" description="Xem biểu đồ & báo cáo kinh doanh"
                iconColor="text-violet-600" iconBg="bg-violet-50" accentColor="bg-violet-400" delay="delay-150" />
            </div>
            <div onClick={() => navigate("/khach-hang")} className="group">
              <FeatureCard icon="groups" title="Khách Hàng" description="Danh sách khách hàng"
                iconColor="text-sky-600" iconBg="bg-sky-50" accentColor="bg-sky-400" delay="delay-200" />
            </div>
            <div onClick={() => navigate("/bang-gia-dich-vu")} className="group">
              <FeatureCard icon="payments" title="Bảng Giá" description="Bảng giá dịch vụ"
                iconColor="text-amber-600" iconBg="bg-amber-50" accentColor="bg-amber-400" delay="delay-250" />
            </div>
            <div onClick={() => navigate("/don-vi-tinh")} className="group">
              <FeatureCard icon="straighten" title="Đơn Vị Tính" description="Danh sách đơn vị tính"
                iconColor="text-teal-600" iconBg="bg-teal-50" accentColor="bg-teal-400" delay="delay-300" />
            </div>
            <div onClick={() => navigate("/ke-luu-do")} className="group">
              <FeatureCard icon="shelves" title="Kệ Lưu Đồ" description="Danh sách kệ cất đồ"
                iconColor="text-indigo-600" iconBg="bg-indigo-50" accentColor="bg-indigo-400" delay="delay-350" />
            </div>
            <div onClick={() => navigate("/tai-khoan-ngan-hang")} className="group">
              <FeatureCard icon="account_balance" title="Ngân Hàng" description="Danh sách ngân hàng"
                iconColor="text-blue-700" iconBg="bg-blue-50" accentColor="bg-blue-500" delay="delay-400" />
            </div>
            <div onClick={() => navigate("/cua-hang")} className="group">
              <FeatureCard icon="store" title="Cửa Hàng" description="Thông tin cửa hàng"
                iconColor="text-orange-600" iconBg="bg-orange-50" accentColor="bg-orange-400" delay="delay-450" />
            </div>
            <div onClick={() => navigate("/nhat-ky")} className="group">
              <FeatureCard icon="history_edu" title="Nhật Ký" description="Quản lý lịch sử thao tác"
                iconColor="text-slate-600" iconBg="bg-slate-100" accentColor="bg-slate-400" delay="delay-500" />
            </div>
            <div onClick={() => navigate("/phan-quyen")} className="group">
              <FeatureCard icon="admin_panel_settings" title="Phân Quyền" description="Quản lý & phân quyền nhân viên"
                iconColor="text-rose-600" iconBg="bg-rose-50" accentColor="bg-rose-400" delay="delay-600" />
            </div>
            <div onClick={handleLogout} className="group">
              <FeatureCard icon="logout" title="Đăng Xuất" description="Rời khỏi hệ thống" isLogout={true} delay="delay-700" />
            </div>
          </div>
        </div>
      </main>

      <Footer />
    </>
  );
}



