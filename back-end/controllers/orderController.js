const orderService = require("../services/orderService");
const orderItemService = require("../services/orderItemService");

// GET /api/orders?status=RECEIVED&payment_status=UNPAID&customer_id=...&from=...&to=...
const getAllOrders = async (req, res) => {
  try {
    const { status, payment_status, customer_id, from, to } = req.query;
    const orders = await orderService.getAllOrders({ status, payment_status, customer_id, from, to });
    res.json(orders);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

// GET /api/orders/:id
const getOrderById = async (req, res) => {
  try {
    const order = await orderService.getOrderById(req.params.id);
    if (!order)
      return res.status(404).json({ message: "Không tìm thấy đơn hàng" });
    res.json(order);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

// POST /api/orders
const createOrder = async (req, res) => {
  try {
    const { order_code, status, customer_id, expected_return_date, note, payment_method, shelf_id } = req.body;
    if (!customer_id)
      return res.status(400).json({ message: "Khách hàng là bắt buộc" });

    const order = await orderService.createOrder({
      order_code,
      status,
      customer_id,
      expected_return_date,
      note,
      payment_method,
      shelf_id,
      created_by: req.user.id,
    });
    res.status(201).json({ message: "Tạo đơn hàng thành công", order });
  } catch (err) {
    res.status(400).json({ message: err.message });
  }
};

// PUT /api/orders/:id  - Cập nhật thông tin chung
const updateOrder = async (req, res) => {
  try {
    const order = await orderService.updateOrder(req.params.id, req.body);
    if (!order)
      return res.status(404).json({ message: "Không tìm thấy đơn hàng" });
    res.json({ message: "Cập nhật đơn hàng thành công", order });
  } catch (err) {
    res.status(400).json({ message: err.message });
  }
};

// PATCH /api/orders/:id/status  - Cập nhật trạng thái đơn
const updateOrderStatus = async (req, res) => {
  try {
    const { status } = req.body;
    if (!status)
      return res.status(400).json({ message: "Trạng thái là bắt buộc" });
    const order = await orderService.updateOrderStatus(req.params.id, status);
    if (!order)
      return res.status(404).json({ message: "Không tìm thấy đơn hàng" });
    res.json({ message: "Cập nhật trạng thái thành công", order });
  } catch (err) {
    res.status(400).json({ message: err.message });
  }
};

// PATCH /api/orders/:id/payment  - Cập nhật thanh toán
const updatePaymentStatus = async (req, res) => {
  try {
    const { payment_status, payment_method } = req.body;
    if (!payment_status)
      return res.status(400).json({ message: "Trạng thái thanh toán là bắt buộc" });
    const order = await orderService.updatePaymentStatus(req.params.id, {
      payment_status,
      payment_method,
    });
    if (!order)
      return res.status(404).json({ message: "Không tìm thấy đơn hàng" });
    res.json({ message: "Cập nhật thanh toán thành công", order });
  } catch (err) {
    res.status(400).json({ message: err.message });
  }
};

// DELETE /api/orders/:id
const deleteOrder = async (req, res) => {
  try {
    const order = await orderService.deleteOrder(req.params.id);
    if (!order)
      return res.status(404).json({ message: "Không tìm thấy đơn hàng" });
    // Xóa tất cả items liên quan
    await orderItemService.deleteItemsByOrderId(req.params.id);
    res.json({ message: "Xóa đơn hàng thành công" });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

module.exports = {
  getAllOrders,
  getOrderById,
  createOrder,
  updateOrder,
  updateOrderStatus,
  updatePaymentStatus,
  deleteOrder,
};
