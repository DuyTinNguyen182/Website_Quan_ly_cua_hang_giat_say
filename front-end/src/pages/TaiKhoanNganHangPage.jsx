import { useNavigate } from "react-router-dom";
import { useEffect, useState } from "react";
import { useAuth } from "../context/AuthContext";
import Header from "../components/Header";

const BANKS = [
  { id: "agribank",   name: "Agribank",     full: "Ngân hàng Nông nghiệp và Phát triển Nông thôn Việt Nam", color: "#e2001a", bg: "#fff0f0" },
  { id: "vietinbank", name: "VietinBank",   full: "Ngân hàng TMCP Công thương Việt Nam",                    color: "#006DB7", bg: "#f0f7ff" },
  { id: "vietcombank",name: "Vietcombank",  full: "Ngân hàng TMCP Ngoại thương Việt Nam",                   color: "#007B40", bg: "#f0fff5" },
  { id: "bidv",       name: "BIDV",         full: "Ngân hàng TMCP Đầu tư và Phát triển Việt Nam",           color: "#005BAA", bg: "#f0f5ff" },
  { id: "mbbank",     name: "MB Bank",      full: "Ngân hàng TMCP Quân đội",                                color: "#7B2D8B", bg: "#faf0ff" },
  { id: "tpbank",     name: "TPBank",       full: "Ngân hàng TMCP Tiên Phong",                              color: "#612b8a", bg: "#f5f0ff" },
  { id: "acb",        name: "ACB",          full: "Ngân hàng TMCP Á Châu",                                  color: "#003087", bg: "#f0f4ff" },
  { id: "techcombank",name: "Techcombank",  full: "Ngân hàng TMCP Kỹ thương Việt Nam",                      color: "#cc0000", bg: "#fff0f0" },
  { id: "vpbank",     name: "VPBank",       full: "Ngân hàng TMCP Việt Nam Thịnh Vượng",                    color: "#00A651", bg: "#f0fff7" },
  { id: "sacombank",  name: "Sacombank",    full: "Ngân hàng TMCP Sài Gòn Thương Tín",                      color: "#004B87", bg: "#f0f6ff" },
  { id: "hdbank",     name: "HDBank",       full: "Ngân hàng TMCP Phát triển TP.HCM",                       color: "#0056A2", bg: "#f0f5ff" },
  { id: "ocb",        name: "OCB",          full: "Ngân hàng TMCP Phương Đông",                             color: "#E87722", bg: "#fff8f0" },
  { id: "msb",        name: "MSB",          full: "Ngân hàng TMCP Hàng Hải Việt Nam",                       color: "#005BAC", bg: "#f0f5ff" },
  { id: "seabank",    name: "SeABank",      full: "Ngân hàng TMCP Đông Nam Á",                              color: "#E2001A", bg: "#fff0f0" },
  { id: "vib",        name: "VIB",          full: "Ngân hàng TMCP Quốc tế Việt Nam",                        color: "#0066CC", bg: "#f0f5ff" },
  { id: "other",      name: "Khác",         full: "Ngân hàng khác",                                         color: "#6b7280", bg: "#f9fafb" },
];

const STORAGE_KEY = "viwash_bank_accounts";

function loadAccounts() {
  try {
    return JSON.parse(localStorage.getItem(STORAGE_KEY)) || [];
  } catch {
    return [];
  }
}

function saveAccounts(list) {
  localStorage.setItem(STORAGE_KEY, JSON.stringify(list));
}

function getBankInfo(id) {
  return BANKS.find((b) => b.id === id) || BANKS[BANKS.length - 1];
}

export default function TaiKhoanNganHangPage() {
  const navigate = useNavigate();
  const { user } = useAuth();

  const [view, setView] = useState("list");
  const [accounts, setAccounts] = useState(loadAccounts);
  const [search, setSearch] = useState("");
  const [selected, setSelected] = useState(null);
  const [form, setForm] = useState({ bank_id: "", owner: "", account_number: "", note: "" });
  const [errors, setErrors] = useState({});
  const [submitting, setSubmitting] = useState(false);
  const [deleteId, setDeleteId] = useState(null);

  useEffect(() => {
    if (!user) navigate("/login");
  }, [user, navigate]);

  const filtered = accounts.filter((a) => {
    const bank = getBankInfo(a.bank_id);
    return (
      bank.name.toLowerCase().includes(search.toLowerCase()) ||
      a.owner.toLowerCase().includes(search.toLowerCase()) ||
      a.account_number.includes(search)
    );
  });

  const openAdd = () => {
    setForm({ bank_id: "", owner: "", account_number: "", note: "" });
    setErrors({});
    setView("add");
  };

  const openEdit = (account) => {
    setSelected(account);
    setForm({
      bank_id: account.bank_id,
      owner: account.owner,
      account_number: account.account_number,
      note: account.note || "",
    });
    setErrors({});
    setView("edit");
  };

  const handleDelete = (id) => {
    const updated = accounts.filter((a) => a.id !== id);
    setAccounts(updated);
    saveAccounts(updated);
    setDeleteId(null);
  };

  const validate = () => {
    const errs = {};
    if (!form.bank_id) errs.bank_id = "Vui lòng chọn ngân hàng.";
    if (!form.owner.trim()) errs.owner = "Vui lòng nhập chủ tài khoản.";
    if (!form.account_number.trim()) errs.account_number = "Vui lòng nhập số tài khoản.";
    return errs;
  };

  const handleSubmit = () => {
    const errs = validate();
    if (Object.keys(errs).length > 0) { setErrors(errs); return; }
    setSubmitting(true);
    setTimeout(() => {
      if (view === "add") {
        const newItem = { ...form, id: Date.now().toString() };
        const updated = [...accounts, newItem];
        setAccounts(updated);
        saveAccounts(updated);
      } else {
        const updated = accounts.map((a) =>
          a.id === selected.id ? { ...a, ...form } : a
        );
        setAccounts(updated);
        saveAccounts(updated);
      }
      setSubmitting(false);
      setView("list");
    }, 300);
  };

  // ─── FORM VIEW ─────────────────────────────────────────────────────────────
  if (view === "add" || view === "edit") {
    return (
      <div
        className="min-h-screen flex flex-col"
        style={{ background: "linear-gradient(135deg, #ede8ff 0%, #e0e9ff 50%, #e8f4ff 100%)" }}
      >
        <Header activePage="tai-khoan-ngan-hang" />

        <main className="flex-1 flex items-start justify-center px-4 py-10">
          <div className="bg-white rounded-2xl shadow-md w-full max-w-115 px-8 py-8">

            {/* Breadcrumb */}
            <div className="flex items-center gap-2 mb-7">
              <button
                onClick={() => setView("list")}
                className="flex items-center gap-0.5 text-nav-bg font-bold text-sm hover:opacity-75 transition-opacity"
              >
                <span className="material-symbols-outlined text-[17px]">chevron_left</span>
                TÀI KHOẢN
              </button>
              <span className="text-gray-400 font-medium text-sm">/</span>
              <span className="text-gray-500 font-bold text-sm tracking-wide">
                {view === "add" ? "THÊM MỚI" : "SỬA"}
              </span>
            </div>

            {/* Fields */}
            <div className="flex flex-col gap-6">

              {/* Chọn ngân hàng */}
              <div className="flex flex-col gap-1">
                <label className="text-gray-500 text-sm">
                  Chọn ngân hàng<span className="text-red-500">*</span>
                </label>
                <div className="relative">
                  <select
                    value={form.bank_id}
                    onChange={(e) => { setForm({ ...form, bank_id: e.target.value }); setErrors((p) => ({ ...p, bank_id: "" })); }}
                    className={`w-full border-b outline-none py-1.5 text-sm text-gray-800 bg-transparent appearance-none cursor-pointer transition-colors ${errors.bank_id ? "border-red-400" : "border-gray-300 focus:border-nav-bg"}`}
                  >
                    <option value=""></option>
                    {BANKS.map((b) => (
                      <option key={b.id} value={b.id}>{b.name}</option>
                    ))}
                  </select>
                  <span className="material-symbols-outlined absolute right-0 top-1/2 -translate-y-1/2 text-[18px] text-gray-400 pointer-events-none">
                    expand_more
                  </span>
                </div>
                {errors.bank_id && <p className="text-red-500 text-xs mt-0.5">{errors.bank_id}</p>}
              </div>

              {/* Chủ tài khoản */}
              <div className="flex flex-col gap-1">
                <label className="text-gray-500 text-sm">
                  Chủ tài khoản<span className="text-red-500">*</span>
                </label>
                <input
                  type="text"
                  value={form.owner}
                  onChange={(e) => { setForm({ ...form, owner: e.target.value }); setErrors((p) => ({ ...p, owner: "" })); }}
                  className={`border-b outline-none py-1.5 text-sm text-gray-800 bg-transparent transition-colors ${errors.owner ? "border-red-400 focus:border-red-500" : "border-gray-300 focus:border-nav-bg"}`}
                />
                {errors.owner && <p className="text-red-500 text-xs mt-0.5">{errors.owner}</p>}
              </div>

              {/* Số tài khoản */}
              <div className="flex flex-col gap-1">
                <label className="text-gray-500 text-sm">
                  Số tài khoản<span className="text-red-500">*</span>
                </label>
                <input
                  type="text"
                  value={form.account_number}
                  onChange={(e) => { setForm({ ...form, account_number: e.target.value }); setErrors((p) => ({ ...p, account_number: "" })); }}
                  className={`border-b outline-none py-1.5 text-sm text-gray-800 bg-transparent transition-colors ${errors.account_number ? "border-red-400 focus:border-red-500" : "border-gray-300 focus:border-nav-bg"}`}
                />
                {errors.account_number && <p className="text-red-500 text-xs mt-0.5">{errors.account_number}</p>}
              </div>

              {/* Ghi chú */}
              <div className="flex flex-col gap-1">
                <label className="text-gray-500 text-sm">Ghi chú</label>
                <input
                  type="text"
                  value={form.note}
                  onChange={(e) => setForm({ ...form, note: e.target.value })}
                  className="border-b border-gray-300 focus:border-nav-bg outline-none py-1.5 text-sm text-gray-800 bg-transparent transition-colors"
                />
              </div>
            </div>

            {/* Submit */}
            <button
              onClick={handleSubmit}
              disabled={submitting}
              className="w-full mt-7 bg-nav-bg text-white py-3 rounded-full font-semibold text-sm hover:opacity-90 transition-opacity disabled:opacity-60"
            >
              {submitting ? "Đang xử lý..." : view === "add" ? "Thêm mới" : "Cập nhật"}
            </button>
          </div>
        </main>
      </div>
    );
  }

  // ─── LIST VIEW ─────────────────────────────────────────────────────────────
  return (
    <div className="min-h-screen bg-main-bg flex flex-col">
      <Header activePage="tai-khoan-ngan-hang" />

      <main className="flex-1 w-full max-w-300 mx-auto px-4 py-6">

        {/* Page title */}
        <button
          onClick={() => navigate(-1)}
          className="flex items-center gap-0.5 text-nav-bg font-bold text-sm mb-5 hover:opacity-75 transition-opacity"
        >
          <span className="material-symbols-outlined text-[18px]">chevron_left</span>
          NGÂN HÀNG
        </button>

        {/* Table card */}
        <div className="bg-white rounded-xl shadow-sm border border-gray-100 overflow-hidden">

          {/* Search */}
          <div className="flex items-center gap-2 px-4 py-3 border-b border-gray-100">
            <span className="material-symbols-outlined text-[20px] text-gray-400">search</span>
            <input
              type="text"
              placeholder={`Tìm trong ${accounts.length} tài khoản...`}
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="flex-1 outline-none text-sm text-gray-700 placeholder-gray-400"
            />
            {search && (
              <button onClick={() => setSearch("")} className="text-gray-400 hover:text-gray-600">
                <span className="material-symbols-outlined text-[18px]">close</span>
              </button>
            )}
          </div>

          {/* Column headers */}
          <div className="grid grid-cols-[2fr_2fr_100px] px-4 py-2.5 bg-gray-50 border-b border-gray-100">
            <span className="text-xs font-bold text-gray-500 uppercase tracking-wide">Ngân hàng</span>
            <span className="text-xs font-bold text-gray-500 uppercase tracking-wide">Thông tin tài khoản</span>
            <span className="text-xs font-bold text-gray-500 uppercase tracking-wide text-right">Tác vụ</span>
          </div>

          {/* Rows */}
          {filtered.length === 0 ? (
            <div className="py-14 text-center text-gray-400 text-sm">
              <span className="material-symbols-outlined text-4xl block mb-2 text-gray-300">account_balance</span>
              {search ? "Không tìm thấy tài khoản" : "Chưa có tài khoản ngân hàng nào"}
            </div>
          ) : (
            filtered.map((account, idx) => {
              const bank = getBankInfo(account.bank_id);
              return (
                <div key={account.id}>
                  <div className="grid grid-cols-[2fr_2fr_100px] px-4 py-4 hover:bg-soft-blue-tint transition-colors items-center">

                    {/* Ngân hàng */}
                    <div className="flex items-center gap-3">
                      <div
                        className="w-16 h-10 rounded-lg flex items-center justify-center shrink-0 border border-gray-100"
                        style={{ background: bank.bg }}
                      >
                        <span
                          className="text-xs font-extrabold tracking-tight"
                          style={{ color: bank.color }}
                        >
                          {bank.name}
                        </span>
                      </div>
                      <div>
                        <div className="text-sm font-semibold text-gray-800">{bank.name}</div>
                        <div className="text-[11px] text-gray-400 mt-0.5 leading-tight">{bank.full}</div>
                      </div>
                    </div>

                    {/* Thông tin tài khoản */}
                    <div>
                      <div className="text-sm font-bold text-gray-800">{account.owner}</div>
                      <div className="text-[12px] text-gray-500 mt-0.5">{account.account_number}</div>
                      {account.note && (
                        <div className="text-[11px] text-gray-400 mt-0.5">{account.note}</div>
                      )}
                    </div>

                    {/* Tác vụ */}
                    <div className="flex items-center justify-end gap-2">
                      <button
                        onClick={() => openEdit(account)}
                        className="flex items-center gap-1 text-accent-blue text-[12px] font-semibold hover:opacity-75 transition-opacity"
                      >
                        <span className="material-symbols-outlined text-[14px]">edit</span>
                        Sửa
                      </button>
                      <button
                        onClick={() => setDeleteId(account.id)}
                        className="flex items-center gap-1 text-red-500 text-[12px] font-semibold hover:opacity-75 transition-opacity"
                      >
                        <span className="material-symbols-outlined text-[14px]">delete</span>
                        Xóa
                      </button>
                    </div>
                  </div>
                  {idx < filtered.length - 1 && (
                    <div className="border-t border-gray-100 mx-4" />
                  )}
                </div>
              );
            })
          )}
        </div>
      </main>

      {/* Floating action button */}
      <button
        onClick={openAdd}
        className="fixed bottom-6 right-6 w-13 h-13 rounded-full bg-nav-bg text-white shadow-lg flex items-center justify-center hover:opacity-90 transition-all hover:scale-105 z-40"
        title="Thêm tài khoản ngân hàng"
      >
        <span className="material-symbols-outlined text-[26px]">add</span>
      </button>

      {/* Delete confirm dialog */}
      {deleteId && (
        <div className="fixed inset-0 bg-black/40 z-50 flex items-center justify-center px-4">
          <div className="bg-white rounded-2xl shadow-2xl w-full max-w-sm p-6">
            <div className="flex items-center justify-center w-12 h-12 rounded-full bg-red-100 mx-auto mb-4">
              <span className="material-symbols-outlined text-red-500 text-[24px]">delete</span>
            </div>
            <h3 className="text-center font-bold text-gray-800 mb-2">Xóa tài khoản ngân hàng?</h3>
            <p className="text-center text-sm text-gray-500 mb-6">
              Hành động này không thể hoàn tác. Bạn có chắc muốn xóa không?
            </p>
            <div className="flex gap-3">
              <button
                onClick={() => setDeleteId(null)}
                className="flex-1 py-2.5 rounded-full border border-gray-300 text-gray-600 text-sm font-semibold hover:bg-gray-50 transition-colors"
              >
                Hủy
              </button>
              <button
                onClick={() => handleDelete(deleteId)}
                className="flex-1 py-2.5 rounded-full bg-red-500 text-white text-sm font-semibold hover:bg-red-600 transition-colors"
              >
                Xóa
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
