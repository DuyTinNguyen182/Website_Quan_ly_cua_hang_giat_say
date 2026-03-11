import { useNavigate } from "react-router-dom";
import { useEffect, useState } from "react";
import Header from "../components/Header";
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

  return (
    <div className="h-screen flex flex-col overflow-hidden text-sm bg-main-bg font-sans">
      <Header user={user} activePage="ket-qua-kinh-doanh" />

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
