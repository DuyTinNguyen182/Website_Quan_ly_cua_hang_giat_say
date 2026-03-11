const express = require("express");
const router = express.Router();
const shelfController = require("../controllers/shelfController");
const { authenticate } = require("../middleware/authMiddleware");

// GET /api/shelves?search=keyword  - Lấy danh sách / tìm kiếm kệ
router.get("/", authenticate, shelfController.getAllShelves);

// GET /api/shelves/:id             - Lấy chi tiết kệ
router.get("/:id", authenticate, shelfController.getShelfById);

// POST /api/shelves                - Thêm kệ mới
router.post("/", authenticate, shelfController.createShelf);

// PUT /api/shelves/:id             - Cập nhật kệ
router.put("/:id", authenticate, shelfController.updateShelf);

// DELETE /api/shelves/:id          - Xóa kệ
router.delete("/:id", authenticate, shelfController.deleteShelf);

module.exports = router;
