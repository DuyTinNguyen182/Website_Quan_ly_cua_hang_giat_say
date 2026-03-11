const express = require("express");
const router = express.Router();
const unitController = require("../controllers/unitController");
const { authenticate } = require("../middleware/authMiddleware");

// GET /api/units?search=keyword  - Lấy danh sách / tìm kiếm đơn vị tính
router.get("/", authenticate, unitController.getAllUnits);

// GET /api/units/:id             - Lấy chi tiết đơn vị tính
router.get("/:id", authenticate, unitController.getUnitById);

// POST /api/units                - Thêm đơn vị tính mới
router.post("/", authenticate, unitController.createUnit);

// PUT /api/units/:id             - Cập nhật đơn vị tính
router.put("/:id", authenticate, unitController.updateUnit);

// DELETE /api/units/:id          - Xóa đơn vị tính
router.delete("/:id", authenticate, unitController.deleteUnit);

module.exports = router;
