import { useNavigate } from "react-router-dom";
import { useEffect, useState, useMemo } from "react";
import {
  ChevronLeft,
  Check,
  Filter,
  Search,
  Printer,
  Clock,
  Plus,
  Download,
  X,
} from "lucide-react";

const mockRecords = [
  {
    id: "1",
    title: "Mua bột giặt",
    type: "CHI",
    code: "CH260304.01",
    method: "Tiền mặt",
    recipient: "NGUYỄN VĂN PHƯƠNG",
    creator: "TRẦN TRUNG PHÚC",
    time: "10:16 SA, 04/03/2026",
    amount: 112000,
  },
  {
    id: "2",
    title: "Mua nước xả vải",
    type: "CHI",
    code: "CH260304.02",
    method: "Chuyển khoản",
    recipient: "PHÙNG THỊ BÉ",
    creator: "TRẦN TRUNG PHÚC",
    time: "10:17 SA, 04/03/2026",
    amount: 113000,
  },
];

const formatCurrency = (n) => new Intl.NumberFormat("vi-VN").format(n);

export default function ThuChiPage() {
  const navigate = useNavigate();
  const [user, setUser] = useState({ name: "Người dùng", store: "" });

  useEffect(() => {
    const stored = localStorage.getItem("user");
    if (stored) setUser(JSON.parse(stored));
    else navigate("/login");
  }, [navigate]);

  const [searchTerm, setSearchTerm] = useState("");
  const [isEditMode, setIsEditMode] = useState(false);

  const filtered = useMemo(() => {
    if (!searchTerm.trim()) return mockRecords;
    const q = searchTerm.toLowerCase();
    return mockRecords.filter(
      (r) =>
        r.title.toLowerCase().includes(q) ||
        r.code.toLowerCase().includes(q) ||
        r.recipient.toLowerCase().includes(q),
    );
  }, [searchTerm]);

  const totalThu = useMemo(
    () => mockRecords.filter((r) => r.type === "THU").reduce((s, r) => s + r.amount, 0),
    [],
  );
  const totalChi = useMemo(
    () => mockRecords.filter((r) => r.type === "CHI").reduce((s, r) => s + r.amount, 0),
    [],
  );

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
              <NavLink href="/thu-chi" icon="payments" label="THU - CHI" active />
              <div className="relative group">
                <button className="px-3 py-1.5 rounded-md flex items-center gap-1 text-[11px] font-bold hover:bg-white/10 transition-colors nav-link-text">
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
        {/* Left: back link */}
        <button
          onClick={() => navigate("/home")}
          className="flex items-center text-nav-bg font-bold text-sm hover:opacity-80 transition-opacity"
        >
          <ChevronLeft className="w-5 h-5 mr-0.5" />
          SỔ QUỸ
        </button>

        {/* Center: summary tabs */}
        <div className="flex bg-white rounded-full overflow-hidden shadow-sm border border-gray-100 h-[52px]">
          {/* Active tab */}
          <div className="flex flex-col justify-center items-center px-6 bg-nav-bg text-white cursor-pointer">
            <div className="flex items-center gap-2">
              <Check size={14} />
              <span className="font-bold text-sm">Các khoản Thu | Chi</span>
            </div>
            <span className="text-[9px] font-normal opacity-90">
              Tiền phát sinh ngoài giặt ủi
            </span>
          </div>
          {/* Tổng thu */}
          <div className="flex flex-col justify-center items-center px-6 min-w-[140px] border-r border-gray-100 cursor-pointer hover:bg-gray-50 transition-colors">
            <span className="text-accent-blue font-bold text-lg leading-tight">
              {formatCurrency(totalThu)}
            </span>
            <span className="text-[10px] text-gray-500 font-medium">Tổng tiền thu</span>
          </div>
          {/* Tổng chi */}
          <div className="flex flex-col justify-center items-center px-6 min-w-[140px] cursor-pointer hover:bg-gray-50 transition-colors">
            <span className="text-nav-bg font-bold text-lg leading-tight">
              {formatCurrency(totalChi)}
            </span>
            <span className="text-[10px] text-gray-500 font-medium">Tổng tiền chi</span>
          </div>
        </div>

        {/* Right: controls */}
        <div className="flex items-center gap-4">
          <div className="flex items-center gap-2">
            <span className="text-xs font-bold text-slate-500">SỬA</span>
            <button
              onClick={() => setIsEditMode(!isEditMode)}
              className={`w-10 h-5 rounded-full relative p-0.5 transition-colors ${isEditMode ? "bg-nav-bg" : "bg-slate-300"}`}
            >
              <div
                className={`w-4 h-4 bg-white rounded-full shadow-sm transition-transform ${isEditMode ? "translate-x-5" : "translate-x-0"}`}
              />
            </button>
          </div>
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
      <main className="flex-1 overflow-y-auto custom-scrollbar p-4">
        <div className="max-w-7xl mx-auto">
          {/* Search */}
          <div className="bg-white rounded-xl shadow-sm border border-gray-100 overflow-hidden">
            <div className="px-6 py-4 border-b border-gray-100">
              <div className="flex items-center gap-3">
                <Search size={20} className="text-gray-400 shrink-0" />
                <input
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  type="text"
                  placeholder={`Tìm trong ${filtered.length} phiếu...`}
                  className="w-full text-sm text-gray-600 border-none focus:ring-0 p-0 placeholder-gray-400 outline-none"
                />
                {searchTerm && (
                  <button onClick={() => setSearchTerm("")} className="text-gray-400 hover:text-gray-600">
                    <X size={16} />
                  </button>
                )}
              </div>
            </div>

            {/* Table */}
            <div className="overflow-x-auto">
              <table className="w-full text-left border-collapse">
                <thead>
                  <tr>
                    <th className="text-[11px] font-bold text-gray-500 uppercase py-3 px-6 border-b border-gray-200 w-24 text-center">
                      In phiếu
                    </th>
                    <th className="text-[11px] font-bold text-gray-500 uppercase py-3 px-6 border-b border-gray-200">
                      Thông tin phiếu
                    </th>
                    <th className="text-[11px] font-bold text-gray-500 uppercase py-3 px-6 border-b border-gray-200">
                      Hình thức
                    </th>
                    <th className="text-[11px] font-bold text-gray-500 uppercase py-3 px-6 border-b border-gray-200">
                      Nhân viên lập
                    </th>
                    <th className="text-[11px] font-bold text-gray-500 uppercase py-3 px-6 border-b border-gray-200 text-right">
                      Số tiền
                    </th>
                  </tr>
                </thead>
                <tbody>
                  {filtered.length > 0 ? (
                    filtered.map((r) => (
                      <tr key={r.id} className="hover:bg-gray-50 transition-colors">
                        <td className="py-4 px-6 border-b border-gray-100 align-top text-center">
                          <Printer
                            size={20}
                            className="text-gray-600 cursor-pointer hover:text-nav-bg mx-auto"
                          />
                        </td>
                        <td className="py-4 px-6 border-b border-gray-100 align-top">
                          <div className="flex items-center gap-2 mb-1">
                            <span className="font-bold text-gray-800 text-[14px]">
                              {r.title}
                            </span>
                            <span
                              className={`text-white text-[9px] px-1.5 py-0.5 rounded font-bold uppercase ${
                                r.type === "THU" ? "bg-accent-green" : "bg-orange-500"
                              }`}
                            >
                              {r.type}
                            </span>
                          </div>
                          <div className="text-[12px] text-gray-500">
                            Mã phiếu:{" "}
                            <span className="font-semibold text-gray-700">{r.code}</span>
                          </div>
                        </td>
                        <td className="py-4 px-6 border-b border-gray-100 align-top">
                          <div className="font-bold text-gray-800 text-[14px] mb-1">
                            {r.method}
                          </div>
                          <div className="text-[12px] text-gray-500 uppercase">
                            Người nhận:{" "}
                            <span className="font-bold text-gray-700">{r.recipient}</span>
                          </div>
                        </td>
                        <td className="py-4 px-6 border-b border-gray-100 align-top">
                          <div className="font-bold text-gray-800 text-[14px] mb-1 uppercase">
                            {r.creator}
                          </div>
                          <div className="text-[11px] text-gray-500 flex items-center gap-1">
                            <Clock size={14} />
                            {r.time}
                          </div>
                        </td>
                        <td className="py-4 px-6 border-b border-gray-100 align-top text-right">
                          <span className="font-bold text-gray-900 text-[16px]">
                            {formatCurrency(r.amount)}
                          </span>
                        </td>
                      </tr>
                    ))
                  ) : (
                    <tr>
                      <td colSpan={5} className="py-12 text-center text-slate-400 italic">
                        Không tìm thấy phiếu nào
                      </td>
                    </tr>
                  )}
                </tbody>
              </table>
            </div>
          </div>
        </div>
      </main>

      {/* ─── FAB ─── */}
      <button className="fixed bottom-6 right-6 w-14 h-14 bg-nav-bg text-white rounded-full shadow-lg hover:opacity-90 transition-transform active:scale-95 flex items-center justify-center z-50">
        <Plus className="w-8 h-8" />
      </button>
    </div>
  );
}
