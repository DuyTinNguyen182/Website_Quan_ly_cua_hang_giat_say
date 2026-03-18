import { useNavigate } from "react-router-dom";
import { useEffect, useMemo, useState } from "react";
import { useAuth } from "../context/AuthContext";
import Header from "../components/Header";
import axiosInstance from "../api/axiosInstance";
import { QRCodeSVG } from "qrcode.react";
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
  Eye,
  Save,
  X,
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
  { value: "RECEIVED", label: "Đơn mới", color: "bg-orange-500" },
  { value: "READY", label: "Giặt xong", color: "bg-emerald-500" },
  { value: "COMPLETED", label: "Giao khách", color: "bg-sky-500" },
  { value: "CANCELLED", label: "Đã hủy", color: "bg-red-500" },
];

const formatCurrency = (amount) => new Intl.NumberFormat("vi-VN").format(amount || 0);

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

const StatusModal = ({ ticket, onStatusChange, onClose, updating }) => {
  if (!ticket) return null;

  return (
    <div
      className="fixed inset-0 z-[120] flex items-center justify-center bg-black/50 backdrop-blur-sm"
      onClick={onClose}
    >
      <div
        className="bg-white rounded-2xl shadow-2xl w-full max-w-sm mx-4 overflow-hidden"
        onClick={(e) => e.stopPropagation()}
      >
        <div className="px-5 py-4 border-b border-slate-200 flex items-center justify-between">
          <div>
            <div className="text-base font-extrabold text-slate-800">Đổi trạng thái</div>
            <div className="text-xs text-slate-500">Mã phiếu: {ticket.order_code}</div>
          </div>
          <button
            onClick={onClose}
            className="w-9 h-9 rounded-full bg-slate-100 hover:bg-slate-200 text-slate-500 flex items-center justify-center transition-colors cursor-pointer"
            title="Đóng"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        <div className="p-4 space-y-2">
          {ALL_STATUSES.map((status) => {
            const isCurrent = status.value === ticket.status;
            return (
              <button
                key={status.value}
                disabled={updating || isCurrent}
                onClick={() => onStatusChange(ticket._id, status.value)}
                className={`w-full h-11 rounded-xl text-sm font-bold transition-all cursor-pointer disabled:cursor-not-allowed disabled:opacity-60 ${
                  isCurrent
                    ? `${status.color} text-white`
                    : "bg-slate-100 text-slate-600 hover:bg-slate-200"
                }`}
              >
                {isCurrent ? `${status.label} (hiện tại)` : status.label}
              </button>
            );
          })}
        </div>
      </div>
    </div>
  );
};

const DetailModal = ({ ticket, items, loading, onClose }) => {
  if (!ticket) return null;

  const surcharge = Number(ticket.surcharge || 0);
  const discountType = ticket.discount_type === "FIXED" ? "FIXED" : "PERCENT";
  const discountValue = Number(ticket.discount_value || 0);
  const discountAmount = Number(ticket.discount_amount || 0);
  const subTotalBeforeAdjust = Math.max(Number(ticket.total_amount || 0) - surcharge + discountAmount, 0);

  return (
    <div
      className="fixed inset-0 z-[120] flex items-center justify-center bg-black/50 backdrop-blur-sm"
      onClick={onClose}
    >
      <div
        className="bg-white rounded-2xl shadow-2xl w-full max-w-3xl mx-4 max-h-[85vh] overflow-hidden"
        onClick={(e) => e.stopPropagation()}
      >
        <div className="px-5 py-4 border-b border-slate-200 flex items-center justify-between">
          <div>
            <div className="text-lg font-extrabold text-slate-800">Chi tiết đơn hàng</div>
            <div className="text-xs text-slate-500">
              Mã phiếu: <span className="font-bold">{ticket.order_code}</span>
            </div>
          </div>
          <button
            onClick={onClose}
            className="w-9 h-9 rounded-full bg-slate-100 hover:bg-slate-200 text-slate-500 flex items-center justify-center transition-colors cursor-pointer"
            title="Đóng"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        <div className="p-5 overflow-y-auto max-h-[calc(85vh-72px)] space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-3 text-sm">
            <div className="bg-slate-50 rounded-xl p-3 border border-slate-200">
              <div className="font-bold text-slate-700 mb-1">Khách hàng</div>
              <div>Tên: <span className="font-semibold">{ticket.customer_id?.full_name || "—"}</span></div>
              <div>SĐT: <span className="font-semibold">{ticket.customer_id?.phone || "—"}</span></div>
              <div>Địa chỉ: <span className="font-semibold">{ticket.customer_id?.address || "—"}</span></div>
            </div>

            <div className="bg-slate-50 rounded-xl p-3 border border-slate-200">
              <div className="font-bold text-slate-700 mb-1">Thông tin phiếu</div>
              <div>Trạng thái: <span className="font-semibold">{STATUS_LABEL[ticket.status] || ticket.status}</span></div>
              <div>Thanh toán: <span className="font-semibold">{ticket.payment_status === "PAID" ? "Đã thanh toán" : "Chưa thanh toán"}</span></div>
              <div>Kệ: <span className="font-semibold">{ticket.shelf_id?.name || "—"}</span></div>
              <div>Nhân viên: <span className="font-semibold">{ticket.created_by?.full_name || "—"}</span></div>
              <div>Thời gian: <span className="font-semibold">{formatDate(ticket.created_at)}</span></div>
              <div>Ghi chú: <span className="font-semibold">{ticket.note || "—"}</span></div>
            </div>
          </div>

          <div className="border border-slate-200 rounded-xl overflow-hidden">
            <div className="px-3 py-2 bg-slate-50 text-xs font-bold text-slate-600 uppercase tracking-wide">
              Dịch vụ trong đơn
            </div>
            {loading ? (
              <div className="p-6 text-center text-slate-400 italic">Đang tải chi tiết...</div>
            ) : items.length > 0 ? (
              <div>
                <div className="grid grid-cols-12 px-3 py-2 text-[11px] font-bold text-slate-500 uppercase border-b border-slate-200">
                  <div className="col-span-5">Dịch vụ</div>
                  <div className="col-span-2 text-center">SL</div>
                  <div className="col-span-2 text-right">Đơn giá</div>
                  <div className="col-span-3 text-right">Thành tiền</div>
                </div>
                {items.map((item) => (
                  <div key={item._id || `${item.service_id?._id}-${item.quantity}`} className="grid grid-cols-12 px-3 py-2 text-sm border-b border-slate-100 last:border-b-0">
                    <div className="col-span-5 text-slate-700">
                      {item.service_id?.name || "Dịch vụ"}
                      {item.service_id?.unit_id?.name ? ` (${item.service_id.unit_id.name})` : ""}
                    </div>
                    <div className="col-span-2 text-center text-slate-600">{item.quantity || 0}</div>
                    <div className="col-span-2 text-right text-slate-600">{formatCurrency(item.price)}</div>
                    <div className="col-span-3 text-right font-bold text-slate-700">{formatCurrency(item.subtotal)}</div>
                  </div>
                ))}
              </div>
            ) : (
              <div className="p-6 text-center text-slate-400 italic">Không có chi tiết dịch vụ</div>
            )}
          </div>

          <div className="ml-auto w-full max-w-md border border-slate-200 rounded-xl p-3 bg-slate-50 text-sm space-y-1.5">
            <div className="flex items-center justify-between text-slate-600">
              <span>Tạm tính</span>
              <span className="font-semibold">{formatCurrency(subTotalBeforeAdjust)} đ</span>
            </div>
            <div className="flex items-center justify-between text-slate-600">
              <span>Phụ thu</span>
              <span className="font-semibold">+ {formatCurrency(surcharge)} đ</span>
            </div>
            <div className="flex items-center justify-between text-slate-600">
              <span>
                Chiết khấu
                <span className="ml-1 text-xs text-slate-500">
                  ({discountType === "PERCENT" ? `${discountValue}%` : `${formatCurrency(discountValue)} đ`})
                </span>
              </span>
              <span className="font-semibold">- {formatCurrency(discountAmount)} đ</span>
            </div>
            <div className="border-t border-slate-200 pt-2 flex items-center justify-between text-base font-extrabold text-nav-bg">
              <span>Tổng tiền</span>
              <span>{formatCurrency(ticket.total_amount)} đ</span>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

const EditOrderModal = ({ ticket, shelves, onSave, onClose, saving }) => {
  const [note, setNote] = useState(ticket?.note || "");
  const [shelfId, setShelfId] = useState(ticket?.shelf_id?._id || "");

  if (!ticket) return null;

  return (
    <div
      className="fixed inset-0 z-[120] flex items-center justify-center bg-black/50 backdrop-blur-sm"
      onClick={onClose}
    >
      <div
        className="bg-white rounded-2xl shadow-2xl w-full max-w-lg mx-4"
        onClick={(e) => e.stopPropagation()}
      >
        <div className="px-5 py-4 border-b border-slate-200 flex items-center justify-between">
          <div>
            <div className="text-lg font-extrabold text-slate-800">Sửa phiếu</div>
            <div className="text-xs text-slate-500">{ticket.order_code}</div>
          </div>
          <button
            onClick={onClose}
            className="w-9 h-9 rounded-full bg-slate-100 hover:bg-slate-200 text-slate-500 flex items-center justify-center transition-colors cursor-pointer"
            title="Đóng"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        <div className="p-5 space-y-4">
          <div>
            <label className="block text-xs font-bold text-slate-600 uppercase mb-1">Kệ lưu đồ</label>
            <select
              value={shelfId}
              onChange={(e) => setShelfId(e.target.value)}
              className="w-full h-10 px-3 rounded-xl border border-slate-300 focus:ring-2 focus:ring-nav-bg/20 outline-none text-sm"
            >
              <option value="">Không chọn kệ</option>
              {shelves.map((shelf) => (
                <option key={shelf._id} value={shelf._id}>{shelf.name}</option>
              ))}
            </select>
          </div>

          <div>
            <label className="block text-xs font-bold text-slate-600 uppercase mb-1">Ghi chú</label>
            <textarea
              value={note}
              onChange={(e) => setNote(e.target.value)}
              rows={4}
              className="w-full px-3 py-2 rounded-xl border border-slate-300 focus:ring-2 focus:ring-nav-bg/20 outline-none text-sm resize-none"
              placeholder="Nhập ghi chú cho đơn hàng..."
            />
          </div>

          <div className="flex justify-end gap-2">
            <button
              onClick={onClose}
              className="px-4 h-10 rounded-xl border border-slate-300 text-slate-600 hover:bg-slate-100 transition-colors text-sm font-bold cursor-pointer"
            >
              Hủy
            </button>
            <button
              onClick={() => onSave({ note, shelf_id: shelfId || null })}
              disabled={saving}
              className="px-4 h-10 rounded-xl bg-nav-bg text-white hover:opacity-90 transition-all text-sm font-bold disabled:opacity-50 flex items-center gap-1.5 cursor-pointer"
            >
              <Save className="w-4 h-4" />
              {saving ? "Đang lưu..." : "Lưu thay đổi"}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

const TicketItem = ({
  ticket,
  userRole,
  onDelete,
  onPrint,
  onPayOs,
  onConfirmPayment,
  onView,
  onEdit,
  onOpenStatus,
}) => {
  const isReceived = ticket.status === "RECEIVED";
  const isReady = ticket.status === "READY";
  const isCompleted = ticket.status === "COMPLETED";
  const isAdmin = userRole === "ADMIN";
  const isUnpaid = !ticket.payment_status || ticket.payment_status === "UNPAID";

  return (
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
          <button
            onClick={() => onOpenStatus(ticket)}
            className={`text-white text-[10px] px-2.5 py-0.5 rounded-full font-bold hover:opacity-90 transition-opacity cursor-pointer ${statusColors[ticket.status] || "bg-slate-500"}`}
            title="Đổi trạng thái đơn"
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

      <div className="col-span-3 flex items-center justify-end">
        <div className="flex flex-wrap justify-end gap-2 max-w-[360px]">
          {isReceived && (
            <>
              <button
                onClick={() => onView(ticket)}
                className="flex items-center gap-1.5 text-[11px] font-bold text-sky-700 bg-sky-50 border border-sky-200 hover:bg-sky-100 hover:border-sky-400 px-2.5 py-1.5 rounded-full transition-all cursor-pointer"
                title="Xem chi tiết"
              >
                <Eye className="w-3.5 h-3.5" />
                Chi tiết
              </button>
              <button
                onClick={() => onEdit(ticket)}
                className="flex items-center gap-1.5 text-[11px] font-bold text-amber-700 bg-amber-50 border border-amber-200 hover:bg-amber-100 hover:border-amber-400 px-2.5 py-1.5 rounded-full transition-all cursor-pointer"
                title="Sửa phiếu"
              >
                <Pencil className="w-3.5 h-3.5" />
                Sửa
              </button>
              <button
                onClick={() => onDelete(ticket._id)}
                className="flex items-center gap-1.5 text-[11px] font-bold text-red-500 bg-red-50 border border-red-200 hover:bg-red-100 hover:border-red-400 px-2.5 py-1.5 rounded-full transition-all cursor-pointer"
                title="Xóa"
              >
                <Trash2 className="w-3.5 h-3.5" />
                Xóa
              </button>
            </>
          )}

          {isReady && (
            <button
              onClick={() => onView(ticket)}
              className="flex items-center gap-1.5 text-[11px] font-bold text-sky-700 bg-sky-50 border border-sky-200 hover:bg-sky-100 hover:border-sky-400 px-2.5 py-1.5 rounded-full transition-all cursor-pointer"
              title="Xem chi tiết"
            >
              <Eye className="w-3.5 h-3.5" />
              Chi tiết
            </button>
          )}

          {isCompleted && (
            <>
              {isUnpaid && (
                <button
                  onClick={() => onConfirmPayment(ticket._id)}
                  className="flex items-center gap-1.5 text-[11px] font-bold text-emerald-600 bg-emerald-50 border border-emerald-200 hover:bg-emerald-100 hover:border-emerald-400 px-2.5 py-1.5 rounded-full transition-all cursor-pointer"
                  title="Xác nhận đã thu tiền mặt"
                >
                  <CheckCircle className="w-3.5 h-3.5" />
                  Tiền mặt
                </button>
              )}

              {isUnpaid && (
                <button
                  onClick={() => onPayOs(ticket)}
                  className="flex items-center gap-1.5 text-[11px] font-bold text-blue-600 bg-blue-50 border border-blue-200 hover:bg-blue-100 hover:border-blue-400 px-2.5 py-1.5 rounded-full transition-all cursor-pointer"
                  title="Tạo mã thanh toán QR"
                >
                  <Clock className="w-3.5 h-3.5" />
                  Mã QR
                </button>
              )}

              <button
                onClick={() => onView(ticket)}
                className="flex items-center gap-1.5 text-[11px] font-bold text-sky-700 bg-sky-50 border border-sky-200 hover:bg-sky-100 hover:border-sky-400 px-2.5 py-1.5 rounded-full transition-all cursor-pointer"
                title="Xem chi tiết"
              >
                <Eye className="w-3.5 h-3.5" />
                Chi tiết
              </button>

              <button
                onClick={() => onPrint(ticket)}
                className="flex items-center gap-1.5 text-[11px] font-bold text-violet-600 bg-violet-50 border border-violet-200 hover:bg-violet-100 hover:border-violet-400 px-2.5 py-1.5 rounded-full transition-all cursor-pointer"
                title="In hóa đơn chi tiết"
              >
                <Printer className="w-3.5 h-3.5" />
                In phiếu
              </button>

              {isAdmin && (
                <button
                  onClick={() => onDelete(ticket._id)}
                  className="flex items-center gap-1.5 text-[11px] font-bold text-red-500 bg-red-50 border border-red-200 hover:bg-red-100 hover:border-red-400 px-2.5 py-1.5 rounded-full transition-all cursor-pointer"
                  title="Xóa"
                >
                  <Trash2 className="w-3.5 h-3.5" />
                  Xóa
                </button>
              )}
            </>
          )}

          {!isReceived && !isReady && !isCompleted && (
            <button
              onClick={() => onView(ticket)}
              className="flex items-center gap-1.5 text-[11px] font-bold text-sky-700 bg-sky-50 border border-sky-200 hover:bg-sky-100 hover:border-sky-400 px-2.5 py-1.5 rounded-full transition-all cursor-pointer"
              title="Xem chi tiết"
            >
              <Eye className="w-3.5 h-3.5" />
              Chi tiết
            </button>
          )}
        </div>
      </div>
    </div>
  );
};

export default function DanhSachDoPage() {
  const navigate = useNavigate();
  const { user } = useAuth();

  useEffect(() => {
    if (!user) navigate("/login");
  }, [user, navigate]);

  const [orders, setOrders] = useState([]);
  const [shelves, setShelves] = useState([]);
  const [activeTab, setActiveTab] = useState("RECEIVED");
  const [searchTerm, setSearchTerm] = useState("");
  const [loading, setLoading] = useState(true);

  // Print UI state
  const [printingTicket, setPrintingTicket] = useState(null);

  // Detail modal state
  const [detailTicket, setDetailTicket] = useState(null);
  const [detailItems, setDetailItems] = useState([]);
  const [detailLoading, setDetailLoading] = useState(false);

  // Edit modal state
  const [editingTicket, setEditingTicket] = useState(null);
  const [isSavingEdit, setIsSavingEdit] = useState(false);

  // Status modal state
  const [statusTicket, setStatusTicket] = useState(null);
  const [isUpdatingStatus, setIsUpdatingStatus] = useState(false);

  // PayOS modal state
  const [showPayOsModal, setShowPayOsModal] = useState(false);
  const [payOsTicket, setPayOsTicket] = useState(null);
  const [qrCodeDataList, setQrCodeDataList] = useState(null);
  const [isGeneratingQRList, setIsGeneratingQRList] = useState(false);

  const loadOrders = () => {
    setLoading(true);
    const params = activeTab ? `?status=${activeTab}` : "";
    axiosInstance
      .get(`/orders${params}`)
      .then((res) => setOrders(res.data))
      .catch(() => {})
      .finally(() => setLoading(false));
  };

  useEffect(() => {
    if (user) {
      loadOrders();
    }
  }, [activeTab, user]);

  useEffect(() => {
    if (!user) return;
    axiosInstance
      .get("/shelves")
      .then((res) => setShelves((res.data || []).filter((s) => s.is_active)))
      .catch(() => setShelves([]));
  }, [user]);

  const handleConfirmPayment = async (id) => {
    if (!window.confirm("Xác nhận đã thu tiền mặt cho đơn hàng này?")) return;
    try {
      await axiosInstance.patch(`/orders/${id}/payment`, {
        payment_status: "PAID",
        payment_method: "CASH",
      });
      loadOrders();
      if (detailTicket?._id === id) {
        setDetailTicket((prev) => (prev ? { ...prev, payment_status: "PAID", payment_method: "CASH" } : prev));
      }
    } catch {
      alert("Lỗi cập nhật thanh toán!");
    }
  };

  const handleStatusChange = async (id, newStatus) => {
    setIsUpdatingStatus(true);
    try {
      await axiosInstance.patch(`/orders/${id}/status`, { status: newStatus });
      if (newStatus === "READY") {
        alert("Đã cập nhật trạng thái và hệ thống đang tự động gửi SMS thông báo cho khách hàng!");
      }
      if (detailTicket?._id === id) {
        setDetailTicket((prev) => (prev ? { ...prev, status: newStatus } : prev));
      }
      setStatusTicket(null);
      loadOrders();
    } catch {
      alert("Không thể cập nhật trạng thái!");
    } finally {
      setIsUpdatingStatus(false);
    }
  };

  const handlePayOsClick = async (ticket) => {
    setPayOsTicket(ticket);
    setQrCodeDataList(null);
    setShowPayOsModal(true);
    setIsGeneratingQRList(true);

    try {
      const response = await axiosInstance.post("/payments/create-payment-link", {
        orderCode: Number(ticket.order_code),
        amount: ticket.total_amount,
        description: "Thanh toan don hang",
        returnUrl: window.location.href,
        cancelUrl: window.location.href,
      });

      if (response.data.success) {
        setQrCodeDataList(response.data.qrCode);
      }
    } catch {
      alert("Không thể tạo mã QR. Vui lòng thử lại!");
      setShowPayOsModal(false);
    } finally {
      setIsGeneratingQRList(false);
    }
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
      if (detailTicket?._id === payOsTicket._id) {
        setDetailTicket((prev) => (prev ? { ...prev, payment_status: "PAID", payment_method: "BANK" } : prev));
      }
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
      if (detailTicket?._id === id) {
        setDetailTicket(null);
      }
      loadOrders();
    } catch {
      alert("Không thể xóa phiếu!");
    }
  };

  const openDetailModal = async (ticket) => {
    setDetailTicket(ticket);
    setDetailItems([]);
    setDetailLoading(true);
    try {
      const res = await axiosInstance.get(`/order-items?order_id=${ticket._id}`);
      setDetailItems(res.data || []);
    } catch {
      setDetailItems([]);
      alert("Không thể tải chi tiết đơn hàng!");
    } finally {
      setDetailLoading(false);
    }
  };

  const handleSaveEditOrder = async (payload) => {
    if (!editingTicket) return;
    setIsSavingEdit(true);
    try {
      await axiosInstance.put(`/orders/${editingTicket._id}`, payload);
      setEditingTicket(null);
      loadOrders();
      if (detailTicket?._id === editingTicket._id) {
        setDetailTicket((prev) => (prev ? { ...prev, ...payload } : prev));
      }
      alert("Cập nhật phiếu thành công!");
    } catch {
      alert("Không thể cập nhật phiếu!");
    } finally {
      setIsSavingEdit(false);
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
                <p className="mb-1"><span className="font-bold">Ngày Nhận:</span> {new Date(printingTicket.created_at).toLocaleString("vi-VN")}</p>
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
              className="flex items-center text-nav-bg font-bold text-sm hover:opacity-80 transition-opacity whitespace-nowrap cursor-pointer"
            >
              <ChevronLeft className="w-5 h-5 mr-0.5" />
              HOME
            </button>

            <div className="flex items-center gap-1 overflow-x-auto">
              {statusTabs.map((tab) => (
                <button
                  key={tab.label}
                  onClick={() => setActiveTab(tab.value)}
                  className={`px-3.5 py-1 rounded-full text-xs font-bold whitespace-nowrap transition-all cursor-pointer ${
                    activeTab === tab.value ? tab.active : tab.inactive
                  }`}
                >
                  {tab.label}
                </button>
              ))}
            </div>
          </div>

          <button className="flex items-center gap-1.5 text-slate-600 hover:text-slate-800 border border-slate-300 rounded-full px-3 py-1 transition-colors cursor-pointer">
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
                <div className="w-8 h-8 border-3 border-nav-bg border-t-transparent rounded-full animate-spin" style={{ borderWidth: "3px" }} />
                <span className="text-sm italic">Đang tải dữ liệu...</span>
              </div>
            ) : filtered.length > 0 ? (
              filtered.map((ticket) => (
                <TicketItem
                  key={ticket._id}
                  ticket={ticket}
                  userRole={user?.role}
                  onDelete={handleDelete}
                  onPrint={handlePrintClick}
                  onPayOs={handlePayOsClick}
                  onConfirmPayment={handleConfirmPayment}
                  onView={openDetailModal}
                  onEdit={setEditingTicket}
                  onOpenStatus={setStatusTicket}
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
          className="fixed bottom-6 right-6 w-14 h-14 bg-nav-bg text-white rounded-full shadow-lg hover:opacity-90 hover:scale-110 hover:shadow-2xl transition-all active:scale-95 flex items-center justify-center z-50 animate-glow-pulse cursor-pointer"
          title="Nhận đồ mới"
        >
          <Plus className="w-8 h-8" />
        </button>

        {/* ─── PayOS Modal ─── */}
        {showPayOsModal && payOsTicket && (
          <div className="fixed inset-0 z-[100] flex items-center justify-center bg-black/50 backdrop-blur-sm" onClick={() => setShowPayOsModal(false)}>
            <div className="bg-white rounded-2xl p-6 shadow-2xl flex flex-col items-center animate-scale-in max-w-sm w-full" onClick={(e) => e.stopPropagation()}>
              <h2 className="text-xl font-bold text-slate-800 mb-2">Thanh toán PayOS</h2>
              <p className="text-sm text-slate-500 mb-6">Mã đơn: <span className="font-bold">{payOsTicket.order_code}</span></p>

              <div className="p-4 bg-white border-2 border-slate-200 rounded-xl shadow-inner mb-6">
                {isGeneratingQRList ? (
                  <div className="w-48 h-48 bg-slate-100 border border-slate-200 flex flex-col items-center justify-center text-slate-400">
                    <span className="text-xs font-bold uppercase tracking-wider animate-pulse">Đang tạo mã QR...</span>
                  </div>
                ) : qrCodeDataList ? (
                  <div className="flex items-center justify-center">
                    <QRCodeSVG value={qrCodeDataList} size={200} level="H" includeMargin={false} />
                  </div>
                ) : (
                  <div className="w-48 h-48 bg-slate-100 border border-slate-200 flex flex-col items-center justify-center text-slate-400">
                    <span className="text-xs font-bold uppercase tracking-wider text-red-400">Lỗi không tải được</span>
                  </div>
                )}
              </div>

              <div className="text-3xl font-black text-blue-600 mb-6">
                {formatCurrency(payOsTicket.total_amount)} <span className="text-xl underline">đ</span>
              </div>

              <div className="flex gap-3 w-full">
                <button
                  onClick={() => setShowPayOsModal(false)}
                  className="flex-1 py-2.5 rounded-xl font-bold bg-slate-100 text-slate-600 hover:bg-slate-200 transition-colors cursor-pointer"
                >
                  Hủy
                </button>
                <button
                  onClick={handlePayOsSuccess}
                  className="flex-1 py-2.5 rounded-xl font-bold bg-blue-600 text-white hover:bg-blue-700 shadow-md transition-colors cursor-pointer"
                >
                  Đã Thanh Toán
                </button>
              </div>
            </div>
          </div>
        )}

        {detailTicket && (
          <DetailModal
            ticket={detailTicket}
            items={detailItems}
            loading={detailLoading}
            onClose={() => setDetailTicket(null)}
          />
        )}

        {editingTicket && (
          <EditOrderModal
            ticket={editingTicket}
            shelves={shelves}
            onSave={handleSaveEditOrder}
            onClose={() => setEditingTicket(null)}
            saving={isSavingEdit}
          />
        )}

        {statusTicket && (
          <StatusModal
            ticket={statusTicket}
            onStatusChange={handleStatusChange}
            onClose={() => setStatusTicket(null)}
            updating={isUpdatingStatus}
          />
        )}
      </div>
    </>
  );
}
