import { useNavigate } from "react-router-dom";
import { useEffect, useState } from "react";
import { useAuth } from "../context/AuthContext";
import Header from "../components/Header";

const stores = [
  {
    id: "CH01",
    name: "TVU_Wash",
    phone: "0365530100",
    address: "140 Nguyễn Thiện Thành, Hoà Thuận, Vĩnh Long",
  },
];

export default function CuaHangPage() {
  const navigate = useNavigate();
  const { user } = useAuth();

  useEffect(() => {
    if (!user) navigate("/login");
  }, [user, navigate]);

  const [search, setSearch] = useState("");
  const [showModal, setShowModal] = useState(false);
  const [editItem, setEditItem] = useState(null);
  const [form, setForm] = useState({ id: "", name: "", phone: "", address: "" });

  const filtered = stores.filter(
    (s) =>
      s.name.toLowerCase().includes(search.toLowerCase()) ||
      s.phone.includes(search) ||
      s.address.toLowerCase().includes(search.toLowerCase())
  );

  const openEdit = (store) => {
    setEditItem(store);
    setForm({ ...store });
    setShowModal(true);
  };

  return (
    <div className="min-h-screen bg-main-bg flex flex-col">
      <Header activePage="cua-hang" />

      <main className="flex-1 max-w-[900px] mx-auto w-full px-4 py-6">
        {/* Page title */}
        <button
          onClick={() => navigate(-1)}
          className="flex items-center gap-1 text-nav-bg font-bold text-sm mb-5 hover:opacity-75 transition-opacity"
        >
          <span className="material-symbols-outlined text-[18px]">chevron_left</span>
          CỬA HÀNG
        </button>

        {/* Card */}
        <div className="bg-white rounded-xl shadow-sm border border-gray-100 overflow-hidden">
          {/* Search */}
          <div className="flex items-center gap-2 px-4 py-3 border-b border-gray-100">
            <span className="material-symbols-outlined text-[20px] text-gray-400">search</span>
            <input
              type="text"
              placeholder="Tìm nhanh..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="flex-1 outline-none text-sm text-gray-700 placeholder-gray-400"
            />
          </div>

          {/* Column header */}
          <div className="px-4 py-2.5 bg-gray-50 border-b border-gray-100">
            <span className="text-xs font-bold text-gray-600">Cửa hàng</span>
          </div>

          {/* List */}
          {filtered.length === 0 ? (
            <div className="py-14 text-center text-gray-400 text-sm">
              <span className="material-symbols-outlined text-4xl block mb-2 text-gray-300">storefront</span>
              Không tìm thấy cửa hàng
            </div>
          ) : (
            filtered.map((store, idx) => (
              <div key={store.id}>
                <div
                  className="px-4 py-3.5 hover:bg-soft-blue-tint transition-colors cursor-pointer group"
                  onClick={() => openEdit(store)}
                >
            <div className="flex items-center justify-between">
                    <div className="flex items-center gap-2.5 mb-1">
                      <span className="text-[11px] font-bold text-white bg-nav-bg px-2 py-0.5 rounded-md">
                        {store.id}
                      </span>
                      <span className="text-sm font-bold text-gray-800">{store.name}</span>
                    </div>
                    <span className="material-symbols-outlined text-[18px] text-gray-300 group-hover:text-nav-bg transition-colors">
                      edit
                    </span>
                  </div>
                  <div className="flex items-center gap-1.5 text-[12px] text-gray-500 mt-1">
                    <span className="material-symbols-outlined text-[14px]">phone</span>
                    {store.phone}
                  </div>
                  <div className="flex items-center gap-1.5 text-[12px] text-gray-500 mt-0.5">
                    <span className="material-symbols-outlined text-[14px]">location_on</span>
                    {store.address}
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

      {/* Modal */}
      {showModal && (
        <div className="fixed inset-0 bg-black/40 z-50 flex items-center justify-center px-4">
          <div className="bg-white rounded-2xl shadow-2xl w-full max-w-md">
            {/* Modal header */}
            <div className="flex items-center justify-between px-5 py-4 border-b border-gray-100">
              <h2 className="text-sm font-bold text-nav-bg uppercase tracking-wide">
                Chỉnh sửa cửa hàng
              </h2>
              <button
                onClick={() => setShowModal(false)}
                className="w-7 h-7 flex items-center justify-center rounded-full hover:bg-gray-100 transition-colors"
              >
                <span className="material-symbols-outlined text-[18px] text-gray-400">close</span>
              </button>
            </div>

            {/* Modal body */}
            <div className="px-5 py-4 space-y-3">
              <div>
                <label className="text-[11px] font-bold text-gray-500 uppercase mb-1 block">Mã cửa hàng</label>
                <input
                  type="text"
                  value={form.id}
                  onChange={(e) => setForm({ ...form, id: e.target.value })}
                  placeholder="VD: CH01"
                  className="w-full border border-gray-200 rounded-lg px-3 py-2 text-sm outline-none focus:border-nav-bg transition-colors"
                />
              </div>
              <div>
                <label className="text-[11px] font-bold text-gray-500 uppercase mb-1 block">Tên cửa hàng</label>
                <input
                  type="text"
                  value={form.name}
                  onChange={(e) => setForm({ ...form, name: e.target.value })}
                  placeholder="VD: TVU_Wash"
                  className="w-full border border-gray-200 rounded-lg px-3 py-2 text-sm outline-none focus:border-nav-bg transition-colors"
                />
              </div>
              <div>
                <label className="text-[11px] font-bold text-gray-500 uppercase mb-1 block">Số điện thoại</label>
                <input
                  type="text"
                  value={form.phone}
                  onChange={(e) => setForm({ ...form, phone: e.target.value })}
                  placeholder="VD: 0365530100"
                  className="w-full border border-gray-200 rounded-lg px-3 py-2 text-sm outline-none focus:border-nav-bg transition-colors"
                />
              </div>
              <div>
                <label className="text-[11px] font-bold text-gray-500 uppercase mb-1 block">Địa chỉ</label>
                <textarea
                  rows={2}
                  value={form.address}
                  onChange={(e) => setForm({ ...form, address: e.target.value })}
                  placeholder="VD: 140 Nguyễn Thiện Thành..."
                  className="w-full border border-gray-200 rounded-lg px-3 py-2 text-sm outline-none focus:border-nav-bg transition-colors resize-none"
                />
              </div>
            </div>

            {/* Modal footer */}
            <div className="flex items-center justify-end gap-2 px-5 py-4 border-t border-gray-100">
              <button
                onClick={() => setShowModal(false)}
                className="px-4 py-2 text-xs font-bold text-gray-500 hover:bg-gray-100 rounded-lg transition-colors"
              >
                Hủy
              </button>
              <button
                onClick={() => setShowModal(false)}
                className="px-5 py-2 text-xs font-bold text-white bg-nav-bg rounded-lg hover:opacity-90 transition-opacity"
              >
                Lưu thay đổi
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
