import { useNavigate } from "react-router-dom";
import { useEffect, useState } from "react";
import { ChevronLeft, Filter, Download } from "lucide-react";

/* ─── mock data: doanh thu 12 tháng ─── */
const monthlyData = [
  { month: "01/2026", revenue: 12500000, expense: 3200000 },
  { month: "02/2026", revenue: 15800000, expense: 4100000 },
  { month: "03/2026", revenue: 11200000, expense: 2900000 },
  { month: "04/2026", revenue: 0, expense: 0 },
  { month: "05/2026", revenue: 0, expense: 0 },
  { month: "06/2026", revenue: 0, expense: 0 },
  { month: "07/2026", revenue: 0, expense: 0 },
  { month: "08/2026", revenue: 0, expense: 0 },
  { month: "09/2026", revenue: 0, expense: 0 },
  { month: "10/2026", revenue: 0, expense: 0 },
  { month: "11/2026", revenue: 0, expense: 0 },
  { month: "12/2026", revenue: 0, expense: 0 },
];

const formatCurrency = (n) => new Intl.NumberFormat("vi-VN").format(n);

/* ─── Simple bar chart component ─── */
const BarChart = ({ data }) => {
  const maxVal = Math.max(...data.map((d) => Math.max(d.revenue, d.expense)), 1);

  return (
    <div className="flex items-end gap-2 h-52 px-2">
      {data.map((d, idx) => {
        const revH = (d.revenue / maxVal) * 100;
        const expH = (d.expense / maxVal) * 100;
        return (
          <div key={idx} className="flex-1 flex flex-col items-center gap-1">
            <div className="flex items-end gap-0.5 h-44 w-full justify-center">
              <div
                className="bg-accent-blue rounded-t w-3 min-h-[2px] transition-all"
                style={{ height: `${revH}%` }}
                title={`Doanh thu: ${formatCurrency(d.revenue)}`}
              />
              <div
                className="bg-accent-orange rounded-t w-3 min-h-[2px] transition-all"
                style={{ height: `${expH}%` }}
                title={`Chi phí: ${formatCurrency(d.expense)}`}
              />
            </div>
            <span className="text-[9px] text-gray-500 font-medium">
              T{d.month.split("/")[0]}
            </span>
          </div>
        );
      })}
    </div>
  );
};

export default function BaoCaoDoanhThuPage() {
  const navigate = useNavigate();
  const [user, setUser] = useState({ name: "Người dùng", store: "" });

  useEffect(() => {
    const stored = localStorage.getItem("user");
    if (stored) setUser(JSON.parse(stored));
    else navigate("/login");
  }, [navigate]);

  const [selectedYear] = useState("2026");

  const totalRevenue = monthlyData.reduce((s, d) => s + d.revenue, 0);
  const totalExpense = monthlyData.reduce((s, d) => s + d.expense, 0);
  const totalProfit = totalRevenue - totalExpense;

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
              {/* Dropdown: KẾT QUẢ KINH DOANH */}
              <div className="relative group">
                <button className="px-3 py-1.5 rounded-md flex items-center gap-1 text-[11px] font-bold hover:bg-white/10 transition-colors nav-link-text nav-item-active">
                  <span className="material-symbols-outlined text-[18px]">analytics</span>
                  KẾT QUẢ KINH DOANH
                  <span className="material-symbols-outlined text-[16px]">expand_more</span>
                </button>
                <div className="absolute top-full left-0 mt-1 bg-white rounded-lg shadow-xl border border-gray-200 py-1 min-w-[200px] opacity-0 invisible group-hover:opacity-100 group-hover:visible transition-all z-50">
                  <button
                    onClick={() => navigate("/bao-cao-doanh-thu")}
                    className="w-full text-left px-4 py-2.5 text-xs font-semibold text-gray-700 hover:bg-indigo-50 hover:text-nav-bg transition-colors flex items-center gap-2"
                  >
                    <span className="material-symbols-outlined text-[16px]">bar_chart</span>
                    Báo cáo doanh thu tháng
                  </button>
                  <button
                    onClick={() => navigate("/ket-qua-kinh-doanh")}
                    className="w-full text-left px-4 py-2.5 text-xs font-semibold text-gray-700 hover:bg-indigo-50 hover:text-nav-bg transition-colors flex items-center gap-2"
                  >
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
          BÁO CÁO DOANH THU
        </button>

        <div className="flex items-center gap-2">
          <span className="text-xs font-bold text-gray-500">NĂM:</span>
          <span className="px-3 py-1 bg-white rounded-full text-xs font-bold text-nav-bg shadow-sm border border-gray-100">
            {selectedYear}
          </span>
        </div>

        <div className="flex items-center gap-4">
          <button className="flex items-center gap-1 text-slate-600 hover:text-slate-800 transition-colors">
            <Filter className="w-4 h-4" />
            <span className="text-xs font-bold uppercase">Lọc</span>
          </button>
          <button className="flex items-center gap-1 text-slate-600 hover:text-slate-800 transition-colors">
            <Download className="w-4 h-4" />
            <span className="text-xs font-bold uppercase">Xuất</span>
          </button>
        </div>
      </div>

      {/* ─── Main ─── */}
      <main className="flex-1 overflow-y-auto custom-scrollbar py-6 px-4">
        <div className="max-w-7xl mx-auto space-y-6">
          {/* Summary cards */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            <div className="bg-white p-6 rounded-xl shadow-sm border border-dashed border-gray-200 flex items-center gap-6">
              <div className="w-14 h-14 bg-accent-blue rounded-full flex items-center justify-center text-white">
                <span className="material-symbols-outlined text-2xl">trending_up</span>
              </div>
              <div>
                <p className="text-xs font-semibold text-gray-500 uppercase tracking-wider mb-1">
                  TỔNG DOANH THU
                </p>
                <p className="text-2xl font-bold text-accent-blue">
                  {formatCurrency(totalRevenue)}
                </p>
              </div>
            </div>
            <div className="bg-white p-6 rounded-xl shadow-sm border border-dashed border-gray-200 flex items-center gap-6">
              <div className="w-14 h-14 bg-accent-orange rounded-full flex items-center justify-center text-white">
                <span className="material-symbols-outlined text-2xl">trending_down</span>
              </div>
              <div>
                <p className="text-xs font-semibold text-gray-500 uppercase tracking-wider mb-1">
                  TỔNG CHI PHÍ
                </p>
                <p className="text-2xl font-bold text-accent-orange">
                  {formatCurrency(totalExpense)}
                </p>
              </div>
            </div>
            <div className="bg-white p-6 rounded-xl shadow-sm border border-dashed border-gray-200 flex items-center gap-6">
              <div className="w-14 h-14 bg-accent-green rounded-full flex items-center justify-center text-white">
                <span className="material-symbols-outlined text-2xl">savings</span>
              </div>
              <div>
                <p className="text-xs font-semibold text-gray-500 uppercase tracking-wider mb-1">
                  LỢI NHUẬN
                </p>
                <p className="text-2xl font-bold text-accent-green">
                  {formatCurrency(totalProfit)}
                </p>
              </div>
            </div>
          </div>

          {/* Chart */}
          <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-6">
            <div className="flex items-center justify-between mb-6">
              <h3 className="font-bold text-gray-800">Biểu đồ doanh thu & chi phí</h3>
              <div className="flex items-center gap-4 text-xs">
                <div className="flex items-center gap-1.5">
                  <div className="w-3 h-3 rounded-sm bg-accent-blue" />
                  <span className="text-gray-500 font-medium">Doanh thu</span>
                </div>
                <div className="flex items-center gap-1.5">
                  <div className="w-3 h-3 rounded-sm bg-accent-orange" />
                  <span className="text-gray-500 font-medium">Chi phí</span>
                </div>
              </div>
            </div>
            <BarChart data={monthlyData} />
          </div>

          {/* Monthly table */}
          <div className="bg-white rounded-xl shadow-sm border border-gray-100 overflow-hidden">
            <div className="overflow-x-auto">
              <table className="w-full text-left border-collapse">
                <thead>
                  <tr>
                    <th className="text-[11px] font-bold text-gray-500 uppercase py-3 px-6 border-b border-gray-200">
                      Tháng
                    </th>
                    <th className="text-[11px] font-bold text-gray-500 uppercase py-3 px-6 border-b border-gray-200 text-right">
                      Doanh thu
                    </th>
                    <th className="text-[11px] font-bold text-gray-500 uppercase py-3 px-6 border-b border-gray-200 text-right">
                      Chi phí
                    </th>
                    <th className="text-[11px] font-bold text-gray-500 uppercase py-3 px-6 border-b border-gray-200 text-right">
                      Lợi nhuận
                    </th>
                  </tr>
                </thead>
                <tbody>
                  {monthlyData.map((d, idx) => {
                    const profit = d.revenue - d.expense;
                    return (
                      <tr
                        key={idx}
                        className="hover:bg-gray-50 transition-colors"
                      >
                        <td className="py-3.5 px-6 border-b border-gray-100 font-semibold text-gray-700">
                          Tháng {d.month.split("/")[0]}/{d.month.split("/")[1]}
                        </td>
                        <td className="py-3.5 px-6 border-b border-gray-100 text-right font-bold text-accent-blue">
                          {formatCurrency(d.revenue)}
                        </td>
                        <td className="py-3.5 px-6 border-b border-gray-100 text-right font-bold text-accent-orange">
                          {formatCurrency(d.expense)}
                        </td>
                        <td
                          className={`py-3.5 px-6 border-b border-gray-100 text-right font-bold ${profit >= 0 ? "text-accent-green" : "text-red-500"}`}
                        >
                          {profit >= 0 ? "+" : ""}
                          {formatCurrency(profit)}
                        </td>
                      </tr>
                    );
                  })}
                  {/* Totals */}
                  <tr className="bg-gray-50/80">
                    <td className="py-4 px-6 font-bold text-gray-800 uppercase">
                      Tổng cộng
                    </td>
                    <td className="py-4 px-6 text-right font-black text-accent-blue">
                      {formatCurrency(totalRevenue)}
                    </td>
                    <td className="py-4 px-6 text-right font-black text-accent-orange">
                      {formatCurrency(totalExpense)}
                    </td>
                    <td
                      className={`py-4 px-6 text-right font-black ${totalProfit >= 0 ? "text-accent-green" : "text-red-500"}`}
                    >
                      {totalProfit >= 0 ? "+" : ""}
                      {formatCurrency(totalProfit)}
                    </td>
                  </tr>
                </tbody>
              </table>
            </div>
          </div>
        </div>
      </main>
    </div>
  );
}
