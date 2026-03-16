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
  { label: "Đơn mới", value: "RECEIVED", active: "bg-orange-500 text-white", inactive: "text-orange-600 border border-orange-300 hover:bg-orange-50" },
  { label: "Giặt xong", value: "READY", active: "bg-emerald-500 text-white", inactive: "text-emerald-600 border border-emerald-300 hover:bg-emerald-50" },
  { label: "Giao khách", value: "COMPLETED", active: "bg-sky-500 text-white", inactive: "text-sky-600 border border-sky-300 hover:bg-sky-50" },
  { label: "Đã hủy", value: "CANCELLED", active: "bg-red-500 text-white", inactive: "text-red-500 border border-red-300 hover:bg-red-50" },
];

const STATUS_LABEL = {
  RECEIVED: "Đơn mới",
  READY: "Giặt xong",
  COMPLETED: "Giao khách",
  CANCELLED: "Đã hủy",
};

const statusColors = {
  RECEIVED: "bg-orange-500",
  READY: "bg-emerald-500",
  COMPLETED: "bg-sky-500",
  CANCELLED: "bg-red-500",
};

const ALL_STATUSES = [
  { value: "RECEIVED",      label: "Đơn mới",         color: "bg-orange-500", text: "text-orange-700",  bg: "hover:bg-orange-50" },
  { value: "READY",         label: "Giặt xong",       color: "bg-emerald-500", text: "text-emerald-700", bg: "hover:bg-emerald-50" },
  { value: "COMPLETED",     label: "Giao khách",      color: "bg-sky-500",     text: "text-sky-700",     bg: "hover:bg-sky-50" },
  { value: "CANCELLED",     label: "Đã hủy",          color: "bg-red-500",     text: "text-red-600",     bg: "hover:bg-red-50" },
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

const TicketItem = ({ ticket, onStatusChange, onDelete, onPrint, onPayOs, onConfirmPayment }) => {
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
    <div className="grid grid-cols-12 px-4 py-3.5 border-b border-slate-100 table-row-hover transition-all items-center text-sm">
      <div className="col-span-3 space-y-1 self-start">
        <div className="text-slate-700">
          Mã phiếu: <span className="font-bold">{ticket.order_code}</span>
        </div>
        {ticket.payment_status === "PAID" ? (
          <div className="flex items-center gap-1 text-xs text-emerald-600 font-medium">
            <CheckCircle className="w-3.5 h-3.5" />
            Khách đã thanh toán ({ticket.payment_method === "BANK" ? "Chuyển khoản" : "Tiền mặt"})
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

      <div className="col-span-3 flex flex-col items-end justify-center gap-2">
        <div className="flex items-center gap-2">
            {!ticket.payment_status || ticket.payment_status === "UNPAID" ? (
                <>
                <button
                    onClick={() => onConfirmPayment(ticket._id)}
                    className="flex items-center gap-1.5 text-[11px] font-bold text-emerald-600 bg-emerald-50 border border-emerald-200 hover:bg-emerald-100 hover:border-emerald-400 px-2.5 py-1.5 rounded-full transition-all"
                    title="Xác nhận đã thu tiền mặt"
                >
                    <CheckCircle className="w-3.5 h-3.5" />
                    Thu Tiền Mặt
                </button>
                <button
                    onClick={() => onPayOs(ticket)}
                    className="flex items-center gap-1.5 text-[11px] font-bold text-blue-600 bg-blue-50 border border-blue-200 hover:bg-blue-100 hover:border-blue-400 px-2.5 py-1.5 rounded-full transition-all"
                    title="Tạo mã thanh toán QR"
                >
                    <Clock className="w-3.5 h-3.5" />
                    Mã PayOS
                </button>
                </>
            ) : null}
        </div>
        <div className="flex items-center gap-2 mt-1">
            <button
            onClick={() => onPrint(ticket)}
            className="flex items-center gap-1.5 text-[11px] font-bold text-violet-600 bg-violet-50 border border-violet-200 hover:bg-violet-100 hover:border-violet-400 px-2.5 py-1.5 rounded-full transition-all"
            title="In hóa đơn chi tiết"
            >
            <Printer className="w-3.5 h-3.5" />
            In Phiếu
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

  // Print UI state
  const [printingTicket, setPrintingTicket] = useState(null);

  // PayOS modal state
  const [showPayOsModal, setShowPayOsModal] = useState(false);
  const [payOsTicket, setPayOsTicket] = useState(null);

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
      
      if (newStatus === "READY") {
        alert("Đã cập nhật trạng thái và hệ thống đang tự động gửi SMS thông báo cho khách hàng!");
      }

      loadOrders();
    } catch {
      alert("Không thể cập nhật trạng thái!");
    }
  };

  const handleConfirmPayment = async (id) => {
    if (!window.confirm("Xác nhận đã thu tiền mặt cho đơn hàng này?")) return;
    try {
      await axiosInstance.patch(`/orders/${id}/payment`, {
        payment_status: "PAID",
        payment_method: "CASH",
      });
      loadOrders();
    } catch {
      alert("Lỗi cập nhật thanh toán!");
    }
  };

  const handlePayOsClick = (ticket) => {
    setPayOsTicket(ticket);
    setShowPayOsModal(true);
  };

  const handlePayOsSuccess = async () => {
    if (!payOsTicket) return;
    try {
      await axiosInstance.patch(`/orders/${payOsTicket._id}/payment`, {
        payment_status: "PAID",
        payment_method: "BANK",
      });
      setShowPayOsModal(false);
      setPayOsTicket(null);
      loadOrders();
      alert("Xác nhận thanh toán PayOS thành công!");
    } catch {
      alert("Lỗi cập nhật thanh toán!");
    }
  };

  const handlePrintClick = async (ticket) => {
    try {
      const res = await axiosInstance.get(`/order-items?order_id=${ticket._id}`);
      setPrintingTicket({ ...ticket, items: res.data });
      setTimeout(() => {
        window.print();
      }, 300);
    } catch {
      alert("Không thể lấy thông tin chi tiết đơn hàng để in!");
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
    <>
    {/* ─── Printable Document ─── */}
    <div className="hidden print:block p-8 w-full bg-white text-black font-sans">
      {printingTicket && (
        <div className="max-w-2xl mx-auto">
          <div className="text-center mb-6 border-b-2 border-black pb-4">
            <h1 className="text-3xl font-black uppercase tracking-wider mb-2">HÓA ĐƠN DỊCH VỤ</h1>
            <p className="text-sm">Store Gặt Sấy | SĐT: 0123.456.789</p>
          </div>
          
          <div className="grid grid-cols-2 gap-4 mb-6">
            <div>
              <p className="mb-1"><span className="font-bold">Mã Hóa Đơn:</span> {printingTicket.order_code}</p>
              <p className="mb-1"><span className="font-bold">Ngày Nhận:</span> {new Date(printingTicket.created_at).toLocaleString('vi-VN')}</p>

              <p className="mb-1"><span className="font-bold">Nhân Viên:</span> {printingTicket.created_by?.full_name || "—"}</p>
            </div>
            <div>
              <p className="mb-1"><span className="font-bold">Khách Hàng:</span> {printingTicket.customer_id?.full_name}</p>
              <p className="mb-1"><span className="font-bold">SĐT:</span> {printingTicket.customer_id?.phone}</p>
              <p className="mb-1"><span className="font-bold">Địa Chỉ:</span> {printingTicket.customer_id?.address || "—"}</p>

            </div>
          </div>

          <div className="border border-black p-4 mb-6">
            <p className="text-lg font-bold mb-3 border-b border-black pb-2">CHI TIẾT DỊCH VỤ</p>
            
            <table className="w-full text-left mb-4">
              <thead>
                <tr className="border-b border-black text-sm">
                  <th className="py-2">DV</th>
                  <th className="py-2 text-center">SL</th>
                  <th className="py-2 text-right">Đơn giá</th>
                  <th className="py-2 text-right">T.Tiền</th>
                </tr>
              </thead>
              <tbody>
                {printingTicket.items?.length > 0 ? (
                  printingTicket.items.map((item, idx) => (
                    <tr key={idx} className="border-b border-dashed border-gray-300">
                      <td className="py-2">
                        {item.service_id?.name || "Dịch vụ"} 
                        {item.service_id?.unit_id?.name ? ` (${item.service_id.unit_id.name})` : ""}
                      </td>
                      <td className="py-2 text-center">{item.quantity}</td>
                      <td className="py-2 text-right">{formatCurrency(item.price)}</td>
                      <td className="py-2 text-right font-bold">{formatCurrency(item.subtotal)}</td>
                    </tr>
                  ))
                ) : (
                  <tr>
                    <td colSpan="4" className="py-2 text-center italic">Không có dịch vụ nào</td>
                  </tr>
                )}
              </tbody>
            </table>

            <div className="flex justify-between font-bold text-lg border-t-2 border-black pt-4 mt-2">
              <span>TỔNG CỘNG:</span>
              <span>{formatCurrency(printingTicket.total_amount)} đ</span>
            </div>
          </div>

          <div className="text-center text-sm italic mt-12">
            "Cảm ơn quý khách đã tin tưởng sử dụng dịch vụ!"
          </div>
        </div>
      )}
    </div>

    {/* ─── Main UI ─── */}
    <div className="h-screen flex flex-col overflow-hidden text-sm bg-main-bg font-sans print:hidden">
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

      <main className="flex-1 overflow-y-auto custom-scrollbar px-4 pt-3 pb-4 page-enter">
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
            <div className="p-12 flex flex-col items-center gap-3 text-slate-400">
              <div className="w-8 h-8 border-3 border-nav-bg border-t-transparent rounded-full animate-spin" style={{borderWidth:"3px"}} />
              <span className="text-sm italic">Đang tải dữ liệu...</span>
            </div>
          ) : filtered.length > 0 ? (
            filtered.map((ticket) => (
              <TicketItem
                key={ticket._id}
                ticket={ticket}
                onStatusChange={handleStatusChange}
                onDelete={handleDelete}
                onPrint={handlePrintClick}
                onPayOs={handlePayOsClick}
                onConfirmPayment={handleConfirmPayment}
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
        className="fixed bottom-6 right-6 w-14 h-14 bg-nav-bg text-white rounded-full shadow-lg hover:opacity-90 hover:scale-110 hover:shadow-2xl transition-all active:scale-95 flex items-center justify-center z-50 animate-glow-pulse"
        title="Nhận đồ mới"
      >
        <Plus className="w-8 h-8" />
      </button>

      {/* ─── PayOS Mock Modal ─── */}
      {showPayOsModal && payOsTicket && (
        <div className="fixed inset-0 z-[100] flex items-center justify-center bg-black/50 backdrop-blur-sm" onClick={() => setShowPayOsModal(false)}>
          <div className="bg-white rounded-2xl p-6 shadow-2xl flex flex-col items-center animate-scale-in max-w-sm w-full" onClick={(e) => e.stopPropagation()}>
            <h2 className="text-xl font-bold text-slate-800 mb-2">Thanh toán PayOS</h2>
            <p className="text-sm text-slate-500 mb-6">Mã đơn: <span className="font-bold">{payOsTicket.order_code}</span></p>

            <div className="p-4 bg-white border-2 border-slate-200 rounded-xl shadow-inner mb-6">
              {/* Dummy QR placeholder */}
              <div className="w-48 h-48 bg-slate-100 border border-slate-200 flex flex-col items-center justify-center text-slate-400">
                <span className="material-symbols-outlined text-5xl opacity-50 mb-2">qr_code_2</span>
                <span className="text-xs font-bold uppercase tracking-wider">QR DEMO PAYOS</span>
              </div>
            </div>

            <div className="text-3xl font-black text-blue-600 mb-6">
              {formatCurrency(payOsTicket.total_amount)} <span className="text-xl underline">đ</span>
            </div>

            <div className="flex gap-3 w-full">
              <button
                onClick={() => setShowPayOsModal(false)}
                className="flex-1 py-2.5 rounded-xl font-bold bg-slate-100 text-slate-600 hover:bg-slate-200 transition-colors"
              >
                Hủy
              </button>
              <button
                onClick={handlePayOsSuccess}
                className="flex-1 py-2.5 rounded-xl font-bold bg-blue-600 text-white hover:bg-blue-700 shadow-md transition-colors"
              >
                Đã Thanh Toán
              </button>
            </div>
          </div>
        </div>
      )}

    </div>
    </>
  );
}



