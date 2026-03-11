const express = require("express");
const router = express.Router();
const transactionController = require("../controllers/transactionController");
const { authenticate } = require("../middleware/authMiddleware");

// GET /api/transactions?type=INCOME&from=...&to=...  - Lấy danh sách giao dịch (có lọc)
router.get("/", authenticate, transactionController.getAllTransactions);

// GET /api/transactions/:id             - Lấy chi tiết giao dịch
router.get("/:id", authenticate, transactionController.getTransactionById);

// POST /api/transactions                - Thêm giao dịch mới
router.post("/", authenticate, transactionController.createTransaction);

// PUT /api/transactions/:id             - Cập nhật giao dịch
router.put("/:id", authenticate, transactionController.updateTransaction);

// DELETE /api/transactions/:id          - Xóa giao dịch
router.delete("/:id", authenticate, transactionController.deleteTransaction);

module.exports = router;
