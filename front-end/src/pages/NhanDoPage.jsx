import { useNavigate } from "react-router-dom";
import { useEffect, useCallback, useState } from "react";
import { useAuth } from "../context/AuthContext";
import Header from "../components/Header";
import axiosInstance from "../api/axiosInstance";
import { QRCodeSVG } from 'qrcode.react';
import {
  PlusCircle,
  ChevronDown,
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
  const [selectedShelf, setSelectedShelf] = useState(null);
  const [shelfModalOpen, setShelfModalOpen] = useState(false);
  const [shelfSearch, setShelfSearch] = useState("");
  const [submitting, setSubmitting] = useState(false);
  // customer search
  const [customerSearch, setCustomerSearch] = useState("");
  const [customers, setCustomers] = useState([]);
  const [selectedCustomer, setSelectedCustomer] = useState(null);
  const [showCustomerDropdown, setShowCustomerDropdown] = useState(false);
  const [latestCustomers, setLatestCustomers] = useState([]);
  
  // new customer modal
  const [isAddCustomerModalOpen, setIsAddCustomerModalOpen] = useState(false);
  const [newCustomerFullName, setNewCustomerFullName] = useState("");
  const [newCustomerPhone, setNewCustomerPhone] = useState("");
  const [newCustomerAddress, setNewCustomerAddress] = useState("");

  const [qrModalOpen, setQrModalOpen] = useState(false);
  const [qrCodeData, setQrCodeData] = useState(null);
  const [isGeneratingQR, setIsGeneratingQR] = useState(false);

  // Print code
  const [printedCode, setPrintedCode] = useState("");

  const [loading, setLoading] = useState(true);

  /* --- load shelves & services on mount --- */
  useEffect(() => {
    Promise.all([
      axiosInstance.get("/shelves"),
      axiosInstance.get("/services"),
      axiosInstance.get("/customers?limit=5"), // Fetch latest customers
    ]).then(([shelvesRes, servicesRes, customerRes]) => {
      setShelves(shelvesRes.data.filter((s) => s.is_active).map((s) => ({ _id: s._id, name: s.name })));
      
      const activeServices = servicesRes.data.filter((s) => s.is_active).map((s) => ({
        id: s._id,
        name: s.name,
        price: s.price,
        unit: s.unit_id?.name ?? "",
      }));
      setServices(activeServices);
      
      // Select "Giặt hỗn hợp" by default if it exists
      const defaultService = activeServices.find(s => s.name.toLowerCase() === "giặt hỗn hợp") || activeServices[0];
      if (defaultService) {
        setSelectedItems([{ ...defaultService, qty: 1 }]);
      }

      // Latest customers fall back logic (if api sorts by newest)
      if (customerRes && customerRes.data) {
        setLatestCustomers(customerRes.data.slice(0, 5)); // Top 5
      }

    }).catch(() => {}).finally(() => setLoading(false));
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
        .map((i) => (i.id === id ? { ...i, qty: Math.max(1, i.qty + delta) } : i))
        .filter((i) => i.qty > 0),
    );
  };

  const setExactQty = (id, quantity) => {
    if (quantity <= 0 || isNaN(quantity)) return;
    setSelectedItems((prev) =>
      prev.map((i) => (i.id === id ? { ...i, qty: quantity } : i))
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

  /* --- print code --- */
  const handlePrintCode = () => {
    let code = printedCode;
    if (!code) {
      code = Math.floor(100000 + Math.random() * 900000).toString();
      setPrintedCode(code);
    }
    setTimeout(() => {
      window.print();
    }, 200);
  };

  /* --- add customer --- */
  const handleAddCustomer = async () => {
    if (!newCustomerFullName || !newCustomerPhone) {
      alert("Vui lòng nhập tên và số điện thoại khách hàng!");
      return;
    }
    try {
      const res = await axiosInstance.post("/customers", {
        full_name: newCustomerFullName,
        phone: newCustomerPhone,
        address: newCustomerAddress,
      });
      const createdCustomer = res.data?.customer ?? res.data;
      setSelectedCustomer(createdCustomer);
      setCustomerSearch("");
      setShowCustomerDropdown(false);
      setCustomers([]);
      setLatestCustomers((prev) => {
        const next = [createdCustomer, ...prev.filter((c) => c._id !== createdCustomer?._id)];
        return next.slice(0, 5);
      });
      setIsAddCustomerModalOpen(false);
      setNewCustomerFullName("");
      setNewCustomerPhone("");
      setNewCustomerAddress("");
      alert("Tạo khách hàng mới thành công!");
    } catch (err) {
      alert(err.response?.data?.message || "Lỗi khi tạo khách hàng!");
    }
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
    setPrintedCode("");
  };

  /* --- save order --- */
  const handleSave = async (print = false) => {
    if (selectedItems.length === 0) return;
    if (!selectedCustomer) { alert("Vui lòng chọn khách hàng!"); return; }
    if (!printedCode) { alert("Vui lòng in phiếu mã đơn trước khi lưu!"); return; }

    setSubmitting(true);
    try {
      const shelfObj = shelves.find((s) => s.name === selectedShelf);
      const orderPayload = {
        order_code: printedCode,
        status: "RECEIVED", // Đã đủ đồ
        customer_id: selectedCustomer._id,
        payment_method: "CASH",
        payment_status: isPrepaid ? "PAID" : "UNPAID",
        surcharge,
        discount_type: isDiscountPercent ? "PERCENT" : "FIXED",
        discount_value: discount,
        note,
        shelf_id: shelfObj?._id ?? undefined,
        created_by: user.id,
      };
      const orderRes = await axiosInstance.post("/orders", orderPayload);
      const orderId = orderRes.data.order._id || orderRes.data._id;

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
      else {
        alert("Lưu thao tác thành công!");
        navigate("/danh-sach-do");
      }
    } catch (err) {
      alert(err.response?.data?.message || "Lỗi khi tạo phiếu!");
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <>
    {/* ─── Printable Code ─── */}
    <div className="hidden print:flex flex-col items-center justify-center p-8 w-full h-screen bg-white">
      <h2 className="text-3xl font-bold mb-8 uppercase tracking-wider">Phiếu Mã Đối Chiếu</h2>
      <div className="flex w-full max-w-4xl justify-between gap-12">
        <div className="flex-1 border-4 border-dashed border-gray-400 p-10 flex flex-col items-center">
            <span className="text-xl font-bold uppercase mb-4 text-gray-500">Liên 1 - Giao Khách</span>
            <span className="text-7xl font-black">{printedCode}</span>
        </div>
        <div className="flex-1 border-4 border-dashed border-gray-400 p-10 flex flex-col items-center">
            <span className="text-xl font-bold uppercase mb-4 text-gray-500">Liên 2 - Gắn Túi</span>
            <span className="text-7xl font-black">{printedCode}</span>
        </div>
      </div>
    </div>

    {/* ─── Main UI ─── */}
    <div className="h-screen flex flex-col overflow-hidden text-sm bg-main-bg font-sans print:hidden [&_button:not(:disabled)]:cursor-pointer">
      <Header activePage="nhan-do" />

      {/* ─── Loading skeleton ─── */}
      {loading && (
        <div className="flex-1 flex items-center justify-center gap-4 animate-fade-in">
          <div className="flex flex-col items-center gap-3">
            <div className="w-10 h-10 border-3 border-nav-bg border-t-transparent rounded-full animate-spin" style={{borderWidth:"3px"}} />
            <span className="text-sm text-slate-400 font-medium">Đang tải dữ liệu...</span>
          </div>
        </div>
      )}

      {/* ─── Main UI (hidden while loading) ─── */}
      <div className={`flex-1 flex flex-col overflow-hidden transition-opacity duration-300 ${loading ? "opacity-0 pointer-events-none h-0" : "opacity-100 animate-fade-in"}`}>

      {/* ─── Tab bar ─── */}
      {/* <div className="bg-white border-b border-gray-200 h-10 flex items-center px-4 shrink-0 justify-between">
        <div className="flex items-center h-full">
          <div className="border-b-2 border-nav-bg h-full flex items-center px-6 gap-2 text-nav-bg font-bold text-xs animate-fade-in">
            <span className="material-symbols-outlined text-[16px]">description</span>
            CỬA SỔ 1
          </div>
        </div>
        <button className="p-1 text-gray-500 hover:text-gray-700">
          <PlusCircle size={20} />
        </button>
      </div> */}

      {/* ─── Main Content ─── */}
      <main className="flex-1 flex overflow-hidden p-3 gap-3">
        {/* === Left Panel === */}
        <div className="flex-[7] flex flex-col gap-3 overflow-hidden">
          {/* Search */}
          {/* <div className="relative bg-white border border-gray-200 rounded-md shadow-sm p-1">
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
          </div> */}

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
                    className="grid grid-cols-12 items-center px-3 py-2 border-b border-gray-100 text-sm table-row-hover"
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
                      <input
                        type="number"
                        min="1"
                        value={item.qty}
                        onChange={(e) => setExactQty(item.id, parseInt(e.target.value) || 1)}
                        className="w-10 text-center font-bold border rounded hide-number-spinners py-0.5 text-sm"
                      />
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
          <div className="flex flex-col h-[38%] bg-white border border-blue-200 rounded-lg shadow-sm overflow-hidden">
            {/* Tiêu đề */}
            <div className="flex items-center gap-2 px-3 py-2 border-b border-blue-100 bg-blue-50 shrink-0">
              <PlusCircle size={15} className="text-accent-blue shrink-0" />
              <span className="text-xs font-bold text-accent-blue uppercase tracking-wide">
                Hãy chọn dịch vụ
              </span>
              <span className="ml-auto text-[11px] text-gray-400">
                {filteredServices.length} dịch vụ
              </span>
            </div>
            <div className="flex-1 overflow-y-auto custom-scrollbar p-2.5">
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-2">
              {filteredServices.map((svc) => (
                <div
                  key={svc.id}
                  onClick={() => addService(svc)}
                  className="bg-white border border-blue-300 rounded-lg p-3 flex items-center gap-3 relative hover:shadow-lg hover:-translate-y-0.5 hover:border-accent-blue cursor-pointer group transition-all duration-200"
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
        </div>

        {/* === Right Panel === */}
        <div className="flex-[3] bg-white rounded-lg shadow-sm border border-gray-200 flex flex-col overflow-hidden">
          <div className="flex-1 p-4 overflow-y-auto custom-scrollbar flex flex-col gap-4">
            {/* Customer search */}
<div className="relative flex items-center border border-gray-200 rounded-md p-1.5 px-3 bg-gray-50">
              <input
                type="text"
                value={selectedCustomer ? selectedCustomer.full_name : customerSearch}
                onChange={(e) => {
                  setCustomerSearch(e.target.value);
                  setSelectedCustomer(null);
                  setShowCustomerDropdown(true);
                }}
                onFocus={() => setShowCustomerDropdown(true)}
                onBlur={() => {
                  // Delay hiding so clicks on dropdown items can register first
                  setTimeout(() => setShowCustomerDropdown(false), 200);
                }}
                className="flex-1 border-none focus:ring-0 focus:outline-none text-sm p-0 bg-transparent placeholder:text-gray-500 font-medium"
                placeholder="Tìm tên, điện thoại..."
              />
              {selectedCustomer ? (
                <button onClick={() => { setSelectedCustomer(null); setCustomerSearch(""); }} className="text-gray-400 hover:text-gray-600 transition-colors ml-2">
                  <X size={18} />
                </button>
              ) : (
                <button 
                  onClick={() => setIsAddCustomerModalOpen(true)}
                  className="flex items-center gap-1.5 ml-2 pl-2 border-l border-gray-300 text-nav-bg hover:text-blue-700 transition-colors cursor-pointer text-xs font-bold whitespace-nowrap"
                >
                  <UserPlus size={16} />
                  MỚI
                </button>
              )}
              {showCustomerDropdown && (customerSearch ? customers.length > 0 : latestCustomers.length > 0) && (
                <div className="absolute top-full left-0 right-0 mt-1 z-50 bg-white border border-gray-200 rounded-md shadow-lg max-h-60 overflow-y-auto">
                    {!customerSearch && latestCustomers.length > 0 && <div className="px-3 py-1.5 text-[11px] font-bold text-gray-400 uppercase bg-gray-50">Khách hàng gần đây</div>}
                  {(customerSearch ? customers : latestCustomers).map((c) => (
                    <div
                      key={c._id}
                      className="px-4 py-2.5 text-sm hover:bg-blue-50 cursor-pointer border-b border-gray-50 last:border-b-0"
                      onMouseDown={() => { setSelectedCustomer(c); setCustomerSearch(""); setShowCustomerDropdown(false); setCustomers([]); }}
                    >
                      <div className="font-bold text-gray-800">{c.full_name}</div>
                      <div className="text-xs text-gray-500 mt-0.5">{c.phone}</div>
                    </div>
                  ))}
                </div>
              )}
            </div>

            {/* Pricing */}
            <div className="space-y-3 pt-1 border-t border-gray-100">
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
              <div className="flex items-center justify-between pt-1">
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
            <div className="space-y-3 pt-1">
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

              {/* <div className="flex items-center gap-4 mt-2">
                <label className="flex items-center gap-3 cursor-pointer">
                  <div
                    className={`w-4 h-4 border-2 rounded flex items-center justify-center transition-colors ${isPrepaid ? "border-accent-blue bg-accent-blue" : "border-accent-blue bg-white"}`}
                    onClick={() => setIsPrepaid(!isPrepaid)}
                  >
                    {isPrepaid && <Check size={12} strokeWidth={3} className="text-white" />}
                  </div>
                  <span className="text-xs font-semibold text-gray-600">
                    Khách đã thanh toán
                  </span>
                </label>
                
                <button
                  type="button"
                  disabled={isGeneratingQR || selectedItems.length === 0}
                  onClick={async () => {
                    if (selectedItems.length === 0) return alert("Vui lòng thêm dịch vụ!");
                      if (!printedCode) return alert("Vui lòng Bấm In Phiếu Mã hoặc tạo mã phiếu hiển thị trước khi thanh toán!");
                      setIsGeneratingQR(true);
                      try {
                        // Tính tổng tiền
                        const subtotal = selectedItems.reduce((acc, item) => acc + item.price * item.qty, 0);
                        const discountAmount = isDiscountPercent ? (subtotal * discount) / 100 : discount;
                        const totalToPay = subtotal + surcharge - discountAmount;
                        
                        const response = await axiosInstance.post('/payments/create-payment-link', {
                          orderCode: Number(printedCode),
                          amount: totalToPay,
                          description: `Thanh toan don hang`,
                          returnUrl: window.location.href,
                          cancelUrl: window.location.href
                        });

                        if (response.data.success) {
                          setQrCodeData(response.data.qrCode);
                          setQrModalOpen(true);
                          setIsPrepaid(true); // Tự động check đã thanh toán nếu mở QR
                        }
                    } catch (error) {
                      alert("Không thể tạo mã QR!");
                    } finally {
                      setIsGeneratingQR(false);
                    }
                  }}
                  className="px-3 py-1 bg-accent-blue text-white text-xs font-bold rounded hover:opacity-90 disabled:opacity-50"
                >
                  {isGeneratingQR ? "Đang tạo..." : "Tạo mã QR PayOS"}
                </button>
              </div> */}
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
              disabled={submitting || !!printedCode}
              onClick={handlePrintCode}
              className={`flex-1 flex items-center justify-center gap-2 py-3 text-xs font-bold rounded-md transition-all duration-200 ${
                !!printedCode
                  ? "bg-gray-400 text-white cursor-not-allowed"
                  : "bg-accent-blue text-white hover:opacity-90 hover:shadow-lg hover:-translate-y-0.5 active:translate-y-0 disabled:opacity-60"
              }`}
            >
              {!!printedCode ? <Check size={18} /> : <Printer size={18} />}
              {!!printedCode ? "Đã In Phiếu" : "In Phiếu Mã"}
            </button>
            <button
              disabled={submitting || !printedCode || !selectedCustomer || selectedItems.length === 0}
              onClick={() => handleSave(false)}
              className={`flex-1 flex items-center justify-center gap-2 py-3 text-xs font-bold rounded-md transition-all duration-200 ${
                (!printedCode || !selectedCustomer || selectedItems.length === 0)
                  ? "bg-gray-400 text-white cursor-not-allowed"
                  : "bg-accent-green text-white hover:opacity-90 hover:shadow-lg hover:-translate-y-0.5 active:translate-y-0 disabled:opacity-60"
              }`}
            >
              <Save size={18} />
              {submitting ? "Đang lưu..." : "Lưu Đơn Hàng"}
            </button>
          </div>
        </div>
      </main>

      {/* ─── Shelf Picker Modal ─── */}
      {shelfModalOpen && (
        <div className="fixed inset-0 z-[100] flex items-center justify-center bg-black/40 backdrop-blur-sm" onClick={() => setShelfModalOpen(false)}>
          <div
            className="bg-white rounded-2xl shadow-2xl w-[480px] max-h-[80vh] flex flex-col animate-scale-in"
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
      </div>{/* end main UI wrapper */}
      {/* ─── Add Customer Modal ─── */}
      {isAddCustomerModalOpen && (
        <div className="fixed inset-0 z-[100] flex items-center justify-center bg-black/40 backdrop-blur-sm" onClick={() => setIsAddCustomerModalOpen(false)}>
          <div
            className="bg-white rounded-2xl shadow-2xl w-[400px] flex flex-col overflow-hidden animate-scale-in"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="bg-nav-bg py-3 px-5 flex items-center justify-between">
              <h3 className="text-white font-bold text-base">Thêm Khách Hàng</h3>
              <button onClick={() => setIsAddCustomerModalOpen(false)} className="text-white/80 hover:text-white">
                <X size={20} />
              </button>
            </div>
            <div className="p-5 flex flex-col gap-4">
              <div>
                <label className="block text-xs font-bold text-gray-700 mb-1">Tên khách hàng</label>
                <input
                  type="text"
                  value={newCustomerFullName}
                  onChange={(e) => setNewCustomerFullName(e.target.value)}
                  className="w-full border border-gray-300 rounded px-3 py-2 text-sm focus:border-accent-blue focus:ring-1 focus:ring-accent-blue outline-none"
                  placeholder="Nhập tên..."
                />
              </div>
              <div>
                <label className="block text-xs font-bold text-gray-700 mb-1">Số điện thoại (*)</label>
                <input
                  type="text"
                  value={newCustomerPhone}
                  onChange={(e) => setNewCustomerPhone(e.target.value)}
                  className="w-full border border-gray-300 rounded px-3 py-2 text-sm focus:border-accent-blue focus:ring-1 focus:ring-accent-blue outline-none"
                  placeholder="Nhập SĐT..."
                />
              </div>
              <div>
                <label className="block text-xs font-bold text-gray-700 mb-1">Địa chỉ</label>
                <input
                  type="text"
                  value={newCustomerAddress}
                  onChange={(e) => setNewCustomerAddress(e.target.value)}
                  className="w-full border border-gray-300 rounded px-3 py-2 text-sm focus:border-accent-blue focus:ring-1 focus:ring-accent-blue outline-none"
                  placeholder="Nhập địa chỉ..."
                />
              </div>
              <button
                onClick={handleAddCustomer}
                className="mt-2 w-full py-2 bg-nav-bg text-white font-bold rounded hover:opacity-90"
              >
                Lưu Khách Hàng
              </button>
            </div>
          </div>
        </div>
      )}

      {/* ─── Thanh toán QR Modal ─── */}
      {qrModalOpen && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-lg w-full max-w-sm overflow-hidden flex flex-col shadow-2xl">
            <div className="bg-accent-blue text-white px-4 py-3 flex justify-between items-center">
              <h3 className="font-bold uppercase tracking-wider text-sm">Quét Mã Thanh Toán (PayOS)</h3>
              <button onClick={() => setQrModalOpen(false)} className="text-white hover:text-red-200">
                <X size={20} />
              </button>
            </div>
            <div className="p-6 flex flex-col items-center">
              <div className="bg-white p-2 rounded shadow-sm border border-gray-100 flex justify-center w-full">
                {qrCodeData ? (
                  <QRCodeSVG value={qrCodeData} size={250} level="H" includeMargin={true} />
                ) : (
                  <div className="h-[250px] w-[250px] flex items-center justify-center border-2 border-dashed border-gray-300">
                    <span className="text-gray-400">Không có dữ liệu QR</span>
                  </div>
                )}
              </div>
              <p className="mt-4 text-sm font-semibold text-gray-700 text-center">
                Quét mã để thanh toán đơn hàng
              </p>
              <button
                onClick={() => setQrModalOpen(false)}
                className="mt-6 w-full py-2 bg-accent-green text-white font-bold rounded hover:opacity-90"
              >
                Xác nhận đã thanh toán
              </button>
            </div>
          </div>
        </div>
      )}

    </div>
    </>
  );
}



