const systemLogService = require("../services/systemLogService");

const getSystemLogs = async (req, res) => {
  try {
    const { search, module, action, from, to, limit } = req.query;
    const logs = await systemLogService.getLogs({
      search,
      module,
      action,
      from,
      to,
      limit,
    });

    const mapped = logs.map((log) => ({
      id: log._id,
      module: log.module,
      action: log.action,
      description: log.description,
      staffName: log.staff_name,
      createdAt: log.created_at,
      method: log.method,
      path: log.path,
      statusCode: log.status_code,
      role: log.role,
    }));

    res.json(mapped);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

module.exports = {
  getSystemLogs,
};
