const express = require("express");
const router = express.Router();
const serviceController = require("../controllers/serviceController");
const { authenticate } = require("../middleware/authMiddleware");

// GET /api/services?search=keyword  - Lấy danh sách / tìm kiếm dịch vụ
router.get("/", authenticate, serviceController.getAllServices);

// GET /api/services/:id             - Lấy chi tiết dịch vụ
router.get("/:id", authenticate, serviceController.getServiceById);

// POST /api/services                - Thêm dịch vụ mới
router.post("/", authenticate, serviceController.createService);

// PUT /api/services/:id             - Cập nhật dịch vụ
router.put("/:id", authenticate, serviceController.updateService);

// DELETE /api/services/:id          - Xóa dịch vụ
router.delete("/:id", authenticate, serviceController.deleteService);

module.exports = router;
