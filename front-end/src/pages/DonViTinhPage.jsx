import { useNavigate } from "react-router-dom";
import { useEffect, useState } from "react";
import { useAuth } from "../context/AuthContext";
import Header from "../components/Header";
import axiosInstance from "../api/axiosInstance";

export default function DonViTinhPage() {
  const navigate = useNavigate();
  const { user } = useAuth();

  const [view, setView] = useState("list"); // "list" | "add" | "edit"
  const [units, setUnits] = useState([]);
  const [search, setSearch] = useState("");
  const [loading, setLoading] = useState(false);
  const [selected, setSelected] = useState(null);
  const [form, setForm] = useState({ name: "", note: "" });
  const [error, setError] = useState("");
  const [submitting, setSubmitting] = useState(false);
  const [deleteId, setDeleteId] = useState(null);

  useEffect(() => {
    if (!user) navigate("/login");
  }, [user, navigate]);

  useEffect(() => {
    if (view === "list") fetchUnits();
  }, [view]);

  const fetchUnits = async () => {
    setLoading(true);
    try {
      const res = await axiosInstance.get("/units");
      setUnits(res.data);
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  const filtered = units.filter((u) =>
    u.name.toLowerCase().includes(search.toLowerCase()) ||
    (u.note && u.note.toLowerCase().includes(search.toLowerCase()))
  );

  const openAdd = () => {
    setForm({ name: "", note: "" });
    setError("");
    setView("add");
  };

  const openEdit = (unit) => {
    setSelected(unit);
    setForm({ name: unit.name, note: unit.note || "" });
    setError("");
    setView("edit");
  };

  const handleDelete = async (id) => {
    try {
      await axiosInstance.delete(`/units/${id}`);
      setUnits((prev) => prev.filter((u) => u._id !== id));
      setDeleteId(null);
    } catch (err) {
      alert(err.response?.data?.message || "Xóa thất bại");
      setDeleteId(null);
    }
  };

  const handleSubmit = async () => {
    if (!form.name.trim()) {
      setError("Vui lòng nhập tên đơn vị tính");
      return;
    }
    setSubmitting(true);
    setError("");
    try {
      if (view === "add") {
        const res = await axiosInstance.post("/units", form);
        setUnits((prev) => [...prev, res.data.unit]);
      } else {
        const res = await axiosInstance.put(`/units/${selected._id}`, form);
        setUnits((prev) =>
          prev.map((u) => (u._id === selected._id ? res.data.unit : u))
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
        <Header activePage="don-vi-tinh" />

        <main className="flex-1 flex items-start justify-center px-4 py-10">
          <div className="bg-white rounded-2xl shadow-md w-full max-w-115 px-8 py-8">

            {/* Breadcrumb */}
            <div className="flex items-center gap-2 mb-7">
              <button
                onClick={() => setView("list")}
                className="flex items-center gap-0.5 text-nav-bg font-bold text-sm hover:opacity-75 transition-opacity"
              >
                <span className="material-symbols-outlined text-[17px]">chevron_left</span>
                ĐƠN VỊ TÍNH
              </button>
              <span className="text-gray-400 font-medium text-sm">/</span>
              <span className="text-gray-500 font-bold text-sm tracking-wide">
                {view === "add" ? "THÊM MỚI" : "SỬA"}
              </span>
            </div>

            {/* Fields */}
            <div className="flex flex-col gap-6">
              {/* Đơn vị tính */}
              <div className="flex flex-col gap-1">
                <label className="text-nav-bg text-sm font-medium">
                  Đơn vị tính<span className="text-red-500">*</span>
                </label>
                <input
                  type="text"
                  value={form.name}
                  onChange={(e) => setForm({ ...form, name: e.target.value })}
                  className="border-b border-gray-300 focus:border-nav-bg outline-none py-1.5 text-sm text-gray-800 bg-transparent transition-colors"
                  autoFocus
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
            {error && <p className="text-red-500 text-xs mt-3">{error}</p>}

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
      <Header activePage="don-vi-tinh" />

      <main className="flex-1 w-full max-w-300 mx-auto px-4 py-6">

        {/* Page title */}
        <button
          onClick={() => navigate(-1)}
          className="flex items-center gap-0.5 text-nav-bg font-bold text-sm mb-5 hover:opacity-75 transition-opacity"
        >
          <span className="material-symbols-outlined text-[18px]">chevron_left</span>
          ĐƠN VỊ TÍNH
        </button>

        {/* Table card */}
        <div className="bg-white rounded-xl shadow-sm border border-gray-100 overflow-hidden">

          {/* Search */}
          <div className="flex items-center gap-2 px-4 py-3 border-b border-gray-100">
            <span className="material-symbols-outlined text-[20px] text-gray-400">search</span>
            <input
              type="text"
              placeholder={`Tìm trong ${units.length} đơn vị...`}
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
          <div className="grid grid-cols-[1fr_100px] px-4 py-2.5 bg-gray-50 border-b border-gray-100">
            <span className="text-xs font-bold text-gray-500 uppercase tracking-wide">Tên đơn vị</span>
            <span className="text-xs font-bold text-gray-500 uppercase tracking-wide text-right">Tác vụ</span>
          </div>

          {/* Rows */}
          {loading ? (
            <div className="py-14 text-center text-gray-400 text-sm">
              <span className="material-symbols-outlined text-4xl block mb-2 animate-spin text-nav-bg">progress_activity</span>
              Đang tải...
            </div>
          ) : filtered.length === 0 ? (
            <div className="py-14 text-center text-gray-400 text-sm">
              <span className="material-symbols-outlined text-4xl block mb-2 text-gray-300">straighten</span>
              {search ? "Không tìm thấy đơn vị tính" : "Chưa có đơn vị tính nào"}
            </div>
          ) : (
            filtered.map((unit, idx) => (
              <div key={unit._id}>
                <div className="grid grid-cols-[1fr_100px] px-4 py-4 hover:bg-soft-blue-tint transition-colors items-center">
                  <div>
                    <div className="text-sm font-semibold text-gray-800">{unit.name}</div>
                    {unit.note && (
                      <div className="text-[11px] text-gray-400 mt-0.5">{unit.note}</div>
                    )}
                  </div>
                  <div className="flex items-center justify-end gap-2">
                    <button
                      onClick={() => openEdit(unit)}
                      className="flex items-center gap-1 text-accent-blue text-[12px] font-semibold hover:opacity-75 transition-opacity"
                    >
                      <span className="material-symbols-outlined text-[14px]">edit</span>
                      Sửa
                    </button>
                    <button
                      onClick={() => setDeleteId(unit._id)}
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
        title="Thêm đơn vị tính"
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
            <h3 className="text-center font-bold text-gray-800 mb-2">Xóa đơn vị tính?</h3>
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
