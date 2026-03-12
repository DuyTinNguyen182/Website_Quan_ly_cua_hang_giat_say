import { useNavigate } from "react-router-dom";
import { useEffect, useState, useMemo } from "react";
import { useAuth } from "../context/AuthContext";
import Header from "../components/Header";
import axiosInstance from "../api/axiosInstance";
import {
  Search,
  ChevronLeft,
  Filter,
  CheckCircle,
  Clock,
  Plus,
  Pencil,
  Trash2,
  Printer,
} from "lucide-react";

const statusTabs = [
  { label: "Tất cả", value: null, active: "bg-nav-bg text-white", inactive: "text-nav-bg border border-nav-bg/40 hover:bg-nav-bg/10" },
  { label: "Chờ bổ sung đồ", value: "PENDING_ITEMS", active: "bg-amber-500 text-white", inactive: "text-amber-600 border border-amber-300 hover:bg-amber-50" },
  { label: "Đã đủ đồ", value: "ITEMS_READY", active: "bg-teal-500 text-white", inactive: "text-teal-600 border border-teal-300 hover:bg-teal-50" },
  { label: "Đang giặt", value: "WASHING", active: "bg-blue-500 text-white", inactive: "text-blue-600 border border-blue-300 hover:bg-blue-50" },
  { label: "Giặt xong", value: "READY", active: "bg-emerald-500 text-white", inactive: "text-emerald-600 border border-emerald-300 hover:bg-emerald-50" },
  { label: "Giao khách", value: "COMPLETED", active: "bg-sky-500 text-white", inactive: "text-sky-600 border border-sky-300 hover:bg-sky-50" },
  { label: "Đã hủy", value: "CANCELLED", active: "bg-red-500 text-white", inactive: "text-red-500 border border-red-300 hover:bg-red-50" },
];

const STATUS_LABEL = {
  RECEIVED: "Đơn mới",
  PENDING_ITEMS: "Chờ bổ sung đồ",
  ITEMS_READY: "Đã đủ đồ",
  WASHING: "Đang giặt",
  READY: "Giặt xong",
  COMPLETED: "Giao khách",
  CANCELLED: "Đã hủy",
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

const ALL_STATUSES = [
  { value: "PENDING_ITEMS", label: "Chờ bổ sung đồ",  color: "bg-yellow-400",  text: "text-yellow-700",  bg: "hover:bg-yellow-50" },
  { value: "ITEMS_READY",   label: "Đã đủ đồ",        color: "bg-teal-500",    text: "text-teal-700",    bg: "hover:bg-teal-50" },
  { value: "WASHING",       label: "Đang giặt",        color: "bg-blue-500",    text: "text-blue-700",    bg: "hover:bg-blue-50" },
  { value: "READY",         label: "Giặt xong",        color: "bg-emerald-500", text: "text-emerald-700", bg: "hover:bg-emerald-50" },
  { value: "COMPLETED",     label: "Giao khách",       color: "bg-sky-500",     text: "text-sky-700",     bg: "hover:bg-sky-50" },
  { value: "CANCELLED",     label: "Đã hủy",           color: "bg-red-500",     text: "text-red-600",     bg: "hover:bg-red-50" },
];

const formatCurrency = (amount) =>
  new Intl.NumberFormat("vi-VN").format(amount);

const StatusModal = ({ ticket, onStatusChange, onClose }) => {
  const currentStatus = ALL_STATUSES.find((s) => s.value === ticket.status);

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center"
      style={{ backgroundColor: "rgba(0,0,0,0.45)" }}
      onClick={onClose}
    >
      <div
        className="bg-white rounded-3xl shadow-2xl w-80 overflow-hidden"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Tiêu đề */}
        <div className="px-6 pt-5 pb-3 text-center">
          <div className="text-[11px] font-extrabold text-slate-400 uppercase tracking-widest mb-1">
            Chuyển trạng thái
          </div>
          <div className="text-[13px] font-bold text-slate-600 truncate">
            {ticket.order_code} – {ticket.customer_id?.full_name ?? ""}
          </div>
        </div>

        {/* Danh sách trạng thái */}
        <div className="px-4 pb-2 flex flex-col gap-2">
          {ALL_STATUSES.map((s) => {
            const isCurrent = ticket.status === s.value;
            return (
              <button
                key={s.value}
                onClick={() => {
                  if (!isCurrent) onStatusChange(ticket._id, s.value);
                  onClose();
                }}
                className={`w-full py-3 rounded-2xl text-[15px] font-extrabold uppercase tracking-wide transition-all active:scale-95
                  ${isCurrent
                    ? `${s.color} text-white shadow-md`
                    : "bg-slate-100 text-slate-500 hover:bg-slate-200"
                  }`}
              >
                {s.label}
              </button>
            );
          })}
        </div>

        {/* Kệ lưu đồ */}
        {ticket.shelf_id?.name && (
          <div className="mx-4 mb-3 mt-1 border-2 border-dashed border-sky-300 rounded-2xl px-4 py-2.5 text-center">
            <div className="text-[14px] font-extrabold text-sky-500 uppercase">
              {ticket.shelf_id.name}
            </div>
            <div className="text-[11px] text-slate-400">(Vị trí cất đồ của khách)</div>
          </div>
        )}

        {/* Nút đóng */}
        <div className="px-4 pb-5">
          <button
            onClick={onClose}
            className="w-full py-2.5 text-[14px] font-bold text-slate-500 hover:text-slate-700 transition-colors"
          >
            ĐÓNG
          </button>
        </div>
      </div>
    </div>
  );
};

const TicketItem = ({ ticket, onStatusChange, onDelete }) => {
  const [showStatusModal, setShowStatusModal] = useState(false);

  const formatDate = (iso) => {
    if (!iso) return "—";
    const d = new Date(iso);
    const pad = (v) => String(v).padStart(2, "0");
    const h = d.getHours();
    const m = pad(d.getMinutes());
    const period = h < 12 ? "SA" : "CH";
    const hh = (h % 12 || 12).toString();
    return `${hh}:${m} ${period}, ${pad(d.getDate())}/${pad(d.getMonth() + 1)}/${d.getFullYear()}`;
  };

  return (
    <>
      {showStatusModal && (
        <StatusModal
          ticket={ticket}
          onStatusChange={onStatusChange}
          onClose={() => setShowStatusModal(false)}
        />
      )}
    <div className="grid grid-cols-12 px-4 py-3.5 border-b border-slate-100 hover:bg-slate-50 transition-colors items-center text-sm">
      <div className="col-span-3 space-y-1 self-start">
        <div className="text-slate-700">
          Mã phiếu: <span className="font-bold">{ticket.order_code}</span>
        </div>
        {ticket.payment_status === "PAID" ? (
          <div className="flex items-center gap-1 text-xs text-emerald-600 font-medium">
            <CheckCircle className="w-3.5 h-3.5" />
            Thanh toán trước ({ticket.payment_method === "BANK" ? "Chuyển khoản" : "Tiền mặt"})
          </div>
        ) : (
          <div className="text-xs text-slate-400">Chưa thanh toán</div>
        )}
      </div>

      <div className="col-span-3 space-y-1">
        <div className="flex items-center gap-2 flex-wrap">
          <span className="text-nav-bg font-bold uppercase">
            {ticket.customer_id?.full_name ?? "—"}
          </span>

          {/* Badge trạng thái – bấm để mở modal đổi trạng thái */}
          <button
            onClick={() => setShowStatusModal(true)}
            className={`text-white text-[10px] px-2.5 py-0.5 rounded-full font-bold cursor-pointer hover:opacity-80 active:scale-95 transition-all select-none ${statusColors[ticket.status] || "bg-slate-500"}`}
            title="Bấm để đổi trạng thái"
          >
            {STATUS_LABEL[ticket.status] ?? ticket.status}
          </button>
        </div>
        <div className="text-slate-600">
          Điện thoại: <span className="font-medium">{ticket.customer_id?.phone ?? "—"}</span>
        </div>
        {ticket.customer_id?.address && (
          <div className="text-slate-500 text-xs">
            Địa chỉ: <span className="font-medium text-slate-600">{ticket.customer_id.address}</span>
          </div>
        )}
      </div>

      <div className="col-span-2 space-y-1 self-start">
        <div className="font-bold text-slate-700 uppercase">
          {ticket.created_by?.full_name ?? "—"}
        </div>
        <div className="flex items-center gap-1 text-xs text-slate-500">
          <Clock className="w-3.5 h-3.5" />
          {formatDate(ticket.created_at)}
        </div>
        <div className="text-xs text-slate-500">
          Vị trí kệ: <span className="font-semibold text-slate-600">{ticket.shelf_id?.name ?? "—"}</span>
        </div>
      </div>

      <div className="col-span-1 text-center">
        <span className="font-bold text-nav-bg text-[15px]">
          {formatCurrency(ticket.total_amount)}
        </span>
      </div>

      <div className="col-span-3 flex items-center justify-end gap-2">
        <button
          className="flex items-center gap-1.5 text-[11px] font-bold text-violet-600 bg-violet-50 border border-violet-200 hover:bg-violet-100 hover:border-violet-400 px-2.5 py-1.5 rounded-full transition-all"
          title="In hóa đơn"
        >
          <Printer className="w-3.5 h-3.5" />
          In
        </button>
        <button
          className="flex items-center gap-1.5 text-[11px] font-bold text-sky-600 bg-sky-50 border border-sky-200 hover:bg-sky-100 hover:border-sky-400 px-2.5 py-1.5 rounded-full transition-all"
          title="Sửa"
        >
          <Pencil className="w-3.5 h-3.5" />
          Sửa
        </button>
        <button
          onClick={() => onDelete(ticket._id)}
          className="flex items-center gap-1.5 text-[11px] font-bold text-red-500 bg-red-50 border border-red-200 hover:bg-red-100 hover:border-red-400 px-2.5 py-1.5 rounded-full transition-all"
          title="Xóa"
        >
          <Trash2 className="w-3.5 h-3.5" />
          Xóa
        </button>
      </div>
    </div>
    </>
  );
};

export default function DanhSachDoPage() {
  const navigate = useNavigate();
  const { user } = useAuth();

  useEffect(() => {
    if (!user) navigate("/login");
  }, [user, navigate]);

  const [orders, setOrders] = useState([]);
  const [activeTab, setActiveTab] = useState(null);
  const [searchTerm, setSearchTerm] = useState("");
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

  const handleDelete = async (id) => {
    if (!window.confirm("Xóa phiếu này?")) return;
    try {
      await axiosInstance.delete(`/orders/${id}`);
      loadOrders();
    } catch {
      alert("Không thể xóa phiếu!");
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

      <div className="bg-white border-b border-slate-200 px-4 py-2 flex flex-wrap items-center justify-between gap-2 shrink-0">
        <div className="flex items-center gap-3">
          <button
            onClick={() => navigate("/home")}
            className="flex items-center text-nav-bg font-bold text-sm hover:opacity-80 transition-opacity whitespace-nowrap"
          >
            <ChevronLeft className="w-5 h-5 mr-0.5" />
            HOME
          </button>

          <div className="flex items-center gap-1 overflow-x-auto">
            {statusTabs.map((tab) => (
              <button
                key={tab.label}
                onClick={() => setActiveTab(tab.value)}
                className={`px-3.5 py-1 rounded-full text-xs font-bold whitespace-nowrap transition-all ${
                  activeTab === tab.value
                    ? tab.active
                    : tab.inactive
                }`}
              >
                {tab.label}
              </button>
            ))}
          </div>
        </div>

        <button className="flex items-center gap-1.5 text-slate-600 hover:text-slate-800 border border-slate-300 rounded-full px-3 py-1 transition-colors">
          <Filter className="w-4 h-4" />
          <span className="text-xs font-bold uppercase">LỌC</span>
        </button>
      </div>

      <main className="flex-1 overflow-y-auto custom-scrollbar px-4 pt-3 pb-4">
        <div className="mb-3 relative">
          <Search className="w-4 h-4 absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
          <input
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="w-full pl-9 pr-4 py-2.5 bg-white border border-slate-200 rounded-lg shadow-sm focus:ring-2 focus:ring-nav-bg/20 placeholder:text-slate-400 transition-all outline-none text-sm"
            placeholder={`Tìm trong ${filtered.length} phiếu...`}
            type="text"
          />
        </div>

        <div className="bg-white rounded-xl shadow-sm border border-slate-200 overflow-hidden">
          <div className="grid grid-cols-12 bg-slate-50 border-b border-slate-200 px-4 py-2.5 text-xs font-bold text-slate-500 uppercase tracking-wider">
            <div className="col-span-3">Thông tin phiếu</div>
            <div className="col-span-3">Khách hàng</div>
            <div className="col-span-2">Nhân viên lập</div>
            <div className="col-span-1 text-center">Tổng tiền</div>
            <div className="col-span-3 text-center">Tác vụ</div>
          </div>

          {loading ? (
            <div className="p-12 text-center text-slate-400 italic">Đang tải...</div>
          ) : filtered.length > 0 ? (
            filtered.map((ticket) => (
              <TicketItem
                key={ticket._id}
                ticket={ticket}
                onStatusChange={handleStatusChange}
                onDelete={handleDelete}
              />
            ))
          ) : (
            <div className="p-12 text-center text-slate-400 italic">
              Không tìm thấy phiếu nào
            </div>
          )}
        </div>
      </main>

      <button
        onClick={() => navigate("/nhan-do")}
        className="fixed bottom-6 right-6 w-14 h-14 bg-nav-bg text-white rounded-full shadow-lg hover:opacity-90 transition-transform active:scale-95 flex items-center justify-center z-50"
      >
        <Plus className="w-8 h-8" />
      </button>
    </div>
  );
}
