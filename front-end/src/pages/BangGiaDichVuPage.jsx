import { useNavigate } from "react-router-dom";
import { useEffect, useState } from "react";
import { useAuth } from "../context/AuthContext";
import Header from "../components/Header";
import axiosInstance from "../api/axiosInstance";
import toast from "react-hot-toast";

function formatPrice(value) {
  if (!value && value !== 0) return "";
  return Number(value).toLocaleString("vi-VN");
}

export default function BangGiaDichVuPage() {
  const navigate = useNavigate();
  const { user } = useAuth();

  const [view, setView] = useState("list"); // "list" | "add" | "edit"
  const [services, setServices] = useState([]);
  const [units, setUnits] = useState([]);
  const [search, setSearch] = useState("");
  const [loading, setLoading] = useState(false);
  const [selected, setSelected] = useState(null);
  const [form, setForm] = useState({ name: "", unit_id: "", price: "", note: "" });
  const [errors, setErrors] = useState({});
  const [submitting, setSubmitting] = useState(false);
  const [deleteId, setDeleteId] = useState(null);

  useEffect(() => {
    if (!user) navigate("/login");
  }, [user, navigate]);

  useEffect(() => {
    if (view === "list") fetchServices();
    if (view === "add" || view === "edit") fetchUnits();
  }, [view]);

  const fetchServices = async () => {
    setLoading(true);
    try {
      const res = await axiosInstance.get("/services");
      setServices(res.data);
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  const fetchUnits = async () => {
    try {
      const res = await axiosInstance.get("/units");
      setUnits(res.data);
    } catch (err) {
      console.error(err);
    }
  };

  const filtered = services.filter((s) =>
    s.name.toLowerCase().includes(search.toLowerCase()) ||
    (s.note && s.note.toLowerCase().includes(search.toLowerCase()))
  );

  const getUnitName = (service) => {
    if (service.unit_id && typeof service.unit_id === "object") return service.unit_id.name;
    const found = units.find((u) => u._id === service.unit_id);
    return found ? found.name : "-";
  };

  const openAdd = () => {
    fetchUnits();
    setForm({ name: "", unit_id: "", price: "", note: "" });
    setErrors({});
    setView("add");
  };

  const openEdit = (service) => {
    fetchUnits();
    setSelected(service);
    setForm({
      name: service.name,
      unit_id: service.unit_id?._id || service.unit_id || "",
      price: service.price ? String(service.price) : "",
      note: service.note || "",
    });
    setErrors({});
    setView("edit");
  };

  const handleDelete = async (id) => {
    try {
      await axiosInstance.delete(`/services/${id}`);
      setServices((prev) => prev.filter((s) => s._id !== id));
      setDeleteId(null);
      toast.success("Xóa dịch vụ thành công!");
    } catch (err) {
      toast.error(err.response?.data?.message || "Xóa thất bại");
      setDeleteId(null);
    }
  };

  const validate = () => {
    const errs = {};
    if (!form.name.trim()) errs.name = "Vui lòng nhập vào tên dịch vụ.";
    if (!form.unit_id) errs.unit_id = "Vui lòng chọn đơn vị tính.";
    return errs;
  };

  const handleSubmit = async () => {
    const errs = validate();
    if (Object.keys(errs).length > 0) {
      setErrors(errs);
      return;
    }
    setSubmitting(true);
    setErrors({});
    try {
      const payload = {
        name: form.name.trim(),
        unit_id: form.unit_id,
        price: form.price ? Number(form.price.replace(/\./g, "").replace(/,/g, "")) : 0,
        note: form.note,
      };
      if (view === "add") {
        const res = await axiosInstance.post("/services", payload);
        setServices((prev) => [...prev, res.data.service]);
      } else {
        const res = await axiosInstance.put(`/services/${selected._id}`, payload);
        setServices((prev) =>
          prev.map((s) => (s._id === selected._id ? res.data.service : s))
        );
      }
      setView("list");
    } catch (err) {
      setErrors({ general: err.response?.data?.message || "Có lỗi xảy ra, thử lại sau" });
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
        <Header activePage="bang-gia-dich-vu" />

        <main className="flex-1 flex items-start justify-center px-4 py-10">
          <div className="bg-white rounded-2xl shadow-md w-full max-w-115 px-8 py-8">

            {/* Breadcrumb */}
            <div className="flex items-center gap-2 mb-7">
              <button
                onClick={() => setView("list")}
                className="flex items-center gap-0.5 text-nav-bg font-bold text-sm hover:opacity-75 transition-opacity"
              >
                <span className="material-symbols-outlined text-[17px]">chevron_left</span>
                BẢNG GIÁ
              </button>
              <span className="text-gray-400 font-medium text-sm">/</span>
              <span className="text-gray-500 font-bold text-sm tracking-wide">
                {view === "add" ? "THÊM MỚI" : "SỬA"}
              </span>
            </div>

            {/* Fields */}
            <div className="flex flex-col gap-6">

              {/* Tên dịch vụ */}
              <div className="flex flex-col gap-1">
                <label className={`text-sm font-medium ${errors.name ? "text-red-500" : "text-nav-bg"}`}>
                  Tên dịch vụ<span className="text-red-500">*</span>
                </label>
                <input
                  type="text"
                  value={form.name}
                  onChange={(e) => { setForm({ ...form, name: e.target.value }); setErrors((p) => ({ ...p, name: "" })); }}
                  className={`border-b outline-none py-1.5 text-sm text-gray-800 bg-transparent transition-colors ${errors.name ? "border-red-400 focus:border-red-500" : "border-gray-300 focus:border-nav-bg"}`}
                  autoFocus
                />
                {errors.name && <p className="text-red-500 text-xs mt-0.5">{errors.name}</p>}
              </div>

              {/* Đơn vị tính */}
              <div className="flex flex-col gap-1">
                <label className={`text-sm font-medium ${errors.unit_id ? "text-red-500" : "text-gray-500"}`}>
                  Đơn vị tính<span className="text-red-500">*</span>
                </label>
                <div className="relative">
                  <select
                    value={form.unit_id}
                    onChange={(e) => { setForm({ ...form, unit_id: e.target.value }); setErrors((p) => ({ ...p, unit_id: "" })); }}
                    className={`w-full border-b outline-none py-1.5 text-sm text-gray-800 bg-transparent appearance-none cursor-pointer transition-colors ${errors.unit_id ? "border-red-400" : "border-gray-300 focus:border-nav-bg"}`}
                  >
                    <option value=""></option>
                    {units.map((u) => (
                      <option key={u._id} value={u._id}>{u.name}</option>
                    ))}
                  </select>
                  <span className="material-symbols-outlined absolute right-0 top-1/2 -translate-y-1/2 text-[18px] text-gray-400 pointer-events-none">
                    expand_more
                  </span>
                </div>
                {errors.unit_id && <p className="text-red-500 text-xs mt-0.5">{errors.unit_id}</p>}
              </div>

              {/* Đơn giá */}
              <div className="flex flex-col gap-1">
                <label className="text-gray-500 text-sm">Đơn giá</label>
                <input
                  type="text"
                  value={form.price}
                  onChange={(e) => {
                    const raw = e.target.value.replace(/[^0-9]/g, "");
                    setForm({ ...form, price: raw ? Number(raw).toLocaleString("vi-VN") : "" });
                  }}
                  className="border-b border-gray-300 focus:border-nav-bg outline-none py-1.5 text-sm text-gray-800 bg-transparent transition-colors"
                  placeholder="0"
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

            {/* General error */}
            {errors.general && <p className="text-red-500 text-xs mt-3">{errors.general}</p>}

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
      <Header activePage="bang-gia-dich-vu" />

      <main className="flex-1 w-full max-w-300 mx-auto px-4 py-6 page-enter">

        {/* Page title */}
        <button
          onClick={() => navigate(-1)}
          className="flex items-center gap-0.5 text-nav-bg font-bold text-sm mb-5 hover:opacity-75 transition-opacity"
        >
          <span className="material-symbols-outlined text-[18px]">chevron_left</span>
          BẢNG GIÁ
        </button>

        {/* Table card */}
        <div className="bg-white rounded-xl shadow-sm border border-gray-100 overflow-hidden">

          {/* Search */}
          <div className="flex items-center gap-2 px-4 py-3 border-b border-gray-100">
            <span className="material-symbols-outlined text-[20px] text-gray-400">search</span>
            <input
              type="text"
              placeholder={`Tìm trong ${services.length} dịch vụ...`}
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
          <div className="grid grid-cols-[2fr_1fr_1fr_100px] px-4 py-2.5 bg-gray-50 border-b border-gray-100">
            <span className="text-xs font-bold text-gray-500 uppercase tracking-wide">Dịch vụ</span>
            <span className="text-xs font-bold text-gray-500 uppercase tracking-wide">Đơn vị tính</span>
            <span className="text-xs font-bold text-gray-500 uppercase tracking-wide">Đơn giá</span>
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
              <span className="material-symbols-outlined text-4xl block mb-2 text-gray-300">sell</span>
              {search ? "Không tìm thấy dịch vụ" : "Chưa có dịch vụ nào"}
            </div>
          ) : (
            filtered.map((service, idx) => (
              <div key={service._id}>
                <div className="grid grid-cols-[2fr_1fr_1fr_100px] px-4 py-4 table-row-hover items-start">
                  <div>
                    <div className="text-sm font-semibold text-gray-800">{service.name}</div>
                    {service.note && (
                      <div className="text-[11px] text-gray-400 mt-0.5">{service.note}</div>
                    )}
                  </div>
                  <div className="text-sm text-gray-600 pt-0.5">{getUnitName(service)}</div>
                  <div className="text-sm font-semibold text-gray-800 pt-0.5">
                    {formatPrice(service.price)}
                  </div>
                  <div className="flex items-center justify-end gap-2 pt-0.5">
                    <button
                      onClick={() => openEdit(service)}
                      className="flex items-center gap-1 text-accent-blue text-[12px] font-semibold hover:opacity-75 transition-opacity"
                    >
                      <span className="material-symbols-outlined text-[14px]">edit</span>
                      Sửa
                    </button>
                    <button
                      onClick={() => setDeleteId(service._id)}
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
        title="Thêm dịch vụ"
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
            <h3 className="text-center font-bold text-gray-800 mb-2">Xóa dịch vụ?</h3>
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




