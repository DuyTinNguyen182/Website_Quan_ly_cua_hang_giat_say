const systemLogService = require("../services/systemLogService");
const Order = require("../models/Order");

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

const extractRouteKey = (path) => {
  const segments = String(path || "")
    .split("?")[0]
    .split("/")
    .filter(Boolean);

  const apiIndex = segments.indexOf("api");
  return apiIndex >= 0 ? segments[apiIndex + 1] : segments[0];
};

const safeTrim = (value) => {
  if (value === null || value === undefined) return "";
  return String(value).trim();
};

const getIdFromPath = (path) => {
  const segments = String(path || "")
    .split("?")[0]
    .split("/")
    .filter(Boolean);

  const apiIndex = segments.indexOf("api");
  if (apiIndex < 0) return "";

  const routeIndex = apiIndex + 1;
  const idSegment = segments[routeIndex + 1] || "";
  if (!idSegment || ["status", "payment"].includes(idSegment)) return "";
  return idSegment;
};

const buildDefaultDetail = (req) => {
  const body = req.body || {};
  const explicitCode =
    safeTrim(body.order_code) || safeTrim(body.code) || safeTrim(body.orderCode);
  if (explicitCode) return `Mã: **${explicitCode}**`;

  const explicitName = safeTrim(body.name) || safeTrim(body.full_name);
  if (explicitName) return `Tên: **${explicitName}**`;

  const explicitPhone = safeTrim(body.phone);
  if (explicitPhone) return `SĐT: **${explicitPhone}**`;

  const idFromParams = safeTrim(req.params?.id) || getIdFromPath(req.originalUrl || req.path);
  if (idFromParams) return `Mã tham chiếu: **${idFromParams}**`;

  return "";
};

const buildDetail = async (req) => {
  const path = req.originalUrl || req.path;
  const routeKey = extractRouteKey(path);

  if (routeKey === "orders") {
    const body = req.body || {};
    const bodyOrderCode = safeTrim(body.order_code) || safeTrim(body.orderCode);
    if (bodyOrderCode) return `Mã đơn hàng: **${bodyOrderCode}**`;

    const orderId = safeTrim(req.params?.id) || getIdFromPath(path);
    if (orderId) {
      try {
        const order = await Order.findById(orderId).select("order_code").lean();
        if (order?.order_code) return `Mã đơn hàng: **${order.order_code}**`;
      } catch (_) {
        // Ignore lookup errors and fallback to a generic detail.
      }
      return `Mã đơn hàng: **${orderId}**`;
    }
  }

  if (routeKey === "order-items") {
    const orderId =
      safeTrim(req.body?.order_id) ||
      safeTrim(req.body?.orderId) ||
      safeTrim(req.params?.order_id);
    if (orderId) {
      try {
        const order = await Order.findById(orderId).select("order_code").lean();
        if (order?.order_code) return `Mã đơn hàng: **${order.order_code}**`;
      } catch (_) {
        // Ignore lookup errors and fallback to raw id.
      }
      return `Mã đơn hàng: **${orderId}**`;
    }
  }

  return buildDefaultDetail(req);
};

const buildDescription = async (req, moduleName, action) => {
  const detail = await buildDetail(req);
  return detail ? `${action} ${moduleName} - ${detail}` : `${action} ${moduleName}`;
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
      const description = await buildDescription(req, moduleName, action);

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
