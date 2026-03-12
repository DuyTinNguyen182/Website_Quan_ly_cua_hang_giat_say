// ─────────────────────────────────────────────────────────
//  Tiện ích ghi / đọc nhật ký hoạt động (localStorage)
//  KEY: viwash_activity_log  (mảng, mới nhất ở đầu)
// ─────────────────────────────────────────────────────────

const LOG_KEY = "viwash_activity_log";
const MAX_LOGS = 500; // giới hạn tối đa số bản ghi

/**
 * Ghi một hành động mới vào nhật ký.
 * @param {Object} entry
 * @param {string} entry.module       - Tên chức năng (VD: "Đơn hàng")
 * @param {string} entry.action       - Tên hành động (VD: "Thêm", "Sửa", "Xóa")
 * @param {string} entry.description  - Mô tả chi tiết (hỗ trợ **bold**)
 * @param {string} entry.staffName    - Tên nhân viên thực hiện
 */
export function logActivity({ module, action, description, staffName }) {
  try {
    const logs = getActivityLogs();
    const entry = {
      id: `${Date.now()}_${Math.random().toString(36).slice(2, 7)}`,
      module,
      action,
      description,
      staffName: staffName || "Hệ thống",
      createdAt: new Date().toISOString(),
    };
    logs.unshift(entry);
    if (logs.length > MAX_LOGS) logs.splice(MAX_LOGS);
    localStorage.setItem(LOG_KEY, JSON.stringify(logs));
  } catch {
    // Silent fail – log không được cản trở hoạt động chính
  }
}

/** Lấy toàn bộ nhật ký (mới nhất trước). */
export function getActivityLogs() {
  try {
    const raw = localStorage.getItem(LOG_KEY);
    return raw ? JSON.parse(raw) : [];
  } catch {
    return [];
  }
}

/** Xóa toàn bộ nhật ký. */
export function clearActivityLogs() {
  localStorage.removeItem(LOG_KEY);
}

/** Seed dữ liệu mẫu nếu nhật ký còn trống. */
export function seedDemoLogs() {
  if (getActivityLogs().length > 0) return;

  const DEMO = [
    {
      id: "demo_1",
      module: "Đơn hàng",
      action: "Thêm",
      description:
        "Thêm mới phiếu nhận đồ **CH01260304005** cho **KIM THỊ LIÊN** trị giá **120,000**",
      staffName: "TRẦN TRUNG PHÚC",
      createdAt: "2026-03-04T02:45:00.000Z",
    },
    {
      id: "demo_2",
      module: "Đơn hàng",
      action: "Thêm",
      description:
        "Thêm mới phiếu nhận đồ **CH01260304004** cho **KIM THỊ LIÊN** (đã thanh toán **KIM THỊ LIÊN**)",
      staffName: "TRẦN TRUNG PHÚC",
      createdAt: "2026-03-04T02:41:00.000Z",
    },
    {
      id: "demo_3",
      module: "Tài khoản ngân hàng",
      action: "Thêm",
      description: "Thêm mới tài khoản ngân hàng **7878968687689**",
      staffName: "TRẦN TRUNG PHÚC",
      createdAt: "2026-03-04T02:38:00.000Z",
    },
    {
      id: "demo_4",
      module: "Đơn hàng",
      action: "Giặt xong",
      description:
        "Chuyển trạng thái đơn **CH01260304003** của khách hàng **THẠCH THỊ THU** từ **Đơn mới** sang **Giặt xong**.",
      staffName: "TRẦN TRUNG PHÚC",
      createdAt: "2026-03-04T02:35:00.000Z",
    },
    {
      id: "demo_5",
      module: "Đơn hàng",
      action: "Thêm",
      description:
        "Thêm mới phiếu nhận đồ **CH01260304003** cho **THẠCH THỊ THU** (đã thanh toán **THẠCH THỊ THU**)",
      staffName: "TRẦN TRUNG PHÚC",
      createdAt: "2026-03-04T02:33:00.000Z",
    },
    {
      id: "demo_6",
      module: "Tài khoản ngân hàng",
      action: "Thêm",
      description: "Thêm mới tài khoản ngân hàng **0367345890**",
      staffName: "TRẦN TRUNG PHÚC",
      createdAt: "2026-03-04T02:32:00.000Z",
    },
    {
      id: "demo_7",
      module: "Danh sách khách hàng",
      action: "Thêm",
      description: "Thêm mới khách hàng **THẠCH THỊ THU**",
      staffName: "TRẦN TRUNG PHÚC",
      createdAt: "2026-03-04T02:31:00.000Z",
    },
    {
      id: "demo_8",
      module: "Bảng giá dịch vụ",
      action: "Sửa",
      description:
        "Cập nhật đơn giá dịch vụ **Giặt sấy thường** từ **15,000** thành **18,000**",
      staffName: "TRẦN TRUNG PHÚC",
      createdAt: "2026-03-04T02:20:00.000Z",
    },
    {
      id: "demo_9",
      module: "Khách hàng",
      action: "Sửa",
      description: "Cập nhật thông tin khách hàng **KIM THỊ LIÊN**",
      staffName: "TRẦN TRUNG PHÚC",
      createdAt: "2026-03-04T02:15:00.000Z",
    },
    {
      id: "demo_10",
      module: "Đơn hàng",
      action: "Giao khách",
      description:
        "Chuyển trạng thái đơn **CH01260304001** của khách hàng **KIM THỊ LIÊN** sang **Đã giao**.",
      staffName: "TRẦN TRUNG PHÚC",
      createdAt: "2026-03-04T01:58:00.000Z",
    },
    {
      id: "demo_11",
      module: "Thu - Chi",
      action: "Thêm",
      description:
        "Thêm mới phiếu thu **PT20260304001** số tiền **500,000** – Ghi chú: **Tiền giặt KIM THỊ LIÊN**",
      staffName: "TRẦN TRUNG PHÚC",
      createdAt: "2026-03-04T01:50:00.000Z",
    },
    {
      id: "demo_12",
      module: "Khách hàng",
      action: "Thêm",
      description: "Thêm mới khách hàng **KIM THỊ LIÊN** – SĐT: **0901234567**",
      staffName: "TRẦN TRUNG PHÚC",
      createdAt: "2026-03-04T01:45:00.000Z",
    },
    {
      id: "demo_13",
      module: "Kệ lưu đồ",
      action: "Thêm",
      description: "Thêm mới kệ đồ **Kệ A1**",
      staffName: "TRẦN TRUNG PHÚC",
      createdAt: "2026-03-04T01:40:00.000Z",
    },
    {
      id: "demo_14",
      module: "Đơn vị tính",
      action: "Thêm",
      description: "Thêm mới đơn vị tính **Kg**",
      staffName: "TRẦN TRUNG PHÚC",
      createdAt: "2026-03-04T01:38:00.000Z",
    },
    {
      id: "demo_15",
      module: "Hệ thống",
      action: "Đăng nhập",
      description: "Đăng nhập hệ thống thành công",
      staffName: "TRẦN TRUNG PHÚC",
      createdAt: "2026-03-04T01:30:00.000Z",
    },
    {
      id: "demo_16",
      module: "Hệ thống",
      action: "Đăng xuất",
      description: "Đăng xuất khỏi hệ thống",
      staffName: "TRẦN TRUNG PHÚC",
      createdAt: "2026-03-03T10:00:00.000Z",
    },
  ];

  try {
    localStorage.setItem(LOG_KEY, JSON.stringify(DEMO));
  } catch {
    /* ignore */
  }
}
