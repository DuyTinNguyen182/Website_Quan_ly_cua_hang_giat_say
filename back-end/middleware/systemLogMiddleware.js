const systemLogService = require("../services/systemLogService");

const MODULE_LABELS = {
  auth: "Hệ thống",
  users: "Tài khoản người dùng",
  customers: "Khách hàng",
  shelves: "Kệ lưu đồ",
  units: "Đơn vị tính",
  services: "Bảng giá dịch vụ",
  transactions: "Thu - Chi",
  orders: "Đơn hàng",
  "order-items": "Chi tiết đơn hàng",
  reports: "Báo cáo",
  payments: "Thanh toán",
  "system-logs": "Nhật ký hệ thống",
};

const getActionLabel = (method, path) => {
  if (path.startsWith("/api/auth/logout")) return "Đăng xuất";
  if (method === "POST") return "Thêm";
  if (method === "PUT" || method === "PATCH") return "Sửa";
  if (method === "DELETE") return "Xóa";
  return "Thao tác";
};

const getModuleName = (path) => {
  const segments = String(path || "")
    .split("?")[0]
    .split("/")
    .filter(Boolean);

  const apiIndex = segments.indexOf("api");
  const routeKey = apiIndex >= 0 ? segments[apiIndex + 1] : segments[0];
  return MODULE_LABELS[routeKey] || "Hệ thống";
};

const shouldLog = (req) => {
  if (!["POST", "PUT", "PATCH", "DELETE"].includes(req.method)) return false;
  if (!req.user) return false;
  if (req.path.startsWith("/api/system-logs")) return false;
  if (req.path.startsWith("/api/auth/login")) return false;
  return true;
};

const systemLogMiddleware = (req, res, next) => {
  res.on("finish", async () => {
    if (!shouldLog(req)) return;
    if (res.statusCode >= 400) return;

    try {
      const moduleName = getModuleName(req.originalUrl || req.path);
      const action = getActionLabel(req.method, req.originalUrl || req.path);
      const description = `${action} ${moduleName} (${req.method} ${req.originalUrl || req.path})`;

      await systemLogService.createLog({
        module: moduleName,
        action,
        description,
        method: req.method,
        path: req.originalUrl || req.path,
        status_code: res.statusCode,
        user_id: req.user?.id,
        staff_name: req.user?.full_name || "Hệ thống",
        role: req.user?.role,
        ip: req.ip,
      });
    } catch (err) {
      console.error("[system-log] failed:", err.message);
    }
  });

  next();
};

module.exports = { systemLogMiddleware };
