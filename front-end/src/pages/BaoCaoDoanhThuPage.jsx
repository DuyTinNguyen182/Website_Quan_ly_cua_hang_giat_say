import { useNavigate } from "react-router-dom";
import { useEffect, useState } from "react";
import { useAuth } from "../context/AuthContext";
import Header from "../components/Header";
import axiosInstance from "../api/axiosInstance";
import { ChevronLeft, Filter, Download } from "lucide-react";

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
              T{d.month.toString().padStart(2, "0")}
            </span>
          </div>
        );
      })}
    </div>
  );
};

const buildEmptyMonths = (year) =>
  Array.from({ length: 12 }, (_, i) => ({ month: i + 1, year, revenue: 0, expense: 0 }));

export default function BaoCaoDoanhThuPage() {
  const navigate = useNavigate();
  const { user } = useAuth();

  useEffect(() => {
    if (!user) navigate("/login");
  }, [user, navigate]);

  const currentYear = new Date().getFullYear();
  const [selectedYear, setSelectedYear] = useState(currentYear);
  const [monthlyData, setMonthlyData] = useState(buildEmptyMonths(currentYear));
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!user) return;
    setLoading(true);
    const from = new Date(selectedYear, 0, 1).toISOString();
    const to = new Date(selectedYear, 11, 31, 23, 59, 59).toISOString();

    Promise.all([
      axiosInstance.get(`/transactions?type=INCOME&from=${from}&to=${to}`),
      axiosInstance.get(`/transactions?type=EXPENSE&from=${from}&to=${to}`),
    ])
      .then(([incRes, expRes]) => {
        const buckets = buildEmptyMonths(selectedYear);
        incRes.data.forEach((t) => {
          const m = new Date(t.transaction_date).getMonth(); // 0-indexed
          buckets[m].revenue += t.amount;
        });
        expRes.data.forEach((t) => {
          const m = new Date(t.transaction_date).getMonth();
          buckets[m].expense += t.amount;
        });
        setMonthlyData(buckets);
      })
      .catch(() => {})
      .finally(() => setLoading(false));
  }, [user, selectedYear]);

  const totalRevenue = monthlyData.reduce((s, d) => s + d.revenue, 0);
  const totalExpense = monthlyData.reduce((s, d) => s + d.expense, 0);
  const totalProfit = totalRevenue - totalExpense;

  return (
    <div className="h-screen flex flex-col overflow-hidden text-sm bg-main-bg font-sans">
      <Header activePage="bao-cao-doanh-thu" />

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
          <select
            value={selectedYear}
            onChange={(e) => setSelectedYear(Number(e.target.value))}
            className="px-3 py-1 bg-white rounded-full text-xs font-bold text-nav-bg shadow-sm border border-gray-100 focus:outline-none"
          >
            {[currentYear - 1, currentYear, currentYear + 1].map((y) => (
              <option key={y} value={y}>{y}</option>
            ))}
          </select>
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
                  {loading ? "—" : formatCurrency(totalRevenue)}
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
                  {loading ? "—" : formatCurrency(totalExpense)}
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
                  {loading ? "—" : formatCurrency(totalProfit)}
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
                          Tháng {String(d.month).padStart(2, "0")}/{d.year}
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
