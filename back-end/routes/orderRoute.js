const express = require("express");
const router = express.Router();
const orderController = require("../controllers/orderController");
const { authenticate } = require("../middleware/authMiddleware");

// GET /api/orders?status=...&payment_status=...&customer_id=...  - Danh sách đơn hàng
router.get("/", authenticate, orderController.getAllOrders);

// GET /api/orders/:id                   - Chi tiết đơn hàng
router.get("/:id", authenticate, orderController.getOrderById);

// POST /api/orders                      - Tạo đơn hàng mới
router.post("/", authenticate, orderController.createOrder);

// PUT /api/orders/:id                   - Cập nhật thông tin đơn hàng
router.put("/:id", authenticate, orderController.updateOrder);

// PATCH /api/orders/:id/status          - Cập nhật trạng thái đơn
router.patch("/:id/status", authenticate, orderController.updateOrderStatus);

// PATCH /api/orders/:id/payment         - Cập nhật thanh toán
router.patch("/:id/payment", authenticate, orderController.updatePaymentStatus);

// DELETE /api/orders/:id                - Xóa đơn hàng (kèm xóa items)
router.delete("/:id", authenticate, orderController.deleteOrder);

module.exports = router;
