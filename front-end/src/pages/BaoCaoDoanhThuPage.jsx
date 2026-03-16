import { useNavigate } from "react-router-dom";
import { useEffect, useState, useMemo } from "react";
import { useAuth } from "../context/AuthContext";
import Header from "../components/Header";
import axiosInstance from "../api/axiosInstance";
import { ChevronLeft, Download } from "lucide-react";

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

const TIME_MODES = [
  { value: "today",  label: "Hôm nay",   active: "bg-violet-600 text-white border-violet-600",  inactive: "text-violet-600 border-violet-300 bg-violet-50 hover:bg-violet-100" },
  { value: "week",   label: "Tuần này",  active: "bg-sky-500 text-white border-sky-500",       inactive: "text-sky-600 border-sky-300 bg-sky-50 hover:bg-sky-100" },
  { value: "month",  label: "Tháng này", active: "bg-teal-500 text-white border-teal-500",     inactive: "text-teal-600 border-teal-300 bg-teal-50 hover:bg-teal-100" },
  { value: "year",   label: "Năm này",   active: "bg-amber-500 text-white border-amber-500",   inactive: "text-amber-600 border-amber-300 bg-amber-50 hover:bg-amber-100" },
  { value: "custom", label: "Tùy chọn",  active: "bg-rose-500 text-white border-rose-500",     inactive: "text-rose-600 border-rose-300 bg-rose-50 hover:bg-rose-100" },
];

const getDateRange = (mode, customFrom, customTo) => {
  const now = new Date();
  if (mode === "today") {
    const s = new Date(now.getFullYear(), now.getMonth(), now.getDate());
    const e = new Date(now.getFullYear(), now.getMonth(), now.getDate(), 23, 59, 59);
    return { from: s.toISOString(), to: e.toISOString() };
  }
  if (mode === "week") {
    const day = now.getDay();
    const diff = day === 0 ? -6 : 1 - day;
    const s = new Date(now); s.setDate(now.getDate() + diff); s.setHours(0, 0, 0, 0);
    const e = new Date(s); e.setDate(s.getDate() + 6); e.setHours(23, 59, 59, 999);
    return { from: s.toISOString(), to: e.toISOString() };
  }
  if (mode === "month") {
    const s = new Date(now.getFullYear(), now.getMonth(), 1);
    const e = new Date(now.getFullYear(), now.getMonth() + 1, 0, 23, 59, 59);
    return { from: s.toISOString(), to: e.toISOString() };
  }
  if (mode === "year") {
    const s = new Date(now.getFullYear(), 0, 1);
    const e = new Date(now.getFullYear(), 11, 31, 23, 59, 59);
    return { from: s.toISOString(), to: e.toISOString() };
  }
  // custom
  const s = customFrom ? new Date(customFrom + "T00:00:00") : new Date(now.getFullYear(), 0, 1);
  const e = customTo ? new Date(customTo + "T23:59:59") : new Date();
  return { from: s.toISOString(), to: e.toISOString() };
};

const PIE_COLORS = {
  RECEIVED: "#f97316",
  PENDING_ITEMS: "#f59e0b",
  ITEMS_READY: "#14b8a6",
  WASHING: "#6366f1",
  READY: "#10b981",
  COMPLETED: "#0ea5e9",
  CANCELLED: "#ef4444",
};
const STATUS_LABELS = {
  RECEIVED: "Đơn mới",
  PENDING_ITEMS: "Chờ bổ sung đồ",
  ITEMS_READY: "Đã đủ đồ",
  WASHING: "Đang giặt",
  READY: "Giặt xong",
  COMPLETED: "Giao khách",
  CANCELLED: "Đã hủy",
};
const ALL_STATUSES = ["RECEIVED", "PENDING_ITEMS", "ITEMS_READY", "WASHING", "READY", "COMPLETED", "CANCELLED"];

const polarToCart = (cx, cy, r, deg) => ({
  x: cx + r * Math.cos(((deg - 90) * Math.PI) / 180),
  y: cy + r * Math.sin(((deg - 90) * Math.PI) / 180),
});

const PieChart = ({ data }) => {
  const total = data.reduce((s, d) => s + d.count, 0);
  if (total === 0)
    return <div className="h-44 flex items-center justify-center text-gray-400 italic text-sm">Không có dữ liệu</div>;

  const cx = 90, cy = 90, r = 82;
  let cumDeg = 0;
  const slices = data
    .filter((d) => d.count > 0)
    .map((d) => {
      const deg = (d.count / total) * 360;
      const start = cumDeg;
      cumDeg += deg;
      if (deg >= 359.99) return { ...d, isCircle: true };
      const s = polarToCart(cx, cy, r, start);
      const e = polarToCart(cx, cy, r, cumDeg);
      const large = deg > 180 ? 1 : 0;
      const path = `M ${cx} ${cy} L ${s.x.toFixed(2)} ${s.y.toFixed(2)} A ${r} ${r} 0 ${large} 1 ${e.x.toFixed(2)} ${e.y.toFixed(2)} Z`;
      return { ...d, path };
    });

  return (
    <div className="flex items-center gap-6 flex-wrap">
      <svg width="180" height="180" viewBox="0 0 180 180" className="flex-shrink-0">
        {slices.map((s, i) =>
          s.isCircle ? (
            <circle key={i} cx={cx} cy={cy} r={r} fill={PIE_COLORS[s.status] || "#94a3b8"} />
          ) : (
            <path key={i} d={s.path} fill={PIE_COLORS[s.status] || "#94a3b8"} stroke="white" strokeWidth="2" />
          )
        )}
      </svg>
      <div className="space-y-2">
        {data
          .filter((d) => d.count > 0)
          .map((d, i) => (
            <div key={i} className="flex items-center gap-2 text-xs">
              <div className="w-3 h-3 rounded-full flex-shrink-0" style={{ backgroundColor: PIE_COLORS[d.status] || "#94a3b8" }} />
              <span className="text-gray-700 font-medium">
                {STATUS_LABELS[d.status] ?? d.status}{" "}
                <span className="text-gray-400 font-normal">({d.count})</span>
              </span>
            </div>
          ))}
      </div>
    </div>
  );
};

const HorizontalBarChart = ({ data }) => {
  const maxVal = Math.max(...data.map((d) => d.count), 1);
  if (data.length === 0)
    return <div className="text-center text-gray-400 italic text-sm py-8">Không có dữ liệu</div>;
  return (
    <div className="space-y-2.5">
      {data.map((d, i) => (
        <div key={i} className="flex items-center gap-3">
          <div className="w-44 text-[11px] text-gray-600 text-right truncate flex-shrink-0 pr-1">{d.name}</div>
          <div className="flex-1 bg-gray-100 rounded-full h-5 overflow-hidden">
            <div
              className="h-full bg-sky-400 rounded-full transition-all duration-500"
              style={{ width: `${(d.count / maxVal) * 100}%` }}
            />
          </div>
          <div className="w-10 text-[11px] font-bold text-gray-700 flex-shrink-0">{d.count.toLocaleString("vi-VN")}</div>
        </div>
      ))}
    </div>
  );
};

export default function BaoCaoDoanhThuPage() {
  const navigate = useNavigate();
  const { user } = useAuth();

  useEffect(() => {
    if (!user) navigate("/login");
  }, [user, navigate]);

  const [timeMode, setTimeMode] = useState("month");
  const [customFrom, setCustomFrom] = useState("");
  const [customTo, setCustomTo] = useState("");
  const [monthlyData, setMonthlyData] = useState(buildEmptyMonths(new Date().getFullYear()));
  const [loading, setLoading] = useState(true);
  const [orderStatusData, setOrderStatusData] = useState([]);
  const [topServices, setTopServices] = useState([]);
  const [summaryStats, setSummaryStats] = useState({
    totalOrders: 0, totalAmount: 0,
    paidOrders: 0, paidAmount: 0,
    unpaidActiveOrders: 0, unpaidActiveAmount: 0,
    debtOrders: 0, debtAmount: 0,
  });

  const dateRange = useMemo(() => getDateRange(timeMode, customFrom, customTo), [timeMode, customFrom, customTo]);

  useEffect(() => {
    if (!user) return;
    if (timeMode === "custom" && (!customFrom || !customTo)) return;
    setLoading(true);
    const { from, to } = dateRange;
    const year = new Date(from).getFullYear();

    axiosInstance.get(`/reports/revenue?from=${from}&to=${to}`)
      .then((res) => {
        const data = res.data;
        setMonthlyData(data.monthlyData || buildEmptyMonths(year));
        setOrderStatusData(data.orderStatusData || []);
        setSummaryStats(data.summaryStats || {
          totalOrders: 0, totalAmount: 0,
          paidOrders: 0, paidAmount: 0,
          unpaidActiveOrders: 0, unpaidActiveAmount: 0,
          debtOrders: 0, debtAmount: 0,
        });
        setTopServices(data.topServices || []);
      })
      .catch(() => {})
      .finally(() => setLoading(false));
  }, [user, dateRange, timeMode, customFrom, customTo]);

  const totalRevenue = monthlyData.reduce((s, d) => s + d.revenue, 0);
  const totalExpense = monthlyData.reduce((s, d) => s + d.expense, 0);
  const totalProfit = totalRevenue - totalExpense;

  return (
    <div className="h-screen flex flex-col overflow-hidden text-sm bg-main-bg font-sans">
      <Header activePage="bao-cao-doanh-thu" />

      {/* ─── Sub-header ─── */}
      <div className="bg-indigo-50/60 border-b border-indigo-100 px-4 py-2.5 flex flex-wrap items-center justify-between gap-3 shrink-0">
        <button
          onClick={() => navigate("/home")}
          className="flex items-center text-nav-bg font-bold text-sm hover:opacity-80 transition-opacity whitespace-nowrap"
        >
          <ChevronLeft className="w-5 h-5 mr-0.5" />
          BÁO CÁO DOANH THU
        </button>

        {/* Time mode selector */}
        <div className="flex items-center gap-1.5 flex-wrap">
          {TIME_MODES.map((m) => (
            <button
              key={m.value}
              onClick={() => setTimeMode(m.value)}
              className={`px-3.5 py-1 rounded-full text-xs font-bold whitespace-nowrap transition-all border ${
                timeMode === m.value ? m.active : m.inactive
              }`}
            >
              {m.label}
            </button>
          ))}
          {timeMode === "custom" && (
            <div className="flex items-center gap-2 ml-2">
              <input
                type="date"
                value={customFrom}
                onChange={(e) => setCustomFrom(e.target.value)}
                className="px-2 py-1 text-xs border border-gray-300 rounded-lg focus:outline-none focus:ring-1 focus:ring-nav-bg"
              />
              <span className="text-xs text-gray-400 font-medium">→</span>
              <input
                type="date"
                value={customTo}
                onChange={(e) => setCustomTo(e.target.value)}
                className="px-2 py-1 text-xs border border-gray-300 rounded-lg focus:outline-none focus:ring-1 focus:ring-nav-bg"
              />
            </div>
          )}
        </div>

        <button className="flex items-center gap-1 text-slate-600 hover:text-slate-800 transition-colors">
          <Download className="w-4 h-4" />
          <span className="text-xs font-bold uppercase">Xuất</span>
        </button>
      </div>

      {/* ─── Main ─── */}
      <main className="flex-1 overflow-y-auto custom-scrollbar py-6 px-4 page-enter">
        <div className="max-w-7xl mx-auto space-y-6">
          {/* Summary cards */}
          <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
            {/* Card 1 - Purple */}
            <div className="rounded-xl p-5 text-white flex flex-col gap-3 card-lift animate-fade-up delay-100" style={{ background: "linear-gradient(135deg,#7c3aed,#6d28d9)", boxShadow: "0 8px 24px rgba(124,58,237,0.35)" }}>
              <div className="text-xs font-bold uppercase tracking-wide opacity-90">Đơn hàng phát sinh</div>
              <div className="text-2xl font-black">{loading ? "—" : formatCurrency(summaryStats.totalAmount)}</div>
              <div className="inline-flex items-center gap-1 bg-white/20 rounded-full px-2.5 py-0.5 text-xs font-bold w-fit">
                {summaryStats.totalOrders} đơn
              </div>
            </div>
            {/* Card 2 - Green */}
            <div className="rounded-xl p-5 text-white flex flex-col gap-3 card-lift animate-fade-up delay-200" style={{ background: "linear-gradient(135deg,#16a34a,#15803d)", boxShadow: "0 8px 24px rgba(22,163,74,0.35)" }}>
              <div className="text-xs font-bold uppercase tracking-wide opacity-90">Đã thu tiền khách</div>
              <div className="text-2xl font-black">{loading ? "—" : formatCurrency(summaryStats.paidAmount)}</div>
              <div className="inline-flex items-center gap-1 bg-white/20 rounded-full px-2.5 py-0.5 text-xs font-bold w-fit">
                {summaryStats.paidOrders} đơn
              </div>
            </div>
            {/* Card 3 - Orange */}
            <div className="rounded-xl p-5 text-white flex flex-col gap-3 card-lift animate-fade-up delay-300" style={{ background: "linear-gradient(135deg,#ea580c,#c2410c)", boxShadow: "0 8px 24px rgba(234,88,12,0.35)" }}>
              <div className="text-xs font-bold uppercase tracking-wide opacity-90">Chưa thu &amp; Chờ giao</div>
              <div className="text-2xl font-black">{loading ? "—" : formatCurrency(summaryStats.unpaidActiveAmount)}</div>
              <div className="inline-flex items-center gap-1 bg-white/20 rounded-full px-2.5 py-0.5 text-xs font-bold w-fit">
                {summaryStats.unpaidActiveOrders} đơn
              </div>
            </div>
            {/* Card 4 - Dark slate */}
            <div className="rounded-xl p-5 text-white flex flex-col gap-3 card-lift animate-fade-up delay-400" style={{ background: "linear-gradient(135deg,#475569,#334155)", boxShadow: "0 8px 24px rgba(71,85,105,0.35)" }}>
              <div className="text-xs font-bold uppercase tracking-wide opacity-90">Khách nợ</div>
              <div className="text-2xl font-black">{loading ? "—" : formatCurrency(summaryStats.debtAmount)}</div>
              <div className="inline-flex items-center gap-1 bg-white/20 rounded-full px-2.5 py-0.5 text-xs font-bold w-fit">
                {summaryStats.debtOrders} đơn
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

          {/* Pie chart + Horizontal bar chart */}
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-6">
              <h3 className="font-bold text-gray-800 mb-5">Trạng thái đơn</h3>
              <PieChart data={orderStatusData} />
            </div>
            <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-6">
              <h3 className="font-bold text-gray-800 mb-5">Top dịch vụ</h3>
              <HorizontalBarChart data={topServices} />
            </div>
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
                        className="table-row-hover hover:bg-indigo-50/40 transition-all"
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



