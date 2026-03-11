import { useNavigate } from "react-router-dom";
import { useEffect, useCallback, useState } from "react";
import { useAuth } from "../context/AuthContext";
import Header from "../components/Header";
import axiosInstance from "../api/axiosInstance";
import {
  PlusCircle,
  ChevronDown,
  Calendar,
  Clock,
  UserPlus,
  MessageSquare,
  Printer,
  Save,
  Check,
  Trash2,
  Minus,
  Plus,
  Search,
  X,
} from "lucide-react";

const formatMoney = (n) =>
  n.toLocaleString("vi-VN");

const today = () => {
  const d = new Date();
  const pad = (v) => String(v).padStart(2, "0");
  return {
    date: `${pad(d.getDate())}/${pad(d.getMonth() + 1)}/${String(d.getFullYear()).slice(2)}`,
    time: `${pad(d.getHours())}:${pad(d.getMinutes())}`,
  };
};

export default function NhanDoPage() {
  const navigate = useNavigate();
  const { user, logout } = useAuth();

  /* --- auth --- */
  useEffect(() => {
    if (!user) navigate("/login");
  }, [user, navigate]);

  /* --- state --- */
  const [shelves, setShelves] = useState([]);
  const [services, setServices] = useState([]);
  const [selectedItems, setSelectedItems] = useState([]);
  const [searchTerm, setSearchTerm] = useState("");
  const [surcharge, setSurcharge] = useState(0);
  const [discount, setDiscount] = useState(0);
  const [isDiscountPercent, setIsDiscountPercent] = useState(true);
  const [isPrepaid, setIsPrepaid] = useState(false);
  const [note, setNote] = useState("");
  const [appointmentDate] = useState(today().date);
  const [appointmentTime] = useState(today().time);
  const [selectedShelf, setSelectedShelf] = useState(null);
  const [shelfModalOpen, setShelfModalOpen] = useState(false);
  const [shelfSearch, setShelfSearch] = useState("");
  const [submitting, setSubmitting] = useState(false);
  // customer search
  const [customerSearch, setCustomerSearch] = useState("");
  const [customers, setCustomers] = useState([]);
  const [selectedCustomer, setSelectedCustomer] = useState(null);
  const [showCustomerDropdown, setShowCustomerDropdown] = useState(false);

  /* --- load shelves & services on mount --- */
  useEffect(() => {
    axiosInstance.get("/shelves").then((res) => {
      setShelves(res.data.filter((s) => s.is_active).map((s) => ({ _id: s._id, name: s.name })));
    }).catch(() => {});
    axiosInstance.get("/services").then((res) => {
      setServices(res.data.filter((s) => s.is_active).map((s) => ({
        id: s._id,
        name: s.name,
        price: s.price,
        unit: s.unit_id?.name ?? "",
      })));
    }).catch(() => {});
  }, []);

  /* --- customer search debounce --- */
  useEffect(() => {
    if (!customerSearch.trim()) { setCustomers([]); return; }
    const timer = setTimeout(() => {
      axiosInstance.get(`/customers?search=${encodeURIComponent(customerSearch)}`)
        .then((res) => setCustomers(res.data))
        .catch(() => setCustomers([]));
    }, 300);
    return () => clearTimeout(timer);
  }, [customerSearch]);

  /* --- derived --- */
  const subtotal = selectedItems.reduce((s, i) => s + i.price * i.qty, 0);
  const discountAmount = isDiscountPercent
    ? Math.round((subtotal * discount) / 100)
    : discount;
  const total = Math.max(subtotal + surcharge - discountAmount, 0);

  /* --- handlers --- */
  const addService = useCallback(
    (svc) => {
      setSelectedItems((prev) => {
        const idx = prev.findIndex((i) => i.id === svc.id);
        if (idx >= 0) {
          const next = [...prev];
          next[idx] = { ...next[idx], qty: next[idx].qty + 1 };
          return next;
        }
        return [...prev, { ...svc, qty: 1 }];
      });
    },
    [],
  );

  const updateQty = (id, delta) => {
    setSelectedItems((prev) =>
      prev
        .map((i) => (i.id === id ? { ...i, qty: i.qty + delta } : i))
        .filter((i) => i.qty > 0),
    );
  };

  const removeItem = (id) =>
    setSelectedItems((prev) => prev.filter((i) => i.id !== id));

  const filteredServices = services.filter((s) =>
    s.name.toLowerCase().includes(searchTerm.toLowerCase()),
  );

  const handleLogout = () => {
    logout();
    navigate("/login");
  };

  /* --- build expected_return_date from appointmentDate/Time state --- */
  const buildReturnDate = () => {
    const [dd, mm, yy] = appointmentDate.split("/");
    return new Date(`20${yy}-${mm}-${dd}T${appointmentTime}:00`).toISOString();
  };

  /* --- reset form --- */
  const resetForm = () => {
    setSelectedItems([]);
    setSurcharge(0);
    setDiscount(0);
    setIsDiscountPercent(true);
    setIsPrepaid(false);
    setNote("");
    setSelectedShelf(null);
    setSelectedCustomer(null);
    setCustomerSearch("");
  };

  /* --- save order --- */
  const handleSave = async (print = false) => {
    if (selectedItems.length === 0) return;
    if (!selectedCustomer) { alert("Vui lòng chọn khách hàng!"); return; }
    setSubmitting(true);
    try {
      const shelfObj = shelves.find((s) => s.name === selectedShelf);
      const orderPayload = {
        customer_id: selectedCustomer._id,
        payment_method: "CASH",
        payment_status: isPrepaid ? "PAID" : "UNPAID",
        expected_return_date: buildReturnDate(),
        note,
        shelf_id: shelfObj?._id ?? undefined,
        created_by: user.id,
      };
      const orderRes = await axiosInstance.post("/orders", orderPayload);
      const orderId = orderRes.data._id;

      await Promise.all(
        selectedItems.map((item) =>
          axiosInstance.post("/order-items", {
            order_id: orderId,
            service_id: item.id,
            quantity: item.qty,
            price: item.price,
          })
        )
      );

      resetForm();
      if (print) navigate("/danh-sach-do");
      else alert("Lưu phiếu thành công!");
    } catch (err) {
      alert(err.response?.data?.message || "Lỗi khi tạo phiếu!");
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className="h-screen flex flex-col overflow-hidden text-sm bg-main-bg font-sans">
      <Header activePage="nhan-do" />

      {/* ─── Tab bar ─── */}
      <div className="bg-white border-b border-gray-200 h-10 flex items-center px-4 shrink-0 justify-between">
        <div className="flex items-center h-full">
          <div className="border-b-2 border-nav-bg h-full flex items-center px-6 gap-2 text-nav-bg font-bold text-xs">
            <span className="material-symbols-outlined text-[16px]">description</span>
            CỬA SỔ 1
          </div>
        </div>
        <button className="p-1 text-gray-500 hover:text-gray-700">
          <PlusCircle size={20} />
        </button>
      </div>

      {/* ─── Main Content ─── */}
      <main className="flex-1 flex overflow-hidden p-3 gap-3">
        {/* === Left Panel === */}
        <div className="flex-[7] flex flex-col gap-3 overflow-hidden">
          {/* Search */}
          <div className="relative bg-white border border-gray-200 rounded-md shadow-sm p-1">
            <div className="flex items-center">
              <input
                type="text"
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="w-full px-3 py-1.5 border-none focus:ring-0 focus:outline-none text-sm italic placeholder:text-gray-400"
                placeholder="Tìm & thêm dịch vụ..."
              />
              <ChevronDown size={20} className="text-gray-400 px-3 cursor-pointer" />
            </div>
          </div>

          {/* Selected Services Table */}
          <div className="flex-1 bg-white border border-gray-200 rounded-md shadow-sm overflow-hidden flex flex-col">
            {/* Header */}
            <div className="grid grid-cols-12 bg-gray-100 border-b border-gray-200 text-[11px] font-bold text-gray-600 uppercase py-2 px-3">
              <div className="col-span-1 text-center">STT</div>
              <div className="col-span-4">TÊN DỊCH VỤ</div>
              <div className="col-span-2 text-center">SỐ LƯỢNG</div>
              <div className="col-span-2 text-right">ĐƠN GIÁ</div>
              <div className="col-span-2 text-right">THÀNH TIỀN</div>
              <div className="col-span-1 text-center">XÓA</div>
            </div>

            {/* Body */}
            <div className="flex-1 overflow-y-auto custom-scrollbar">
              {selectedItems.length === 0 ? (
                <div className="flex items-center justify-center h-full italic text-gray-400 text-sm">
                  (Chưa có dịch vụ nào được chọn)
                </div>
              ) : (
                selectedItems.map((item, idx) => (
                  <div
                    key={item.id}
                    className="grid grid-cols-12 items-center px-3 py-2 border-b border-gray-100 text-sm hover:bg-gray-50"
                  >
                    <div className="col-span-1 text-center text-gray-500">
                      {idx + 1}
                    </div>
                    <div className="col-span-4 font-medium text-gray-800">
                      {item.name}
                      <span className="ml-1 text-[10px] text-gray-400">({item.unit})</span>
                    </div>
                    <div className="col-span-2 flex items-center justify-center gap-1">
                      <button
                        onClick={() => updateQty(item.id, -1)}
                        className="w-6 h-6 rounded bg-gray-200 hover:bg-gray-300 flex items-center justify-center"
                      >
                        <Minus size={12} />
                      </button>
                      <span className="w-8 text-center font-bold">{item.qty}</span>
                      <button
                        onClick={() => updateQty(item.id, 1)}
                        className="w-6 h-6 rounded bg-gray-200 hover:bg-gray-300 flex items-center justify-center"
                      >
                        <Plus size={12} />
                      </button>
                    </div>
                    <div className="col-span-2 text-right text-gray-600">
                      {formatMoney(item.price)}
                    </div>
                    <div className="col-span-2 text-right font-bold text-accent-blue">
                      {formatMoney(item.price * item.qty)}
                    </div>
                    <div className="col-span-1 flex justify-center">
                      <button
                        onClick={() => removeItem(item.id)}
                        className="text-red-400 hover:text-red-600"
                      >
                        <Trash2 size={16} />
                      </button>
                    </div>
                  </div>
                ))
              )}
            </div>
          </div>

          {/* Service Grid */}
          <div className="h-[35%] overflow-y-auto custom-scrollbar pr-1">
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-2.5">
              {filteredServices.map((svc) => (
                <div
                  key={svc.id}
                  onClick={() => addService(svc)}
                  className="bg-white border border-blue-300 rounded-lg p-3 flex items-center gap-3 relative hover:shadow-md cursor-pointer group transition-shadow"
                >
                  <span className="absolute top-0 right-0 bg-blue-50 text-blue-500 text-[10px] font-bold px-1.5 py-0.5 rounded-bl-md border-l border-b border-blue-300">
                    {svc.unit}
                  </span>
                  <div className="text-accent-green shrink-0">
                    <PlusCircle
                      size={36}
                      strokeWidth={1.5}
                      className="fill-accent-green/10"
                    />
                  </div>
                  <div className="flex-1 min-w-0">
                    <h3 className="text-accent-blue font-bold text-[13px] truncate">
                      {svc.name}
                    </h3>
                    <div className="mt-0.5 flex items-center gap-1">
                      <span className="text-[11px] text-gray-500">Đơn giá:</span>
                      <span className="text-[11px] text-orange-600 font-bold">
                        {formatMoney(svc.price)}
                      </span>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* === Right Panel === */}
        <div className="flex-[3] bg-white rounded-lg shadow-sm border border-gray-200 flex flex-col overflow-hidden">
          <div className="flex-1 p-4 overflow-y-auto custom-scrollbar flex flex-col gap-5">
            {/* Customer search */}
            <div className="relative flex items-center border-b border-gray-200 pb-2">
              <input
                type="text"
                value={selectedCustomer ? selectedCustomer.full_name : customerSearch}
                onChange={(e) => {
                  setCustomerSearch(e.target.value);
                  setSelectedCustomer(null);
                  setShowCustomerDropdown(true);
                }}
                onFocus={() => setShowCustomerDropdown(true)}
                className="flex-1 border-none focus:ring-0 focus:outline-none text-sm italic p-0 placeholder:text-gray-400"
                placeholder="Tìm kiếm tên, điện thoại khách..."
              />
              {selectedCustomer ? (
                <button onClick={() => { setSelectedCustomer(null); setCustomerSearch(""); }} className="text-gray-400 hover:text-gray-600">
                  <X size={16} />
                </button>
              ) : (
                <UserPlus size={20} className="text-gray-400 cursor-pointer hover:text-gray-600" />
              )}
              {showCustomerDropdown && customers.length > 0 && (
                <div className="absolute top-full left-0 right-0 z-50 bg-white border border-gray-200 rounded-md shadow-lg max-h-40 overflow-y-auto">
                  {customers.map((c) => (
                    <div
                      key={c._id}
                      className="px-3 py-2 text-sm hover:bg-blue-50 cursor-pointer"
                      onMouseDown={() => { setSelectedCustomer(c); setCustomerSearch(""); setShowCustomerDropdown(false); setCustomers([]); }}
                    >
                      <span className="font-bold">{c.full_name}</span>
                      <span className="text-gray-500 ml-2">{c.phone}</span>
                    </div>
                  ))}
                </div>
              )}
            </div>

            {/* Order info */}
            <div className="space-y-4">
              <div className="flex items-center justify-between text-sm">
                <span className="text-gray-500">Trạng thái</span>
                <div className="flex items-center gap-1 font-bold text-gray-800 cursor-pointer">
                  Đơn mới
                  <ChevronDown size={16} className="text-gray-400" />
                </div>
              </div>

              <div className="flex items-center justify-between text-sm">
                <span className="text-gray-500">Ngày hẹn</span>
                <div className="flex items-center gap-2">
                  <div className="flex items-center gap-1 border-b border-gray-300 pb-0.5 font-bold">
                    {appointmentDate}
                    <Calendar size={14} className="text-gray-400" />
                  </div>
                  <div className="flex items-center gap-1 border-b border-gray-300 pb-0.5 font-bold">
                    {appointmentTime}
                    <Clock size={14} className="text-gray-400" />
                  </div>
                </div>
              </div>
            </div>

            {/* Pricing */}
            <div className="space-y-4 pt-2 border-t border-gray-50">
              {/* Tổng tiền */}
              <div className="flex items-center justify-between">
                <span className="text-sm text-gray-500">Tổng tiền</span>
                <div className="flex items-center border-b border-gray-200 w-36 pb-0.5">
                  <span className="w-full text-right font-bold text-sm">
                    {formatMoney(subtotal)}
                  </span>
                  <span className="text-xs ml-1 font-medium underline text-gray-600">đ</span>
                </div>
              </div>

              {/* Phụ thu */}
              <div className="flex items-center justify-between">
                <span className="text-sm text-gray-500">Phụ thu</span>
                <div className="flex items-center border-b border-gray-200 w-36 pb-0.5">
                  <input
                    type="text"
                    value={surcharge || ""}
                    onChange={(e) => setSurcharge(Number(e.target.value.replace(/\D/g, "")))}
                    className="w-full text-right border-none focus:ring-0 focus:outline-none p-0 text-sm bg-transparent"
                  />
                  <span className="text-xs ml-1 font-medium underline text-gray-600">đ</span>
                </div>
              </div>

              {/* Chiết khấu */}
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <button
                    onClick={() => setIsDiscountPercent(!isDiscountPercent)}
                    className={`relative inline-flex h-4 w-9 items-center rounded-full transition-colors focus:outline-none ${isDiscountPercent ? "bg-green-500" : "bg-gray-200"}`}
                  >
                    <span
                      className={`inline-block h-3 w-3 transform rounded-full bg-white transition-transform ${isDiscountPercent ? "translate-x-5" : "translate-x-1"}`}
                    />
                  </button>
                  <span className="text-sm text-gray-500">
                    C.Khấu {isDiscountPercent ? "(%)" : "(đ)"}
                  </span>
                </div>
                <div className="flex items-center border-b border-gray-200 w-36 pb-0.5">
                  <input
                    type="text"
                    value={discount || ""}
                    onChange={(e) => setDiscount(Number(e.target.value.replace(/\D/g, "")))}
                    className="w-full text-right border-none focus:ring-0 focus:outline-none p-0 text-sm bg-transparent"
                  />
                  <span className="text-xs ml-1 font-medium underline text-gray-600">
                    {isDiscountPercent ? "%" : "đ"}
                  </span>
                </div>
              </div>

              {/* Thành tiền */}
              <div className="flex items-center justify-between pt-2">
                <span className="text-sm font-bold text-gray-800">Thành tiền</span>
                <div className="flex items-center border-b border-gray-200 w-36 pb-0.5">
                  <span className="w-full text-right font-black text-accent-blue text-lg">
                    {formatMoney(total)}
                  </span>
                  <span className="text-xs ml-1 font-medium underline text-accent-blue">đ</span>
                </div>
              </div>
            </div>

            {/* Notes & options */}
            <div className="space-y-4 pt-2">
              <div className="flex items-start gap-2 border-b border-gray-200 pb-2">
                <MessageSquare size={18} className="text-gray-400 mt-0.5" />
                <input
                  type="text"
                  value={note}
                  onChange={(e) => setNote(e.target.value)}
                  className="w-full text-xs italic border-none focus:ring-0 focus:outline-none p-0 text-gray-600 placeholder:text-gray-400"
                  placeholder="Ghi chú hóa đơn"
                />
              </div>

              <label className="flex items-center gap-3 cursor-pointer">
                <div
                  className={`w-4 h-4 border-2 rounded flex items-center justify-center transition-colors ${isPrepaid ? "border-accent-blue bg-accent-blue" : "border-accent-blue bg-white"}`}
                  onClick={() => setIsPrepaid(!isPrepaid)}
                >
                  {isPrepaid && <Check size={12} strokeWidth={3} className="text-white" />}
                </div>
                <span className="text-xs font-semibold text-gray-600">
                  Khách thanh toán trước
                </span>
              </label>
            </div>

            {/* Storage selection */}
            <div
              onClick={() => { setShelfModalOpen(true); setShelfSearch(""); }}
              className={`mt-4 border-2 border-dashed rounded-lg p-4 text-center hover:bg-blue-50 transition-colors cursor-pointer ${
                selectedShelf ? "border-accent-green bg-green-50" : "border-blue-300"
              }`}
            >
              {selectedShelf ? (
                <>
                  <span className="block text-lg font-black text-accent-green">
                    {selectedShelf}
                  </span>
                  <span className="text-[10px] text-gray-400 font-medium mt-1 block">
                    Nhấn để đổi kệ
                  </span>
                </>
              ) : (
                <>
                  <span className="block text-xs font-bold text-accent-blue uppercase tracking-wide">
                    CHỌN KỆ LƯU ĐỒ
                  </span>
                  <span className="text-[10px] text-gray-400 font-medium mt-1 block">
                    (Vị trí cất đồ của khách)
                  </span>
                </>
              )}
            </div>
          </div>

          {/* Bottom actions */}
          <div className="p-3 bg-gray-50 border-t border-gray-100 flex gap-2 shrink-0">
            <button
              disabled={selectedItems.length === 0 || submitting}
              onClick={() => handleSave(true)}
              className={`flex-1 flex items-center justify-center gap-2 py-3 text-xs font-bold rounded-md transition-opacity ${selectedItems.length > 0 && !submitting ? "bg-accent-blue text-white hover:opacity-90" : "bg-gray-300 text-gray-500 cursor-not-allowed opacity-70"}`}
            >
              <Printer size={18} />
              Lưu & In
            </button>
            <button
              disabled={selectedItems.length === 0 || submitting}
              onClick={() => handleSave(false)}
              className={`flex-1 flex items-center justify-center gap-2 py-3 text-xs font-bold rounded-md transition-opacity ${selectedItems.length > 0 && !submitting ? "bg-accent-green text-white hover:opacity-90" : "bg-gray-300 text-gray-500 cursor-not-allowed opacity-70"}`}
            >
              <Save size={18} />
              {submitting ? "Đang lưu..." : "Lưu Phiếu"}
            </button>
          </div>
        </div>
      </main>

      {/* ─── Shelf Picker Modal ─── */}
      {shelfModalOpen && (
        <div className="fixed inset-0 z-[100] flex items-center justify-center bg-black/40" onClick={() => setShelfModalOpen(false)}>
          <div
            className="bg-white rounded-xl shadow-2xl w-[480px] max-h-[80vh] flex flex-col"
            onClick={(e) => e.stopPropagation()}
          >
            {/* Search */}
            <div className="flex items-center gap-2 border-b border-gray-200 px-4 py-3">
              <Search size={18} className="text-gray-400" />
              <input
                type="text"
                value={shelfSearch}
                onChange={(e) => setShelfSearch(e.target.value)}
                className="flex-1 border-none focus:ring-0 focus:outline-none text-sm placeholder:text-gray-400"
                placeholder="Tìm & chọn kệ lưu đồ..."
                autoFocus
              />
              {shelfSearch && (
                <button onClick={() => setShelfSearch("")} className="text-gray-400 hover:text-gray-600">
                  <X size={16} />
                </button>
              )}
            </div>

            {/* Shelf grid */}
            <div className="flex-1 overflow-y-auto custom-scrollbar p-4">
              <div className="grid grid-cols-3 gap-3">
                {shelves
                  .filter((s) => s.name.toLowerCase().includes(shelfSearch.toLowerCase()))
                  .map((shelf) => (
                    <button
                      key={shelf._id}
                      onClick={() => {
                        setSelectedShelf(shelf.name);
                        setShelfModalOpen(false);
                      }}
                      className={`py-3 px-4 rounded-lg border-2 text-sm font-bold transition-all ${
                        selectedShelf === shelf.name
                          ? "border-accent-blue bg-blue-50 text-accent-blue"
                          : "border-gray-200 text-gray-600 hover:border-accent-blue hover:bg-blue-50/50"
                      }`}
                    >
                      {shelf.name}
                    </button>
                  ))}
              </div>
            </div>

            {/* Close button */}
            <div className="border-t border-gray-200 px-4 py-3 flex justify-end">
              <button
                onClick={() => setShelfModalOpen(false)}
                className="px-6 py-2 text-sm font-bold text-gray-600 hover:text-gray-800 hover:bg-gray-100 rounded-md transition-colors"
              >
                ĐÓNG
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
