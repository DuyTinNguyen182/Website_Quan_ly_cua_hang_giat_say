import { useNavigate } from "react-router-dom";
import { useEffect, useState, useMemo } from "react";
import { useAuth } from "../context/AuthContext";
import Header from "../components/Header";
import axiosInstance from "../api/axiosInstance";
import {
  ChevronLeft,
  Check,
  Filter,
  Search,
  Printer,
  Clock,
  Plus,
  Pencil,
  Trash2,
  X,
} from "lucide-react";

const formatCurrency = (n) => new Intl.NumberFormat("vi-VN").format(n);

const formatDate = (iso) => {
  if (!iso) return "—";
  const d = new Date(iso);
  const pad = (v) => String(v).padStart(2, "0");
  const h = d.getHours(), m = d.getMinutes();
  const period = h < 12 ? "SA" : "CH";
  const hh = h % 12 === 0 ? 12 : h % 12;
  return `${hh}:${pad(m)} ${period}, ${pad(d.getDate())}/${pad(d.getMonth()+1)}/${d.getFullYear()}`;
};

export default function ThuChiPage() {
  const navigate = useNavigate();
  const { user } = useAuth();

  useEffect(() => {
    if (!user) navigate("/login");
  }, [user, navigate]);

  const [records, setRecords] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState("");
  // modal state for creating new transaction
  const [showModal, setShowModal] = useState(false);
  const [form, setForm] = useState({ type: "EXPENSE", category: "", amount: "", description: "", transaction_date: new Date().toISOString().slice(0, 10) });
  const [saving, setSaving] = useState(false);

  const loadRecords = () => {
    setLoading(true);
    axiosInstance.get("/transactions")
      .then((res) => setRecords(res.data))
      .catch(() => {})
      .finally(() => setLoading(false));
  };

  useEffect(() => { if (user) loadRecords(); }, [user]);

  const filtered = useMemo(() => {
    if (!searchTerm.trim()) return records;
    const q = searchTerm.toLowerCase();
    return records.filter(
      (r) =>
        r.category?.toLowerCase().includes(q) ||
        r.description?.toLowerCase().includes(q) ||
        r.created_by?.full_name?.toLowerCase().includes(q),
    );
  }, [records, searchTerm]);

  const totalThu = useMemo(
    () => records.filter((r) => r.type === "INCOME").reduce((s, r) => s + r.amount, 0),
    [records],
  );
  const totalChi = useMemo(
    () => records.filter((r) => r.type === "EXPENSE").reduce((s, r) => s + r.amount, 0),
    [records],
  );

  const handleDelete = async (id) => {
    if (!window.confirm("Xóa phiếu này?")) return;
    try {
      await axiosInstance.delete(`/transactions/${id}`);
      loadRecords();
    } catch { alert("Không thể xóa!"); }
  };

  const handleCreate = async (e) => {
    e.preventDefault();
    if (!form.category.trim() || !form.amount) return;
    setSaving(true);
    try {
      await axiosInstance.post("/transactions", {
        ...form,
        amount: Number(form.amount),
        created_by: user.id,
      });
      setShowModal(false);
      setForm({ type: "EXPENSE", category: "", amount: "", description: "", transaction_date: new Date().toISOString().slice(0, 10) });
      loadRecords();
    } catch (err) {
      alert(err.response?.data?.message || "Lỗi khi tạo phiếu!");
    } finally {
      setSaving(false);
    }
  };

  return (
    <div className="h-screen flex flex-col overflow-hidden text-sm bg-main-bg font-sans">
      <Header activePage="thu-chi" />

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
          <button className="flex items-center gap-1.5 text-slate-600 hover:text-slate-800 border border-slate-300 rounded-full px-3 py-1 transition-colors">
            <Filter className="w-4 h-4" />
            <span className="text-xs font-bold uppercase">LỌC</span>
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

            {/* Grid table */}
            <div>
              {/* Header */}
              <div className="grid grid-cols-12 bg-slate-50 border-b border-gray-200 px-4 py-2.5 text-[11px] font-bold text-gray-500 uppercase tracking-wider">
                <div className="col-span-1 text-center">In phiếu</div>
                <div className="col-span-3">Thông tin phiếu</div>
                <div className="col-span-3">Hình thức</div>
                <div className="col-span-3">Nhân viên lập</div>
                <div className="col-span-1 text-center">Số tiền</div>
                <div className="col-span-1 text-right">Tác vụ</div>
              </div>

              {/* Rows */}
              {loading ? (
                <div className="py-12 text-center text-slate-400 italic">Đang tải...</div>
              ) : filtered.length > 0 ? (
                filtered.map((r) => (
                  <div key={r._id} className="grid grid-cols-12 px-4 py-3.5 border-b border-gray-100 hover:bg-gray-50 transition-colors items-center text-sm">
                    <div className="col-span-1 flex justify-center">
                      <Printer size={18} className="text-gray-500 cursor-pointer hover:text-nav-bg" />
                    </div>
                    <div className="col-span-3 space-y-0.5">
                      <div className="flex items-center gap-2">
                        <span className="font-bold text-gray-800">{r.category}</span>
                        <span className={`text-white text-[9px] px-1.5 py-0.5 rounded font-bold uppercase ${r.type === "INCOME" ? "bg-accent-green" : "bg-orange-500"}`}>
                          {r.type === "INCOME" ? "Thu" : "Chi"}
                        </span>
                      </div>
                      <div className="text-[11px] text-gray-500">
                        Mã phiếu: <span className="font-semibold text-gray-700">{r.transaction_code ?? r._id?.slice(-6).toUpperCase()}</span>
                      </div>
                    </div>
                    <div className="col-span-3 space-y-0.5">
                      <div className="text-[13px] text-gray-700 font-medium">
                        {r.payment_method === "BANK" ? "Chuyển khoản" : "Tiền mặt"}
                      </div>
                      {r.recipient_name && (
                        <div className="text-[11px] text-gray-500">
                          Người nhận: <span className="font-semibold text-gray-700 uppercase">{r.recipient_name}</span>
                        </div>
                      )}
                      {r.description && (
                        <div className="text-[11px] text-gray-400 truncate">{r.description}</div>
                      )}
                    </div>
                    <div className="col-span-3 space-y-0.5">
                      <div className="font-bold text-gray-800 text-[13px] uppercase">{r.created_by?.full_name ?? "—"}</div>
                      <div className="text-[11px] text-gray-500 flex items-center gap-1">
                        <Clock size={12} />
                        {formatDate(r.created_at)}
                      </div>
                    </div>
                    <div className="col-span-1 text-center">
                      <span className="font-bold text-gray-900 text-[15px]">{formatCurrency(r.amount)}</span>
                    </div>
                    <div className="col-span-1 flex items-center justify-end gap-3">
                      <button className="flex items-center gap-1 text-xs font-semibold text-sky-500 hover:text-sky-700 transition-colors" title="Sửa">
                        <Pencil className="w-3.5 h-3.5" />Sửa
                      </button>
                      <button onClick={() => handleDelete(r._id)} className="flex items-center gap-1 text-xs font-semibold text-red-400 hover:text-red-600 transition-colors" title="Xóa">
                        <Trash2 className="w-3.5 h-3.5" />Xóa
                      </button>
                    </div>
                  </div>
                ))
              ) : (
                <div className="py-12 text-center text-slate-400 italic">Không tìm thấy phiếu nào</div>
              )}
            </div>
          </div>
        </div>
      </main>

      {/* ─── FAB ─── */}
      <button
        onClick={() => setShowModal(true)}
        className="fixed bottom-6 right-6 w-14 h-14 bg-nav-bg text-white rounded-full shadow-lg hover:opacity-90 transition-transform active:scale-95 flex items-center justify-center z-50"
      >
        <Plus className="w-8 h-8" />
      </button>

      {/* ─── Create Transaction Modal ─── */}
      {showModal && (
        <div className="fixed inset-0 z-[100] flex items-center justify-center bg-black/40" onClick={() => setShowModal(false)}>
          <form
            onClick={(e) => e.stopPropagation()}
            onSubmit={handleCreate}
            className="bg-white rounded-xl shadow-2xl w-[420px] p-6 flex flex-col gap-4"
          >
            <div className="flex items-center justify-between">
              <h2 className="font-bold text-gray-800 text-base">Tạo phiếu Thu / Chi</h2>
              <button type="button" onClick={() => setShowModal(false)} className="text-gray-400 hover:text-gray-600"><X size={20} /></button>
            </div>

            <div className="flex gap-3">
              <label className="flex items-center gap-2 cursor-pointer">
                <input type="radio" name="type" value="INCOME" checked={form.type === "INCOME"} onChange={(e) => setForm({ ...form, type: e.target.value })} />
                <span className="text-sm font-semibold text-accent-green">Thu</span>
              </label>
              <label className="flex items-center gap-2 cursor-pointer">
                <input type="radio" name="type" value="EXPENSE" checked={form.type === "EXPENSE"} onChange={(e) => setForm({ ...form, type: e.target.value })} />
                <span className="text-sm font-semibold text-orange-500">Chi</span>
              </label>
            </div>

            <div>
              <label className="text-xs font-semibold text-gray-500 block mb-1">Danh mục *</label>
              <input
                required
                value={form.category}
                onChange={(e) => setForm({ ...form, category: e.target.value })}
                className="w-full border border-gray-200 rounded-md px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-nav-bg/30"
                placeholder="VD: Mua bột giặt, Tiền điện..."
              />
            </div>

            <div>
              <label className="text-xs font-semibold text-gray-500 block mb-1">Số tiền *</label>
              <input
                required
                type="number"
                min="0"
                value={form.amount}
                onChange={(e) => setForm({ ...form, amount: e.target.value })}
                className="w-full border border-gray-200 rounded-md px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-nav-bg/30"
                placeholder="0"
              />
            </div>

            <div>
              <label className="text-xs font-semibold text-gray-500 block mb-1">Ghi chú</label>
              <input
                value={form.description}
                onChange={(e) => setForm({ ...form, description: e.target.value })}
                className="w-full border border-gray-200 rounded-md px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-nav-bg/30"
                placeholder="Ghi chú (tùy chọn)"
              />
            </div>

            <div>
              <label className="text-xs font-semibold text-gray-500 block mb-1">Ngày giao dịch *</label>
              <input
                required
                type="date"
                value={form.transaction_date}
                onChange={(e) => setForm({ ...form, transaction_date: e.target.value })}
                className="w-full border border-gray-200 rounded-md px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-nav-bg/30"
              />
            </div>

            <div className="flex gap-3 pt-2">
              <button type="button" onClick={() => setShowModal(false)} className="flex-1 py-2.5 text-sm font-bold text-gray-600 hover:bg-gray-100 rounded-md transition-colors">Hủy</button>
              <button type="submit" disabled={saving} className="flex-1 py-2.5 text-sm font-bold text-white bg-nav-bg rounded-md hover:opacity-90 disabled:opacity-60">
                {saving ? "Đang lưu..." : "Lưu phiếu"}
              </button>
            </div>
          </form>
        </div>
      )}
    </div>
  );
}
