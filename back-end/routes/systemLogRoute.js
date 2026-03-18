const express = require("express");
const router = express.Router();
const systemLogController = require("../controllers/systemLogController");
const { authenticate, isAdmin } = require("../middleware/authMiddleware");

// GET /api/system-logs - Danh sách nhật ký hệ thống (Admin)
router.get("/", authenticate, isAdmin, systemLogController.getSystemLogs);

module.exports = router;
