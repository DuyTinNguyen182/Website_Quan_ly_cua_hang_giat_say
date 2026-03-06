import { useNavigate } from "react-router-dom";
import { useEffect, useState, useMemo } from "react";
import {
  Search,
  ChevronLeft,
  Calendar,
  Filter,
  Download,
  MoreVertical,
  CheckCircle,
  Clock,
  Plus,
} from "lucide-react";

const mockTickets = [
  {
    id: "1",
    code: "CH01260304005",
    pickupTime: "9:45 SA ngày mai",
    customerName: "KIM THỊ LIÊN",
    status: "ĐƠN MỚI",
    customerPhone: "043678902",
    customerAddress: "Mậu Thân",
    staffName: "TRẦN TRUNG PHÚC",
    createdTime: "9:45 SA, 04/03/2026",
    shelfPosition: "C-03",
    totalAmount: 120000,
  },
  {
    id: "2",
    code: "CH01260304004",
    pickupTime: "9:45 SA ngày mai",
    paymentStatus: "Thanh toán trước (Chuyển khoản)",
    customerName: "KIM THỊ LIÊN",
    status: "ĐƠN MỚI",
    customerPhone: "043678902",
    customerAddress: "Mậu Thân",
    staffName: "TRẦN TRUNG PHÚC",
    createdTime: "9:41 SA, 04/03/2026",
    shelfPosition: "C-02",
    totalAmount: 290000,
  },
  {
    id: "3",
    code: "CH01260304002",
    pickupTime: "9:45 SA Thứ 6, 06/03",
    customerName: "KIM THỊ LIÊN",
    status: "ĐANG GIẶT",
    customerPhone: "043678902",
    customerAddress: "Mậu Thân",
    staffName: "TRẦN TRUNG PHÚC",
    createdTime: "9:30 SA, 04/03/2026",
    shelfPosition: "C-03",
    totalAmount: 115000,
  },
  {
    id: "4",
    code: "CH01260304001",
    pickupTime: "9:45 SA Thứ 7, 07/03",
    customerName: "TRẦN VĂN HÙNG",
    status: "ĐƠN MỚI",
    customerPhone: "0987098234",
    customerAddress: "Sơn Thông",
    staffName: "TRẦN TRUNG PHÚC",
    createdTime: "9:28 SA, 04/03/2026",
    shelfPosition: "A-01",
    totalAmount: 244000,
  },
];

const statusTabs = [
  { label: "Tất cả", value: null },
  { label: "Đơn mới", value: "ĐƠN MỚI" },
  { label: "Đang giặt", value: "ĐANG GIẶT" },
  { label: "Giặt xong", value: "GIẶT XONG" },
  { label: "Giao khách", value: "GIAO KHÁCH" },
  { label: "Khách nợ", value: "KHÁCH NỢ" },
];

const statusColors = {
  "ĐƠN MỚI": "bg-orange-500",
  "ĐANG GIẶT": "bg-nav-bg",
  "GIẶT XONG": "bg-accent-green",
  "GIAO KHÁCH": "bg-sky-500",
  "KHÁCH NỢ": "bg-red-500",
};

const formatCurrency = (amount) =>
  new Intl.NumberFormat("vi-VN").format(amount);

/* ─── Ticket row ─── */
const TicketItem = ({ ticket }) => (
  <div className="grid grid-cols-12 px-4 py-4 border-b border-slate-100 hover:bg-slate-50 transition-colors items-start">
    {/* Dots */}
    <div className="col-span-1 text-slate-300">
      <MoreVertical className="w-5 h-5 cursor-pointer" />
    </div>

    {/* Thông tin phiếu */}
    <div className="col-span-3 space-y-1">
      <div className="text-nav-bg font-bold text-xs uppercase cursor-pointer hover:underline">
        Chuyển trạng thái
      </div>
      <div className="text-sm font-medium">
        Mã phiếu: <span className="font-bold">{ticket.code}</span>
      </div>
      <div className="text-xs text-slate-500">
        Hẹn lấy: {ticket.pickupTime}
      </div>
      {ticket.paymentStatus && (
        <div className="flex items-center text-xs text-emerald-600 font-medium">
          <CheckCircle className="w-4 h-4 mr-1" />
          {ticket.paymentStatus}
        </div>
      )}
    </div>

    {/* Khách hàng */}
    <div className="col-span-4 space-y-1">
      <div className="flex items-center gap-2 flex-wrap">
        <span className="text-nav-bg font-bold uppercase">
          {ticket.customerName}
        </span>
        <span
          className={`text-white text-[10px] px-2 py-0.5 rounded font-bold uppercase ${statusColors[ticket.status] || "bg-slate-500"}`}
        >
          {ticket.status}
        </span>
      </div>
      <div className="text-sm">
        Điện thoại: <span className="font-medium">{ticket.customerPhone}</span>
      </div>
      <div className="text-sm">
        Địa chỉ: <span className="font-medium">{ticket.customerAddress}</span>
      </div>
    </div>

    {/* Nhân viên lập */}
    <div className="col-span-3 space-y-1">
      <div className="font-bold text-slate-600 uppercase">
        {ticket.staffName}
      </div>
      <div className="flex items-center text-xs text-slate-500">
        <Clock className="w-4 h-4 mr-1" />
        {ticket.createdTime}
      </div>
      <div className="text-sm">
        Vị trí kệ: <span className="font-bold">{ticket.shelfPosition}</span>
      </div>
    </div>

    {/* Tổng tiền */}
    <div className="col-span-1 text-right">
      <span className="inline-block px-3 py-1 bg-indigo-50 text-nav-bg font-bold rounded-full text-sm">
        {formatCurrency(ticket.totalAmount)}
      </span>
    </div>
  </div>
);

/* ════════════════════════════════════════════ */
export default function DanhSachDoPage() {
  const navigate = useNavigate();
  const [user, setUser] = useState({ name: "Người dùng", store: "" });

  useEffect(() => {
    const stored = localStorage.getItem("user");
    if (stored) setUser(JSON.parse(stored));
    else navigate("/login");
  }, [navigate]);

  const [activeTab, setActiveTab] = useState(null);
  const [searchTerm, setSearchTerm] = useState("");
  const [isEditMode, setIsEditMode] = useState(false);

  const filtered = useMemo(() => {
    let list = mockTickets;
    if (activeTab) list = list.filter((t) => t.status === activeTab);
    if (searchTerm.trim()) {
      const q = searchTerm.toLowerCase();
      list = list.filter(
        (t) =>
          t.code.toLowerCase().includes(q) ||
          t.customerName.toLowerCase().includes(q) ||
          t.customerPhone.includes(q),
      );
    }
    return list;
  }, [activeTab, searchTerm]);

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
              <span className="text-xl font-bold tracking-tight lowercase">
                viwash
              </span>
            </div>

            <div className="hidden xl:flex items-center gap-1">
              <NavLink href="/home" icon="home" label="TRANG CHỦ" />
              <NavLink href="/nhan-do" icon="add_circle" label="NHẬN ĐỒ" />
              <NavLink
                href="/danh-sach-do"
                icon="fact_check"
                label="DANH SÁCH ĐỒ"
                active
              />
              <NavLink href="/thu-chi" icon="payments" label="THU - CHI" />
              <button className="px-3 py-1.5 rounded-md flex items-center gap-1 text-[11px] font-bold hover:bg-white/10 transition-colors nav-link-text">
                <span className="material-symbols-outlined text-[18px]">
                  analytics
                </span>
                KẾT QUẢ KINH DOANH
                <span className="material-symbols-outlined text-[16px]">
                  expand_more
                </span>
              </button>
              <button className="px-3 py-1.5 rounded-md flex items-center gap-1 text-[11px] font-bold hover:bg-white/10 transition-colors nav-link-text">
                <span className="material-symbols-outlined text-[18px]">
                  assignment
                </span>
                KHAI BÁO
                <span className="material-symbols-outlined text-[16px]">
                  expand_more
                </span>
              </button>
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

      {/* ─── Filter Bar ─── */}
      <div className="bg-indigo-50/60 border-b border-indigo-100 px-4 py-2 flex flex-wrap items-center justify-between gap-4 shrink-0">
        <div className="flex items-center gap-4">
          {/* Back to home */}
          <button
            onClick={() => navigate("/home")}
            className="flex items-center text-nav-bg font-bold text-sm hover:opacity-80 transition-opacity"
          >
            <ChevronLeft className="w-5 h-5 mr-0.5" />
            HOME
          </button>

          {/* Status tabs */}
          <div className="flex items-center gap-1 overflow-x-auto">
            {statusTabs.map((tab) => (
              <button
                key={tab.label}
                onClick={() => setActiveTab(tab.value)}
                className={`px-4 py-1 rounded-full text-xs font-bold whitespace-nowrap transition-colors ${
                  activeTab === tab.value
                    ? "bg-slate-700 text-white"
                    : "text-slate-600 hover:bg-white/60"
                }`}
              >
                {tab.label}
              </button>
            ))}
          </div>
        </div>

        {/* Right controls */}
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
            <Calendar className="w-4 h-4" />
            <span className="text-xs font-bold uppercase">Chi tiết ca</span>
          </button>
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
          <div className="mb-4 relative">
            <Search className="w-5 h-5 absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
            <input
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full pl-10 pr-4 py-3 bg-white border-none rounded-lg shadow-sm focus:ring-2 focus:ring-nav-bg/20 placeholder:text-slate-400 transition-all outline-none"
              placeholder={`Tìm trong ${filtered.length} phiếu...`}
              type="text"
            />
          </div>

          {/* Ticket table */}
          <div className="bg-white rounded-xl shadow-sm border border-slate-200 overflow-hidden">
            {/* Header row */}
            <div className="grid grid-cols-12 bg-slate-50 border-b border-slate-200 px-4 py-3 text-xs font-bold text-slate-500 uppercase tracking-wider">
              <div className="col-span-1"></div>
              <div className="col-span-3">Thông tin phiếu</div>
              <div className="col-span-4">Khách hàng</div>
              <div className="col-span-3">Nhân viên lập</div>
              <div className="col-span-1 text-right">Tổng tiền</div>
            </div>

            {/* Ticket rows */}
            {filtered.length > 0 ? (
              filtered.map((ticket) => (
                <TicketItem key={ticket.id} ticket={ticket} />
              ))
            ) : (
              <div className="p-12 text-center text-slate-400 italic">
                Không tìm thấy phiếu nào
              </div>
            )}
          </div>
        </div>
      </main>

      {/* ─── FAB: Nhận đồ mới ─── */}
      <button
        onClick={() => navigate("/nhan-do")}
        className="fixed bottom-6 right-6 w-14 h-14 bg-nav-bg text-white rounded-full shadow-lg hover:opacity-90 transition-transform active:scale-95 flex items-center justify-center z-50"
      >
        <Plus className="w-8 h-8" />
      </button>
    </div>
  );
}
