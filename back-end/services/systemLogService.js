const SystemLog = require("../models/SystemLog");

const createLog = async ({
  module,
  action,
  description,
  method,
  path,
  status_code,
  user_id,
  staff_name,
  role,
  ip,
}) => {
  return await SystemLog.create({
    module,
    action,
    description,
    method,
    path,
    status_code,
    user_id: user_id || null,
    staff_name: staff_name || "Hệ thống",
    role: role || null,
    ip: ip || null,
  });
};

const getLogs = async ({ search, module, action, from, to, limit = 200 }) => {
  const finalLimit = Math.min(Math.max(Number(limit) || 200, 1), 1000);
  const filter = {};

  if (module) filter.module = module;
  if (action) filter.action = action;

  if (from || to) {
    filter.created_at = {};
    if (from) filter.created_at.$gte = new Date(from);
    if (to) filter.created_at.$lte = new Date(to);
  }

  if (search && search.trim()) {
    const q = search.trim();
    filter.$or = [
      { module: { $regex: q, $options: "i" } },
      { action: { $regex: q, $options: "i" } },
      { description: { $regex: q, $options: "i" } },
      { staff_name: { $regex: q, $options: "i" } },
      { path: { $regex: q, $options: "i" } },
    ];
  }

  return await SystemLog.find(filter)
    .sort({ created_at: -1 })
    .limit(finalLimit)
    .lean();
};

module.exports = {
  createLog,
  getLogs,
};
