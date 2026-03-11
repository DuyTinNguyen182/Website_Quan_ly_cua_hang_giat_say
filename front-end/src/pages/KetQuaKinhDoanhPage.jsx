import { useNavigate } from "react-router-dom";
import { useEffect, useState } from "react";
import { ChevronLeft, Filter } from "lucide-react";

const summaryData = {
  thuHomNay: 520000,
  chiHomNay: 225000,
  soDuHienTai: 295000,
};

const detailRows = [
  { label: "1. Tiền thu từ dịch vụ giặt ủi", amount: 520000, hasDetail: true },
  { label: "2. Các khoản thu khác", amount: 0, hasDetail: true },
  { label: "3. Các khoản chi phát sinh", amount: 225000, hasDetail: true },
  { label: "4. Tiền chưa thu từ dịch vụ giặt ủi", amount: 479000, hasDetail: true },
];

const formatCurrency = (n) => new Intl.NumberFormat("vi-VN").format(n);

const SummaryCard = ({ icon, title, amount, bgClass, textClass }) => (
  <div className="bg-white p-6 rounded-xl shadow-sm border border-dashed border-gray-200 flex items-center gap-6">
    <div className={`w-14 h-14 ${bgClass} rounded-full flex items-center justify-center text-white`}>
      <span className="material-symbols-outlined text-2xl">{icon}</span>
    </div>
    <div>
      <p className="text-xs font-semibold text-gray-500 uppercase tracking-wider mb-1">{title}</p>
      <p className={`text-2xl font-bold ${textClass}`}>{amount}</p>
    </div>
  </div>
);

export default function KetQuaKinhDoanhPage() {
  const navigate = useNavigate();
  const [user, setUser] = useState({ name: "Người dùng", store: "" });

  useEffect(() => {
    const stored = localStorage.getItem("user");
    if (stored) setUser(JSON.parse(stored));
    else navigate("/login");
  }, [navigate]);

  const [activeTab, setActiveTab] = useState("TẤT CẢ");
  const tabs = ["TẤT CẢ", "TIỀN MẶT", "CHUYỂN KHOẢN"];

  const soDuTruoc = 0;
  const soDuHienTai =
    soDuTruoc + detailRows[0].amount + detailRows[1].amount - detailRows[2].amount;
  const tongQuy = soDuHienTai + detailRows[3].amount;

  const NavLink = ({ href, icon, label, active }) => (
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

  return (
    <div className="h-screen flex flex-col overflow-hidden text-sm bg-main-bg font-sans">
      {/* ─── Navbar ─── */}
      <nav className="bg-nav-bg text-white shadow-md sticky top-0 z-50 shrink-0">
        <div className="max-w-full mx-auto px-4 lg:px-6 h-14 flex items-center justify-between">
          <div className="flex items-center gap-6">
            <div
              className="flex items-center gap-2 flex-shrink-0 cursor-pointer"
              onClick={() => navigate("/home")}
            >
              <div className="w-8 h-8 bg-orange-500 rounded-lg flex items-center justify-center shadow-sm">
                <span className="text-white font-bold text-lg">U</span>
              </div>
              <span className="text-xl font-bold tracking-tight lowercase">viwash</span>
            </div>

            <div className="hidden xl:flex items-center gap-1">
              <NavLink href="/home" icon="home" label="TRANG CHỦ" />
              <NavLink href="/nhan-do" icon="add_circle" label="NHẬN ĐỒ" />
              <NavLink href="/danh-sach-do" icon="fact_check" label="DANH SÁCH ĐỒ" />
              <NavLink href="/thu-chi" icon="payments" label="THU - CHI" />
              <div className="relative group">
                <button className="px-3 py-1.5 rounded-md flex items-center gap-1 text-[11px] font-bold hover:bg-white/10 transition-colors nav-link-text nav-item-active">
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
              <button className="px-3 py-1.5 rounded-md flex items-center gap-1 text-[11px] font-bold hover:bg-white/10 transition-colors nav-link-text">
                <span className="material-symbols-outlined text-[18px]">assignment</span>
                KHAI BÁO
                <span className="material-symbols-outlined text-[16px]">expand_more</span>
              </button>
              <button className="px-3 py-1.5 rounded-md flex items-center gap-1 text-[11px] font-bold hover:bg-white/10 transition-colors nav-link-text">
                <span className="material-symbols-outlined text-[18px]">settings</span>
                HỆ THỐNG
                <span className="material-symbols-outlined text-[16px]">expand_more</span>
              </button>
            </div>
          </div>

          <div className="flex items-center gap-3">
            <div className="flex items-center gap-2 bg-white/15 px-3 py-1 rounded-md cursor-pointer hover:bg-white/25 transition-all">
              <span className="material-symbols-outlined text-[18px]">account_circle</span>
              <span className="text-[11px] font-semibold whitespace-nowrap">
                Chào, {user.name}
              </span>
            </div>
          </div>
        </div>
      </nav>

      {/* ─── Sub-header ─── */}
      <div className="bg-indigo-50/60 border-b border-indigo-100 px-4 py-3 flex flex-wrap items-center justify-between gap-4 shrink-0">
        <button
          onClick={() => navigate("/home")}
          className="flex items-center text-nav-bg font-bold text-sm hover:opacity-80 transition-opacity"
        >
          <ChevronLeft className="w-5 h-5 mr-0.5" />
          SỔ QUỸ CỬA HÀNG
        </button>

        {/* Segmented control */}
        <div className="inline-flex bg-white rounded-full p-0.5 shadow-sm border border-gray-100">
          {tabs.map((tab) => (
            <button
              key={tab}
              onClick={() => setActiveTab(tab)}
              className={`px-6 py-2 rounded-full text-xs font-bold transition-colors flex items-center gap-1 ${
                activeTab === tab
                  ? "bg-nav-bg text-white"
                  : "text-nav-bg hover:bg-gray-50"
              }`}
            >
              {activeTab === tab && (
                <span className="material-symbols-outlined text-[14px]">check</span>
              )}
              {tab}
            </button>
          ))}
        </div>

        <button className="flex items-center gap-1 text-slate-600 hover:text-slate-800 transition-colors">
          <Filter className="w-4 h-4" />
          <span className="text-xs font-bold uppercase">Lọc</span>
        </button>
      </div>

      {/* ─── Main ─── */}
      <main className="flex-1 overflow-y-auto custom-scrollbar py-6 px-4">
        <div className="max-w-7xl mx-auto space-y-6">
          {/* Summary cards */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            <SummaryCard
              icon="trending_up"
              title="THU HÔM NAY"
              amount={`+${formatCurrency(summaryData.thuHomNay)}`}
              bgClass="bg-accent-green"
              textClass="text-accent-green"
            />
            <SummaryCard
              icon="trending_down"
              title="CHI HÔM NAY"
              amount={`-${formatCurrency(summaryData.chiHomNay)}`}
              bgClass="bg-accent-orange"
              textClass="text-accent-orange"
            />
            <SummaryCard
              icon="account_balance_wallet"
              title="SỐ DƯ HIỆN TẠI"
              amount={formatCurrency(summaryData.soDuHienTai)}
              bgClass="bg-accent-blue"
              textClass="text-accent-blue"
            />
          </div>

          {/* Details list */}
          <div className="bg-white rounded-xl shadow-sm overflow-hidden border border-gray-100">
            <div className="p-4 border-b border-gray-100">
              <p className="text-xs italic text-gray-500">
                *Chi tiết các khoản thu chi trong hôm nay
              </p>
            </div>

            <div className="divide-y divide-gray-50">
              {/* A. Số dư trước */}
              <div className="px-6 py-4 flex items-center justify-between">
                <span className="font-semibold text-gray-800 text-sm">
                  A. SỐ DƯ TRƯỚC PHÁT SINH
                </span>
                <span className="px-3 py-1 bg-gray-100 rounded text-sm font-medium">
                  {formatCurrency(soDuTruoc)}
                </span>
              </div>

              {/* Detail rows 1-4 */}
              {detailRows.map((row, idx) => (
                <div key={idx} className="px-6 py-4 flex items-center justify-between">
                  <div>
                    <p className="text-sm font-medium text-gray-700">{row.label}</p>
                    {row.hasDetail && (
                      <button className="text-xs text-accent-blue hover:underline">
                        Chi tiết
                      </button>
                    )}
                  </div>
                  <span className="font-bold text-gray-800">
                    {formatCurrency(row.amount)}
                  </span>
                </div>
              ))}

              {/* B. Số dư hiện tại */}
              <div className="px-6 py-5 flex items-center justify-between bg-gray-50/50">
                <span className="font-semibold text-gray-800 text-sm">
                  B. SỐ DƯ HIỆN TẠI = (A) + (1) + (2) - (3)
                </span>
                <span className="px-4 py-1 bg-gray-100 rounded-md font-bold text-gray-800">
                  {formatCurrency(soDuHienTai)}
                </span>
              </div>

              {/* C. Tổng quỹ */}
              <div className="px-6 py-5 flex items-center justify-between bg-gray-50/50">
                <span className="font-semibold text-gray-800 text-sm">
                  C. TỔNG QUỸ CỬA HÀNG = (B) + (4)
                </span>
                <span className="px-4 py-1 bg-gray-100 rounded-md font-bold text-gray-800">
                  {formatCurrency(tongQuy)}
                </span>
              </div>
            </div>
          </div>
        </div>
      </main>
    </div>
  );
}
