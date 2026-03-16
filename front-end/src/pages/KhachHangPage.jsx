import { useNavigate } from "react-router-dom";
import { useEffect, useState } from "react";
import { useAuth } from "../context/AuthContext";
import Header from "../components/Header";
import axiosInstance from "../api/axiosInstance";

export default function KhachHangPage() {
  const navigate = useNavigate();
  const { user } = useAuth();

  const [view, setView] = useState("list"); // "list" | "add" | "edit"
  const [customers, setCustomers] = useState([]);
  const [search, setSearch] = useState("");
  const [loading, setLoading] = useState(false);
  const [selectedCustomer, setSelectedCustomer] = useState(null);
  const [form, setForm] = useState({ full_name: "", phone: "", address: "", note: "" });
  const [error, setError] = useState("");
  const [submitting, setSubmitting] = useState(false);
  const [deleteId, setDeleteId] = useState(null);

  useEffect(() => {
    if (!user) navigate("/login");
  }, [user, navigate]);

  useEffect(() => {
    if (view === "list") fetchCustomers();
  }, [view]);

  const fetchCustomers = async () => {
    setLoading(true);
    try {
      const res = await axiosInstance.get("/customers");
      setCustomers(res.data);
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  const filtered = customers.filter(
    (c) =>
      c.full_name.toLowerCase().includes(search.toLowerCase()) ||
      (c.phone && c.phone.includes(search)) ||
      (c.address && c.address.toLowerCase().includes(search.toLowerCase()))
  );

  const totalDebt = customers.reduce((sum, c) => sum + (c.stats?.debt || 0), 0);

  const openAdd = () => {
    setForm({ full_name: "", phone: "", address: "", note: "" });
    setError("");
    setView("add");
  };

  const openEdit = (customer) => {
    setSelectedCustomer(customer);
    setForm({
      full_name: customer.full_name,
      phone: customer.phone || "",
      address: customer.address || "",
      note: customer.note || "",
    });
    setError("");
    setView("edit");
  };

  const handleDelete = async (id) => {
    try {
      await axiosInstance.delete(`/customers/${id}`);
      setCustomers((prev) => prev.filter((c) => c._id !== id));
      setDeleteId(null);
    } catch (err) {
      alert(err.response?.data?.message || "Xóa thất bại");
      setDeleteId(null);
    }
  };

  const handleSubmit = async () => {
    if (!form.full_name.trim()) {
      setError("Vui lòng nhập tên khách hàng");
      return;
    }
    setSubmitting(true);
    setError("");
    try {
      if (view === "add") {
        const res = await axiosInstance.post("/customers", form);
        setCustomers((prev) => [...prev, res.data.customer]);
      } else {
        const res = await axiosInstance.put(`/customers/${selectedCustomer._id}`, form);
        setCustomers((prev) =>
          prev.map((c) => (c._id === selectedCustomer._id ? res.data.customer : c))
        );
      }
      setView("list");
    } catch (err) {
      setError(err.response?.data?.message || "Có lỗi xảy ra, thử lại sau");
    } finally {
      setSubmitting(false);
    }
  };

  // ─── FORM VIEW (Add / Edit) ────────────────────────────────────────────────
  if (view === "add" || view === "edit") {
    return (
      <div
        className="min-h-screen flex flex-col"
        style={{ background: "linear-gradient(135deg, #ede8ff 0%, #e0e9ff 50%, #e8f4ff 100%)" }}
      >
        <Header activePage="khach-hang" />

        <main className="flex-1 flex items-start justify-center px-4 py-10">
          <div className="bg-white rounded-2xl shadow-md w-full max-w-115 px-8 py-8">

            {/* Breadcrumb */}
            <div className="flex items-center gap-2 mb-7">
              <button
                onClick={() => setView("list")}
                className="flex items-center gap-0.5 text-nav-bg font-bold text-sm hover:opacity-75 transition-opacity"
              >
                <span className="material-symbols-outlined text-[17px]">chevron_left</span>
                KHÁCH HÀNG
              </button>
              <span className="text-gray-400 font-medium text-sm">/</span>
              <span className="text-gray-500 font-bold text-sm tracking-wide">
                {view === "add" ? "THÊM MỚI" : "SỬA"}
              </span>
            </div>

            {/* Fields */}
            <div className="flex flex-col gap-6">
              {/* Tên khách hàng */}
              <div className="flex flex-col gap-1">
                <label className="text-nav-bg text-sm font-medium">
                  Tên khách hàng<span className="text-red-500">*</span>
                </label>
                <input
                  type="text"
                  value={form.full_name}
                  onChange={(e) => setForm({ ...form, full_name: e.target.value })}
                  className="border-b border-gray-300 focus:border-nav-bg outline-none py-1.5 text-sm text-gray-800 bg-transparent transition-colors"
                  placeholder=""
                  autoFocus
                />
              </div>

              {/* Điện thoại */}
              <div className="flex flex-col gap-1">
                <label className="text-gray-500 text-sm">Điện thoại</label>
                <input
                  type="text"
                  value={form.phone}
                  onChange={(e) => setForm({ ...form, phone: e.target.value })}
                  className="border-b border-gray-300 focus:border-nav-bg outline-none py-1.5 text-sm text-gray-800 bg-transparent transition-colors"
                />
              </div>

              {/* Địa chỉ */}
              <div className="flex flex-col gap-1">
                <label className="text-gray-500 text-sm">Địa chỉ</label>
                <input
                  type="text"
                  value={form.address}
                  onChange={(e) => setForm({ ...form, address: e.target.value })}
                  className="border-b border-gray-300 focus:border-nav-bg outline-none py-1.5 text-sm text-gray-800 bg-transparent transition-colors"
                />
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

            {/* Error */}
            {error && (
              <p className="text-red-500 text-xs mt-3">{error}</p>
            )}

            {/* Submit */}
            <button
              onClick={handleSubmit}
              disabled={submitting}
              className="btn-magnetic btn-shimmer w-full mt-7 text-white py-3 rounded-full font-semibold text-sm disabled:opacity-60"
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
    <div className="min-h-screen bg-mesh flex flex-col">
      <Header activePage="khach-hang" />

      <main className="flex-1 w-full max-w-300 mx-auto px-4 py-6 page-enter">

        {/* Page title */}
        <button
          onClick={() => navigate(-1)}
          className="flex items-center gap-0.5 text-nav-bg font-bold text-sm mb-5 hover:opacity-75 transition-opacity"
        >
          <span className="material-symbols-outlined text-[18px]">chevron_left</span>
          KHÁCH HÀNG
        </button>

        {/* Stat pills */}
        <div className="flex items-center gap-3 mb-5 flex-wrap">
          <div className="flex items-center gap-3 bg-nav-bg text-white px-5 py-3 rounded-full shadow-md">
            <span className="material-symbols-outlined text-[18px]">check_circle</span>
            <div>
              <div className="font-bold text-sm leading-tight">Tất cả</div>
              <div className="text-xs text-white/80 leading-tight">Tất cả khách hàng</div>
            </div>
          </div>
          <div className="flex items-center gap-3 bg-white border border-gray-200 px-5 py-3 rounded-full shadow-sm">
            <div>
              <div className="font-bold text-sm leading-tight text-gray-700">
                Công nợ khách: <span className="text-nav-bg">{totalDebt.toLocaleString('vi-VN')}</span>
              </div>
              <div className="text-xs text-gray-400 leading-tight">Tổng tiền công nợ của khách</div>
            </div>
          </div>
        </div>

        {/* Table card */}
        <div className="bg-white rounded-xl shadow-sm border border-gray-100 overflow-hidden">

          {/* Search */}
          <div className="flex items-center gap-2 px-4 py-3 border-b border-gray-100">
            <span className="material-symbols-outlined text-[20px] text-gray-400">search</span>
            <input
              type="text"
              placeholder={`Tìm trong ${customers.length} khách...`}
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="flex-1 outline-none text-sm text-gray-700 placeholder-gray-400"
            />
            {search && (
              <button
                onClick={() => setSearch("")}
                className="text-gray-400 hover:text-gray-600"
              >
                <span className="material-symbols-outlined text-[18px]">close</span>
              </button>
            )}
          </div>

          {/* Column headers */}
          <div className="hidden md:grid grid-cols-[2fr_1.6fr_1.3fr_1fr_1fr_90px] px-4 py-2.5 bg-gray-50 border-b border-gray-100">
            <span className="text-xs font-bold text-gray-500 uppercase tracking-wide">Tên khách</span>
            <span className="text-xs font-bold text-gray-500 uppercase tracking-wide">Ghé gần đây</span>
            <span className="text-xs font-bold text-gray-500 uppercase tracking-wide">Đã chi tiêu</span>
            <span className="text-xs font-bold text-gray-500 uppercase tracking-wide">Công nợ</span>
            <span className="text-xs font-bold text-gray-500 uppercase tracking-wide">Ghi chú</span>
            <span className="text-xs font-bold text-gray-500 uppercase tracking-wide text-right">Tác vụ</span>
          </div>

          {/* Rows */}
          {loading ? (
            <div className="py-14 flex flex-col items-center gap-3 text-gray-400 text-sm">
              <div className="w-9 h-9 border-[3px] border-nav-bg border-t-transparent rounded-full animate-spin" />
              Đang tải dữ liệu...
            </div>
          ) : filtered.length === 0 ? (
            <div className="py-14 text-center text-gray-400 text-sm">
              <span className="material-symbols-outlined text-4xl block mb-2 text-gray-300">group</span>
              {search ? "Không tìm thấy khách hàng" : "Chưa có khách hàng nào"}
            </div>
          ) : (
            filtered.map((c, idx) => (
              <div key={c._id}>
                <div className="grid grid-cols-1 md:grid-cols-[2fr_1.6fr_1.3fr_1fr_1fr_90px] px-4 py-3.5 table-row-hover items-start gap-y-1">

                  {/* Tên khách */}
                  <div>
                    <div className="text-[13px] font-bold text-nav-bg leading-tight">{c.full_name}</div>
                    {c.phone && (
                      <div className="flex items-center gap-1 text-[11px] text-gray-500 mt-0.5">
                        <span className="material-symbols-outlined text-[12px]">phone</span>
                        {c.phone}
                      </div>
                    )}
                    {c.address && (
                      <div className="flex items-center gap-1 text-[11px] text-gray-400 mt-0.5">
                        <span className="material-symbols-outlined text-[12px]">location_on</span>
                        {c.address}
                      </div>
                    )}
                  </div>

                  {/* Ghé gần đây */}
                  <div className="text-[12px] text-gray-500 md:pt-0.5">
                    <span>{c.stats?.lastVisit ? new Date(c.stats.lastVisit).toLocaleDateString('vi-VN') : "-"}</span>
                  </div>

                  {/* Đã chi tiêu */}
                  <div className="text-[12px] text-gray-500 md:pt-0.5 font-medium text-accent-blue">
                    <span>{c.stats?.totalSpent ? c.stats.totalSpent.toLocaleString('vi-VN') : "-"}</span>
                  </div>

                  {/* Công nợ */}
                  <div className="text-[12px] md:pt-0.5 font-bold text-accent-orange">
                    <span>{c.stats?.debt ? c.stats.debt.toLocaleString('vi-VN') : "-"}</span>
                  </div>

                  {/* Ghi chú */}
                  <div className="text-[12px] text-gray-500 md:pt-0.5 truncate max-w-30">
                    {c.note || <span>-</span>}
                  </div>

                  {/* Tác vụ */}
                  <div className="flex items-center justify-end gap-2 md:pt-0.5">
                    <button
                      onClick={() => openEdit(c)}
                      className="flex items-center gap-1 text-accent-blue text-[12px] font-semibold hover:opacity-75 transition-opacity"
                    >
                      <span className="material-symbols-outlined text-[14px]">edit</span>
                      Sửa
                    </button>
                    <button
                      onClick={() => setDeleteId(c._id)}
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
            ))
          )}
        </div>
      </main>

      {/* Floating action button */}
      <button
        onClick={openAdd}
        className="fixed bottom-6 right-6 w-13 h-13 rounded-full bg-nav-bg text-white shadow-lg flex items-center justify-center hover:opacity-90 transition-all hover:scale-105 z-40"
        title="Thêm khách hàng"
      >
        <span className="material-symbols-outlined text-[26px]">add</span>
      </button>

      {/* Delete confirm dialog */}
      {deleteId && (
        <div className="fixed inset-0 bg-black/50 backdrop-blur-sm z-50 flex items-center justify-center px-4">
          <div className="bg-white animate-scale-in rounded-2xl shadow-2xl w-full max-w-sm p-6">
            <div className="flex items-center justify-center w-12 h-12 rounded-full bg-red-100 mx-auto mb-4">
              <span className="material-symbols-outlined text-red-500 text-[24px]">delete</span>
            </div>
            <h3 className="text-center font-bold text-gray-800 mb-2">Xóa khách hàng?</h3>
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




