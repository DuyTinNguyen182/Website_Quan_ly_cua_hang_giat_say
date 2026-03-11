const express = require("express");
const router = express.Router();
const orderItemController = require("../controllers/orderItemController");
const { authenticate } = require("../middleware/authMiddleware");

// GET /api/order-items?order_id=...     - Lấy danh sách items theo đơn hàng
router.get("/", authenticate, orderItemController.getItemsByOrderId);

// GET /api/order-items/:id              - Chi tiết một item
router.get("/:id", authenticate, orderItemController.getOrderItemById);

// POST /api/order-items                 - Thêm item vào đơn hàng
router.post("/", authenticate, orderItemController.createOrderItem);

// PUT /api/order-items/:id              - Cập nhật item
router.put("/:id", authenticate, orderItemController.updateOrderItem);

// DELETE /api/order-items/:id           - Xóa item khỏi đơn hàng
router.delete("/:id", authenticate, orderItemController.deleteOrderItem);

module.exports = router;
