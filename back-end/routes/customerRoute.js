const express = require("express");
const router = express.Router();
const customerController = require("../controllers/customerController");
const { authenticate } = require("../middleware/authMiddleware");

// Tất cả các route đều yêu cầu đăng nhập (cả ADMIN và STAFF)

// GET /api/customers?search=keyword  - Lấy danh sách / tìm kiếm khách hàng
router.get("/", authenticate, customerController.getAllCustomers);

// GET /api/customers/:id             - Lấy chi tiết khách hàng
router.get("/:id", authenticate, customerController.getCustomerById);

// POST /api/customers                - Thêm khách hàng mới
router.post("/", authenticate, customerController.createCustomer);

// PUT /api/customers/:id             - Cập nhật khách hàng
router.put("/:id", authenticate, customerController.updateCustomer);

// DELETE /api/customers/:id          - Xóa khách hàng
router.delete("/:id", authenticate, customerController.deleteCustomer);

module.exports = router;
