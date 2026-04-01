import { useState, useEffect, useRef, useCallback } from "react";
import { useNavigate } from "react-router-dom";
import axiosInstance from "../api/axiosInstance";
import Header from "../components/Header";
import { useAuth } from "../context/AuthContext";
import toast from "react-hot-toast";

const PERMISSIONS = [
  { id: "nhan_do", label: "NHẬN ĐỒ", children: [] },
  {
    id: "danh_sach_do",
    label: "DANH SÁCH ĐỒ",
    children: [
      { id: "ds_tao_phieu", label: "Tạo phiếu" },
      { id: "ds_sua_phieu_da_tao", label: "Sửa phiếu đã tạo" },
      { id: "ds_sua_phieu_nv_khac", label: "Sửa phiếu của nhân viên khác" },
      { id: "ds_sua_phieu_da_giao", label: "Sửa phiếu đã giao khách" },
      { id: "ds_xoa_phieu_da_tao", label: "Xóa phiếu đã tạo" },
      { id: "ds_xoa_phieu_nv_khac", label: "Xóa phiếu của nhân viên khác" },
      { id: "ds_xoa_phieu_da_giao", label: "Xóa phiếu đã giao khách" },
      { id: "ds_xem_phieu_nv_khac", label: "Xem phiếu của nhân viên khác" },
      { id: "ds_xuat_ds", label: "Xuất danh sách" },
      { id: "ds_in_phieu", label: "In phiếu" },
      { id: "ds_sua_tt_thanh_toan", label: "Cho phép sửa trạng thái thanh toán trước" },
    ],
  },
  {
    id: "thu_chi",
    label: "THU - CHI",
    children: [
      { id: "tc_them_moi", label: "Thêm mới" },
      { id: "tc_sua_phieu_da_tao", label: "Sửa phiếu đã tạo" },
      { id: "tc_xoa_phieu_da_tao", label: "Xóa phiếu đã tạo" },
      { id: "tc_sua_phieu_nv_khac", label: "Sửa phiếu của nhân viên khác" },
      { id: "tc_xoa_phieu_nv_khac", label: "Xóa phiếu của nhân viên khác" },
      { id: "tc_xem_phieu_nv_khac", label: "Xem phiếu của nhân viên khác" },
      { id: "tc_in_phieu", label: "In phiếu" },
      { id: "tc_xuat_ds", label: "Xuất danh sách" },
    ],
  },
  {
    id: "so_quy_tien_mat",
    label: "SỐ QUỸ TIỀN MẶT",
    children: [
      { id: "sqtm_xem_kq_nv_khac", label: "Xem kết quả kinh doanh của nhân viên khác" },
      { id: "sqtm_xuat_ds", label: "Xuất danh sách" },
    ],
  },
  { id: "bao_cao_kinh_doanh", label: "BÁO CÁO KINH DOANH", children: [] },
  {
    id: "cua_hang",
    label: "CỬA HÀNG",
    children: [
      { id: "ch_them_moi", label: "Thêm mới" },
      { id: "ch_sua", label: "Sửa" },
      { id: "ch_xoa", label: "Xóa" },
    ],
  },
  {
    id: "khach_hang",
    label: "KHÁCH HÀNG",
    children: [
      { id: "kh_them_moi", label: "Thêm mới" },
      { id: "kh_sua", label: "Sửa" },
      { id: "kh_xoa", label: "Xóa" },
      { id: "kh_nhap_ds", label: "Nhập danh sách" },
      { id: "kh_xuat_ds", label: "Xuất danh sách" },
    ],
  },
  {
    id: "don_vi_tinh",
    label: "ĐƠN VỊ TÍNH",
    children: [
      { id: "dvt_them_moi", label: "Thêm mới" },
      { id: "dvt_sua", label: "Sửa" },
      { id: "dvt_xoa", label: "Xóa" },
    ],
  },
  {
    id: "bang_gia_dich_vu",
    label: "BẢNG GIÁ DỊCH VỤ",
    children: [
      { id: "bgdv_them_moi", label: "Thêm mới" },
      { id: "bgdv_sua", label: "Sửa" },
      { id: "bgdv_xoa", label: "Xóa" },
      { id: "bgdv_nhap_ds", label: "Nhập danh sách" },
      { id: "bgdv_xuat_ds", label: "Xuất danh sách" },
    ],
  },
  {
    id: "tai_khoan_ngan_hang",
    label: "TÀI KHOẢN NGÂN HÀNG",
    children: [
      { id: "tknh_them_moi", label: "Thêm mới" },
      { id: "tknh_sua", label: "Sửa" },
      { id: "tknh_xoa", label: "Xóa" },
    ],
  },
  {
    id: "ke_luu_do",
    label: "KỆ LƯU ĐỒ",
    children: [
      { id: "kld_them_moi", label: "Thêm mới" },
      { id: "kld_sua", label: "Sửa" },
      { id: "kld_xoa", label: "Xóa" },
    ],
  },
  { id: "thiet_ke_mau_in", label: "THIẾT KẾ MẪU IN", children: [] },
  { id: "phan_quyen_nhan_vien", label: "PHÂN QUYỀN NHÂN VIÊN", children: [] },
  { id: "xem_nhat_ky_he_thong", label: "XEM NHẬT KÝ HỆ THỐNG", children: [] },
];

// Danh sách cửa hàng (đồng bộ với CuaHangPage)
const STORES = [
  {
    id: "CH01",
    name: "TVU_WASH",
    address: "140 Nguyễn Thiện Thành, Hoà Thuận, Vĩnh Long",
  },
];

// localStorage helpers
const getPermKey = (userId) => `viwash_perm_${userId}`;
const getStoreKey = (userId) => `viwash_store_access_${userId}`;

function loadPerms(userId) {
  try {
    const raw = localStorage.getItem(getPermKey(userId));
    return raw ? JSON.parse(raw) : {};
  } catch {
    return {};
  }
}

function savePerms(userId, perms) {
  localStorage.setItem(getPermKey(userId), JSON.stringify(perms));
}

function loadStoreAccess(userId) {
  try {
    const raw = localStorage.getItem(getStoreKey(userId));
    return raw ? JSON.parse(raw) : [STORES[0].id];
  } catch {
    return [STORES[0].id];
  }
}

function saveStoreAccess(userId, access) {
  localStorage.setItem(getStoreKey(userId), JSON.stringify(access));
}

// ─────────────────────────────────────────────
// Checkbox hỗ trợ trạng thái indeterminate
// ─────────────────────────────────────────────
function IndeterminateCheckbox({ checked, indeterminate, onChange, disabled = false }) {
  const ref = useRef(null);
  useEffect(() => {
    if (ref.current) ref.current.indeterminate = !!indeterminate;
  }, [indeterminate]);
  return (
    <input
      type="checkbox"
      ref={ref}
      checked={checked}
      onChange={onChange}
      disabled={disabled}
      className="w-4 h-4 accent-nav-bg cursor-pointer disabled:cursor-default disabled:opacity-50"
    />
  );
}

// ─────────────────────────────────────────────
// PhanQuyenPage
// ─────────────────────────────────────────────
export default function PhanQuyenPage() {
  const navigate = useNavigate();
  const { user } = useAuth();

  // ── Staff ──
  const [staff, setStaff] = useState([]);
  const [selectedId, setSelectedId] = useState(null);
  const [loadingStaff, setLoadingStaff] = useState(true);

  // ── Permissions & store access ──
  const [perms, setPerms] = useState({});
  const [storeAccess, setStoreAccess] = useState([STORES[0].id]);
  const [collapsed, setCollapsed] = useState({});
  const [savingPerms, setSavingPerms] = useState(false);
  const [saveSuccess, setSaveSuccess] = useState(false);

  // ── Modal ──
  const [showModal, setShowModal] = useState(false);
  const [modalMode, setModalMode] = useState("add");
  const [editingStaff, setEditingStaff] = useState(null);
  const [modalForm, setModalForm] = useState({
    full_name: "",
    phone: "",
    password: "",
    email: "",
    locked: false,
    role: "STAFF",
  });
  const [showPwd, setShowPwd] = useState(false);
  const [modalError, setModalError] = useState("");
  const [modalSaving, setModalSaving] = useState(false);

  // ── Auth guard ──
  useEffect(() => {
    if (!user) navigate("/login");
  }, [user, navigate]);

  // ── Load staff list ──
  const loadStaff = useCallback(async () => {
    setLoadingStaff(true);
    try {
      const res = await axiosInstance.get("/users");
      const list = res.data || [];
      setStaff(list);
      if (list.length > 0) {
        setSelectedId((prev) => prev || list[0]._id);
      }
    } catch (err) {
      console.error("Không thể tải danh sách nhân viên:", err);
    } finally {
      setLoadingStaff(false);
    }
  }, []);

  useEffect(() => {
    loadStaff();
  }, [loadStaff]);

  // ── Load perms/store khi chọn nhân viên ──
  useEffect(() => {
    if (!selectedId) return;
    setPerms(loadPerms(selectedId));
    setStoreAccess(loadStoreAccess(selectedId));
  }, [selectedId]);

  // ── Helpers phân quyền ──
  const getGroupState = (group) => {
    if (group.children.length === 0) {
      return { checked: !!perms[group.id], indeterminate: false };
    }
    const childIds = group.children.map((c) => c.id);
    const checkedCount = childIds.filter((id) => perms[id]).length;
    if (checkedCount === 0) return { checked: false, indeterminate: false };
    if (checkedCount === childIds.length) return { checked: true, indeterminate: false };
    return { checked: false, indeterminate: true };
  };

  const toggleChild = (childId) => {
    setPerms((prev) => ({ ...prev, [childId]: !prev[childId] }));
  };

  const toggleGroup = (group) => {
    if (group.children.length === 0) {
      setPerms((prev) => ({ ...prev, [group.id]: !prev[group.id] }));
      return;
    }
    const { checked, indeterminate } = getGroupState(group);
    const newVal = !(checked || indeterminate);
    const updates = {};
    group.children.forEach((c) => {
      updates[c.id] = newVal;
    });
    setPerms((prev) => ({ ...prev, ...updates }));
  };

  const allLeafIds = [];
  PERMISSIONS.forEach((g) => {
    if (g.children.length === 0) allLeafIds.push(g.id);
    else g.children.forEach((c) => allLeafIds.push(c.id));
  });

  const allChecked =
    allLeafIds.length > 0 && allLeafIds.every((id) => perms[id]);

  const toggleSelectAll = () => {
    const newVal = !allChecked;
    const updates = {};
    allLeafIds.forEach((id) => {
      updates[id] = newVal;
    });
    setPerms(updates);
  };

  const toggleCollapse = (groupId) => {
    setCollapsed((prev) => ({ ...prev, [groupId]: !prev[groupId] }));
  };

  const toggleStore = (storeId) => {
    setStoreAccess((prev) =>
      prev.includes(storeId)
        ? prev.filter((id) => id !== storeId)
        : [...prev, storeId]
    );
  };

  const handleSavePerms = () => {
    if (!selectedId) return;
    setSavingPerms(true);
    savePerms(selectedId, perms);
    saveStoreAccess(selectedId, storeAccess);
    setTimeout(() => {
      setSavingPerms(false);
      setSaveSuccess(true);
      setTimeout(() => setSaveSuccess(false), 2000);
    }, 500);
  };

  // ── Modal: mở thêm / sửa ──
  const openAdd = () => {
    setModalMode("add");
    setEditingStaff(null);
    setModalForm({ full_name: "", phone: "", password: "", email: "", locked: false, role: "STAFF" });
    setModalError("");
    setShowPwd(false);
    setShowModal(true);
  };

  const openEdit = (s) => {
    setModalMode("edit");
    setEditingStaff(s);
    setModalForm({
      full_name: s.full_name,
      phone: s.phone,
      password: "",
      email: s.email || "",
      locked: !s.is_active,
      role: s.role || "STAFF",
    });
    setModalError("");
    setShowPwd(false);
    setShowModal(true);
  };

  const closeModal = () => {
    setShowModal(false);
    setModalError("");
  };

  const handleModalSubmit = async () => {
    setModalError("");
    if (!modalForm.full_name.trim()) {
      setModalError("Vui lòng nhập tên nhân viên");
      return;
    }
    if (!modalForm.phone.trim()) {
      setModalError("Vui lòng nhập số điện thoại");
      return;
    }
    if (modalMode === "add" && !modalForm.password.trim()) {
      setModalError("Vui lòng nhập mật khẩu");
      return;
    }
    setModalSaving(true);
    try {
      if (modalMode === "add") {
        await axiosInstance.post("/users", {
          full_name: modalForm.full_name.trim(),
          phone: modalForm.phone.trim(),
          password: modalForm.password,
          email: modalForm.email.trim() || null,
          is_active: !modalForm.locked,
          role: modalForm.role,
        });
      } else {
        await axiosInstance.put(`/users/${editingStaff._id}`, {
          full_name: modalForm.full_name.trim(),
          phone: modalForm.phone.trim(),
          email: modalForm.email.trim() || null,
          is_active: !modalForm.locked,
          role: modalForm.role,
        });
        if (modalForm.password.trim()) {
          await axiosInstance.put(`/users/${editingStaff._id}/password`, {
            new_password: modalForm.password.trim(),
          });
        }
      }
      closeModal();
      await loadStaff();
    } catch (err) {
      setModalError(
        err?.response?.data?.message || "Có lỗi xảy ra, vui lòng thử lại"
      );
    } finally {
      setModalSaving(false);
    }
  };

  const handleDelete = async (id) => {
    if (!window.confirm("Bạn có chắc chắn muốn xóa nhân viên này?")) return;
    try {
      await axiosInstance.delete(`/users/${id}`);
      await loadStaff();
      toast.success("Xóa nhân viên thành công!");
    } catch {
      toast.error("Không thể xóa nhân viên này.");
    }
  };

  return (
    <div className="min-h-screen bg-mesh page-enter">
      <Header />

      {/* Loading guard */}
      {loadingStaff && (
        <div className="flex items-center justify-center h-64">
          <div className="flex flex-col items-center gap-3">
            <div className="w-9 h-9 border-[3px] border-nav-bg border-t-transparent rounded-full animate-spin" />
            <span className="text-sm text-slate-400 font-medium">Đang tải dữ liệu...</span>
          </div>
        </div>
      )}

      <div className="p-5 max-w-360 mx-auto transition-opacity duration-300" style={{opacity: loadingStaff ? 0 : 1, pointerEvents: loadingStaff ? "none" : "auto"}}>
        {/* Back button */}
        <button
          onClick={() => navigate(-1)}
          className="flex items-center gap-1 text-nav-bg font-bold text-sm mb-5 hover:opacity-75 transition-opacity"
        >
          <span className="material-symbols-outlined text-lg leading-none">chevron_left</span>
          PHÂN QUYỀN
        </button>

        {/* 3-panel layout */}
        <div className="flex gap-4 items-start">

          {/* ══════════════════════════════════
              PANEL: DANH SÁCH NHÂN VIÊN
          ══════════════════════════════════ */}
          <div className="bg-white rounded-2xl shadow-sm w-full p-6 flex flex-col gap-6">
            {/* Header */}
            <div className="flex items-center justify-between">
              <span className="text-sm font-bold tracking-widest text-gray-500 uppercase">
                Danh sách nhân viên
              </span>
              <button
                onClick={openAdd}
                className="flex items-center gap-1.5 text-sm font-semibold text-white bg-nav-bg rounded-lg px-4 py-2 hover:bg-opacity-90 transition-colors shadow-sm"
              >
                <span className="material-symbols-outlined text-lg leading-none">add</span>
                Thêm tài khoản
              </button>
            </div>

            {/* Danh sách nhân viên */}
            <div className="min-h-[200px] overflow-x-auto">
              {loadingStaff ? (
                <p className="text-sm text-gray-400 text-center py-10">Đang tải...</p>
              ) : staff.length === 0 ? (
                <p className="text-sm text-gray-400 text-center py-10">Chưa có nhân viên</p>
              ) : (
                <table className="w-full text-left border-collapse min-w-[700px]">
                  <thead>
                    <tr className="border-b-2 border-gray-100 text-xs font-bold text-gray-500 uppercase tracking-wider">
                      <th className="py-3 px-4">Nhân viên</th>
                      <th className="py-3 px-4">Tài khoản</th>
                      <th className="py-3 px-4">Loại tài khoản</th>
                      <th className="py-3 px-4">Trạng thái</th>
                      <th className="py-3 px-4 text-right">Thao tác</th>
                    </tr>
                  </thead>
                  <tbody>
                    {staff.map((s) => (
                      <tr key={s._id} className="border-b border-gray-50 hover:bg-gray-50/50 transition-colors">
                        <td className="py-3.5 px-4">
                          <p className="text-sm font-bold text-gray-800 uppercase">{s.full_name}</p>
                          {s.email && <p className="text-xs text-gray-400 mt-0.5">{s.email}</p>}
                        </td>
                        <td className="py-3.5 px-4 text-sm text-gray-600 font-medium">
                          {s.phone}
                        </td>
                        <td className="py-3.5 px-4">
                          <span className={`inline-flex items-center px-2.5 py-1 rounded-md text-[11px] font-bold ${
                            s.role === 'ADMIN' 
                              ? 'bg-purple-100 text-purple-700' 
                              : 'bg-blue-100 text-blue-700'
                          }`}>
                            {s.role === 'ADMIN' ? 'ADMIN' : 'NHÂN VIÊN'}
                          </span>
                        </td>
                        <td className="py-3.5 px-4">
                          <span className={`inline-flex items-center px-2.5 py-1 rounded-md text-[11px] font-bold tracking-wide ${
                            s.is_active 
                              ? 'bg-green-100 text-green-700' 
                              : 'bg-gray-200 text-gray-600'
                          }`}>
                            {s.is_active ? 'HOẠT ĐỘNG' : 'ĐÃ KHÓA'}
                          </span>
                        </td>
                        <td className="py-3.5 px-4 text-right">
                          <div className="flex items-center justify-end gap-2">
                            <button
                              onClick={() => openEdit(s)}
                              className="text-gray-400 hover:text-blue-600 transition-colors bg-white border border-gray-200 w-8 h-8 rounded-lg flex items-center justify-center shadow-sm"
                              title="Cập nhật tài khoản"
                            >
                              <span className="material-symbols-outlined text-[18px]">edit</span>
                            </button>
                            <button
                              onClick={() => handleDelete(s._id)}
                              className="text-gray-400 hover:text-red-600 transition-colors bg-white border border-gray-200 w-8 h-8 rounded-lg flex items-center justify-center shadow-sm"
                              title="Xóa tài khoản"
                            >
                              <span className="material-symbols-outlined text-[18px]">delete</span>
                            </button>
                          </div>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              )}
            </div>

            {/* Nút Lưu thay đổi */}
            {/* <button
              onClick={handleSavePerms}
              disabled={!selectedId || savingPerms}
              className={`btn-magnetic w-full rounded-full py-2.5 text-sm font-semibold text-white disabled:opacity-40 ${saveSuccess ? "bg-green-500" : "btn-shimmer"}`}
            >
              {savingPerms ? "Đang lưu..." : saveSuccess ? "Đã lưu ✓" : "Lưu thay đổi"}
            </button> */}
          </div>

          {/* ══════════════════════════════════
              PANEL GIỮA: CỬA HÀNG
          ══════════════════════════════════ */}
          {/* <div className="bg-white rounded-2xl shadow-sm flex-1 p-5">
            <p className="text-[11px] font-bold tracking-widest text-gray-500 uppercase">
              Cửa hàng
            </p>
            <p className="text-[11px] text-gray-400 mt-1 mb-4">
              *Chọn cửa hàng nhân viên được quyền truy cập
            </p>

            <div className="flex flex-col gap-2">
              {STORES.map((store) => (
                <label
                  key={store.id}
                  className="flex items-start gap-3 border border-gray-100 rounded-xl px-4 py-3.5 cursor-pointer hover:bg-soft-blue-tint transition-colors"
                >
                  <input
                    type="checkbox"
                    checked={storeAccess.includes(store.id)}
                    onChange={() => toggleStore(store.id)}
                    disabled={!selectedId}
                    className="mt-0.5 w-4 h-4 accent-nav-bg cursor-pointer"
                  />
                  <div>
                    <p className="text-sm font-semibold text-gray-800">{store.name}</p>
                    <p className="text-xs text-gray-400 flex items-center gap-1 mt-0.5">
                      <span className="material-symbols-outlined text-xs">location_on</span>
                      {store.address}
                    </p>
                  </div>
                </label>
              ))}
            </div>
          </div> */}

          {/* ══════════════════════════════════
              PANEL PHẢI: CHỨC NĂNG
          ══════════════════════════════════ */}
          {/* <div className="bg-white rounded-2xl shadow-sm flex-1 p-5 max-h-[calc(100vh-160px)] overflow-y-auto">
            <div className="flex items-start justify-between mb-1">
              <div>
                <p className="text-[11px] font-bold tracking-widest text-gray-500 uppercase">
                  Chức năng
                </p>
                <p className="text-[11px] text-gray-400 mt-1">
                  *Chọn các chức năng nhân viên được quyền thao tác
                </p>
              </div>
              <button
                onClick={toggleSelectAll}
                disabled={!selectedId}
                className="flex items-center gap-1 text-xs font-semibold text-nav-bg border border-nav-bg rounded-full px-3 py-0.5 hover:bg-purple-50 disabled:opacity-40 transition-colors shrink-0 ml-2"
              >
                <span className="material-symbols-outlined text-sm leading-none">
                  {allChecked ? "remove_done" : "done_all"}
                </span>
                {allChecked ? "Bỏ chọn tất cả" : "Chọn tất cả"}
              </button>
            </div>

            <div className="mt-3 flex flex-col">
              {PERMISSIONS.map((group) => {
                const { checked, indeterminate } = getGroupState(group);
                const isCollapsed = !!collapsed[group.id];
                const hasChildren = group.children.length > 0;

                return (
                  <div key={group.id} className="border-b border-gray-50 last:border-b-0">

                    <div className="flex items-center gap-2 py-2.5 px-1">

                      <button
                        onClick={() => toggleCollapse(group.id)}
                        className={`transition-transform duration-200 ${
                          hasChildren ? "text-gray-500 hover:text-gray-700 cursor-pointer" : "opacity-0 pointer-events-none"
                        }`}
                        style={{ transform: isCollapsed ? "rotate(-90deg)" : "rotate(0deg)" }}
                      >
                        <span className="material-symbols-outlined text-base leading-none">
                          expand_more
                        </span>
                      </button>

                      <IndeterminateCheckbox
                        checked={checked}
                        indeterminate={indeterminate}
                        onChange={() => toggleGroup(group)}
                        disabled={!selectedId}
                      />

                      <span className="text-xs font-bold text-gray-700 tracking-wide">
                        {group.label}
                      </span>
                    </div>

                    {hasChildren && !isCollapsed && (
                      <div className="flex flex-col pb-1">
                        {group.children.map((child) => (
                          <label
                            key={child.id}
                            className="flex items-center gap-3 py-2 pl-12 pr-4 cursor-pointer hover:bg-gray-50 transition-colors"
                          >
                            <input
                              type="checkbox"
                              checked={!!perms[child.id]}
                              onChange={() => toggleChild(child.id)}
                              disabled={!selectedId}
                              className="w-4 h-4 accent-nav-bg cursor-pointer disabled:cursor-default disabled:opacity-50"
                            />
                            <span className="text-sm text-gray-600">{child.label}</span>
                          </label>
                        ))}
                      </div>
                    )}
                  </div>
                );
              })}
            </div>
          </div> */}
        </div>
      </div>

      {/* ══════════════════════════════════════════════
          MODAL: Thêm / Cập nhật tài khoản nhân viên
      ══════════════════════════════════════════════ */}
      {showModal && (
        <div
          className="fixed inset-0 bg-black/50 backdrop-blur-sm z-50 flex items-center justify-center"
          onClick={(e) => e.target === e.currentTarget && closeModal()}
        >
          <div className="bg-white animate-scale-in rounded-2xl shadow-2xl w-full max-w-lg mx-4 p-8">
            <h2 className="text-lg font-semibold text-gray-800 mb-7">
              {modalMode === "add" ? "Thêm tài khoản" : "Cập nhật tài khoản"}
            </h2>

            <div className="flex flex-col gap-6">
              {/* Tên nhân viên */}
              <div className="flex flex-col gap-1">
                <label className="text-sm font-medium text-nav-bg">
                  Tên nhân viên<span className="text-red-500">*</span>
                </label>
                <input
                  autoFocus
                  type="text"
                  value={modalForm.full_name}
                  onChange={(e) =>
                    setModalForm((p) => ({ ...p, full_name: e.target.value }))
                  }
                  className="border-0 border-b border-gray-300 focus:border-nav-bg outline-none pb-1 text-sm bg-transparent"
                />
              </div>

              {/* Số điện thoại */}
              <div className="flex flex-col gap-1">
                <label className="text-sm text-gray-500">
                  Số điện thoại<span className="text-red-500">*</span>
                </label>
                <input
                  type="text"
                  value={modalForm.phone}
                  onChange={(e) =>
                    setModalForm((p) => ({ ...p, phone: e.target.value }))
                  }
                  className="border-0 border-b border-gray-300 focus:border-nav-bg outline-none pb-1 text-sm bg-transparent"
                />
              </div>

              {/* Mật khẩu */}
              <div className="flex flex-col gap-1">
                <label className="text-sm text-gray-500">
                  Mật khẩu
                  {modalMode === "add" && <span className="text-red-500">*</span>}
                </label>
                <div className="relative flex items-center border-b border-gray-300 focus-within:border-nav-bg transition-colors">
                  <input
                    type={showPwd ? "text" : "password"}
                    value={modalForm.password}
                    onChange={(e) =>
                      setModalForm((p) => ({ ...p, password: e.target.value }))
                    }
                    className="flex-1 border-0 outline-none pb-1 text-sm pr-8 bg-transparent"
                  />
                  <button
                    type="button"
                    onClick={() => setShowPwd((p) => !p)}
                    className="absolute right-0 text-orange-400 hover:text-orange-500 transition-colors"
                  >
                    <span className="material-symbols-outlined text-xl">
                      {showPwd ? "visibility" : "visibility_off"}
                    </span>
                  </button>
                </div>
                {modalMode === "edit" && (
                  <p className="text-[11px] text-gray-400 mt-1">
                    Bỏ trống hoặc nhập mới khi cần thay mật khẩu mới.
                  </p>
                )}
              </div>

              {/* Email */}
              <div className="flex flex-col gap-1">
                <label className="text-sm text-gray-500">Địa chỉ email</label>
                <input
                  type="email"
                  value={modalForm.email}
                  onChange={(e) =>
                    setModalForm((p) => ({ ...p, email: e.target.value }))
                  }
                  className="border-0 border-b border-gray-300 focus:border-nav-bg outline-none pb-1 text-sm bg-transparent"
                />
              </div>

              {/* Loại tài khoản */}
              <div className="flex flex-col gap-2 mt-1">
                <label className="text-sm font-medium text-gray-700">Loại tài khoản</label>
                <div className="flex items-center gap-6">
                  <label className="flex items-center gap-2 cursor-pointer">
                    <input
                      type="radio"
                      name="role"
                      value="ADMIN"
                      checked={modalForm.role === "ADMIN"}
                      onChange={(e) => setModalForm((p) => ({ ...p, role: e.target.value }))}
                      className="w-4 h-4 accent-nav-bg cursor-pointer"
                    />
                    <span className="text-sm text-gray-700 font-medium">Quản trị viên (Admin)</span>
                  </label>
                  <label className="flex items-center gap-2 cursor-pointer">
                    <input
                      type="radio"
                      name="role"
                      value="STAFF"
                      checked={modalForm.role === "STAFF"}
                      onChange={(e) => setModalForm((p) => ({ ...p, role: e.target.value }))}
                      className="w-4 h-4 accent-nav-bg cursor-pointer"
                    />
                    <span className="text-sm text-gray-700 font-medium">Nhân viên (Staff)</span>
                  </label>
                </div>
              </div>

              {/* Khóa tài khoản – chỉ hiển thị với tài khoản nhân viên */}
              {(modalMode === "add" || editingStaff?.role !== "ADMIN") && (
                <label className="flex items-center gap-2 cursor-pointer">
                  <input
                    type="checkbox"
                    checked={modalForm.locked}
                    onChange={(e) =>
                      setModalForm((p) => ({ ...p, locked: e.target.checked }))
                    }
                    className="w-4 h-4 accent-accent-blue cursor-pointer"
                  />
                  <span className="text-sm text-gray-600">Khóa tài khoản này?</span>
                </label>
              )}
            </div>

            {/* Thông báo lỗi */}
            {modalError && (
              <p className="text-sm text-red-500 mt-4">{modalError}</p>
            )}

            {/* Nút hành động */}
            <div className="flex justify-end items-center gap-8 mt-8">
              <button
                onClick={closeModal}
                className="text-sm font-semibold text-gray-400 hover:text-gray-600 transition-colors tracking-wide"
              >
                ĐÓNG
              </button>
              <button
                onClick={handleModalSubmit}
                disabled={modalSaving}
                className="btn-magnetic btn-shimmer text-sm font-semibold text-white px-4 py-1.5 rounded-full disabled:opacity-50"
              >
                {modalSaving ? "ĐANG LƯU..." : "LƯU THAY ĐỔI"}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}



