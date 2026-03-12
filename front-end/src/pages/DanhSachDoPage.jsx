import { useNavigate } from "react-router-dom";
import { useEffect, useState, useMemo } from "react";
import { useAuth } from "../context/AuthContext";
import Header from "../components/Header";
import axiosInstance from "../api/axiosInstance";
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

const statusTabs = [
  { label: "Tất cả", value: null },
  { label: "Chờ bổ sung đồ", value: "PENDING_ITEMS" },
  { label: "Đã đủ đồ", value: "ITEMS_READY" },
  { label: "Đang giặt", value: "WASHING" },
  { label: "Giặt xong", value: "READY" },
  { label: "Giao khách", value: "COMPLETED" },
  { label: "Đã hủy", value: "CANCELLED" },
];

const STATUS_LABEL = {
  RECEIVED: "ĐỞ N MỚI",
  PENDING_ITEMS: "CHỜC BỔ SUNG ĐỒ",
  ITEMS_READY: "ĐÃ ĐỦ ĐỒ",
  WASHING: "ĐANG GIẶT",
  READY: "GIẶT XONG",
  COMPLETED: "GIAO KHÁCH",
  CANCELLED: "ĐÃ HỦY",
};

const statusColors = {
  RECEIVED: "bg-orange-500",
  PENDING_ITEMS: "bg-yellow-500",
  ITEMS_READY: "bg-teal-500",
  WASHING: "bg-nav-bg",
  READY: "bg-accent-green",
  COMPLETED: "bg-sky-500",
  CANCELLED: "bg-red-500",
};

const formatCurrency = (amount) =>
  new Intl.NumberFormat("vi-VN").format(amount);

/* ─── Ticket row ─── */
const TicketItem = ({ ticket, onStatusChange }) => {
  const nextStatus = {
    PENDING_ITEMS: "ITEMS_READY",
    ITEMS_READY: "WASHING",
    WASHING: "READY",
    READY: "COMPLETED",
  };
  const nextLabel = {
    PENDING_ITEMS: "Đã đủ đồ",
    ITEMS_READY: "Bắt đầu giặt",
    WASHING: "Giặt xong",
    READY: "Giao khách",
  };
  const canAdvance = nextStatus[ticket.status];

  const formatDate = (iso) => {
    if (!iso) return "—";
    const d = new Date(iso);
    const pad = (v) => String(v).padStart(2, "0");
    return `${pad(d.getHours())}:${pad(d.getMinutes())} ${pad(d.getDate())}/${pad(d.getMonth() + 1)}/${d.getFullYear()}`;
  };

  return (
    <div className="grid grid-cols-12 px-4 py-4 border-b border-slate-100 hover:bg-slate-50 transition-colors items-start">
      {/* Dots */}
      <div className="col-span-1 text-slate-300">
        <MoreVertical className="w-5 h-5 cursor-pointer" />
      </div>

      {/* Thông tin phiếu */}
      <div className="col-span-3 space-y-1">
        {canAdvance && (
          <button
            onClick={() => onStatusChange(ticket._id, nextStatus[ticket.status])}
            className="text-nav-bg font-bold text-xs uppercase cursor-pointer hover:underline"
          >
            {nextLabel[ticket.status]}
          </button>
        )}
        <div className="text-sm font-medium">
          Mã phiếu: <span className="font-bold">{ticket.order_code}</span>
        </div>
        <div className="text-xs text-slate-500">
          Hẹn lấy: {formatDate(ticket.expected_return_date)}
        </div>
        {ticket.payment_status === "PAID" && (
          <div className="flex items-center text-xs text-emerald-600 font-medium">
            <CheckCircle className="w-4 h-4 mr-1" />
            Đã thanh toán ({ticket.payment_method === "BANK" ? "Chuyển khoản" : "Tiền mặt"})
          </div>
        )}
      </div>

      {/* Khách hàng */}
      <div className="col-span-4 space-y-1">
        <div className="flex items-center gap-2 flex-wrap">
          <span className="text-nav-bg font-bold uppercase">
            {ticket.customer_id?.full_name ?? "—"}
          </span>
          <span
            className={`text-white text-[10px] px-2 py-0.5 rounded font-bold uppercase ${statusColors[ticket.status] || "bg-slate-500"}`}
          >
            {STATUS_LABEL[ticket.status] ?? ticket.status}
          </span>
        </div>
        <div className="text-sm">
          Điện thoại: <span className="font-medium">{ticket.customer_id?.phone ?? "—"}</span>
        </div>
      </div>

      {/* Nhân viên lập */}
      <div className="col-span-3 space-y-1">
        <div className="font-bold text-slate-600 uppercase">
          {ticket.created_by?.full_name ?? "—"}
        </div>
        <div className="flex items-center text-xs text-slate-500">
          <Clock className="w-4 h-4 mr-1" />
          {formatDate(ticket.created_at)}
        </div>
        <div className="text-sm">
          Vị trí kệ: <span className="font-bold">{ticket.shelf_id?.name ?? "—"}</span>
        </div>
      </div>

      {/* Tổng tiền */}
      <div className="col-span-1 text-right">
        <span className="inline-block px-3 py-1 bg-indigo-50 text-nav-bg font-bold rounded-full text-sm">
          {formatCurrency(ticket.total_amount)}
        </span>
      </div>
    </div>
  );
};

/* ════════════════════════════════════════════ */
export default function DanhSachDoPage() {
  const navigate = useNavigate();
  const { user } = useAuth();

  useEffect(() => {
    if (!user) navigate("/login");
  }, [user, navigate]);

  const [orders, setOrders] = useState([]);
  const [activeTab, setActiveTab] = useState(null);
  const [searchTerm, setSearchTerm] = useState("");
  const [isEditMode, setIsEditMode] = useState(false);
  const [loading, setLoading] = useState(true);

  const loadOrders = () => {
    setLoading(true);
    const params = activeTab ? `?status=${activeTab}` : "";
    axiosInstance.get(`/orders${params}`)
      .then((res) => setOrders(res.data))
      .catch(() => {})
      .finally(() => setLoading(false));
  };

  useEffect(() => { if (user) loadOrders(); }, [activeTab, user]);

  const handleStatusChange = async (id, newStatus) => {
    try {
      await axiosInstance.patch(`/orders/${id}/status`, { status: newStatus });
      loadOrders();
    } catch {
      alert("Không thể cập nhật trạng thái!");
    }
  };

  const filtered = useMemo(() => {
    if (!searchTerm.trim()) return orders;
    const q = searchTerm.toLowerCase();
    return orders.filter(
      (t) =>
        t.order_code?.toLowerCase().includes(q) ||
        t.customer_id?.full_name?.toLowerCase().includes(q) ||
        t.customer_id?.phone?.includes(q),
    );
  }, [orders, searchTerm]);

  return (
    <div className="h-screen flex flex-col overflow-hidden text-sm bg-main-bg font-sans">
      <Header activePage="danh-sach-do" />

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
            {loading ? (
              <div className="p-12 text-center text-slate-400 italic">Đang tải...</div>
            ) : filtered.length > 0 ? (
              filtered.map((ticket) => (
                <TicketItem key={ticket._id} ticket={ticket} onStatusChange={handleStatusChange} />
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
