const orderItemService = require("../services/orderItemService");

// GET /api/order-items?order_id=...&from=...&to=...
const getItemsByOrderId = async (req, res) => {
  try {
    const { order_id, from, to } = req.query;
    if (order_id) {
      const items = await orderItemService.getItemsByOrderId(order_id);
      return res.json(items);
    }
    
    // Nếu không có order_id, có thể lấy tất cả để báo cáo
    const items = await orderItemService.getAllOrderItems({ from, to });
    res.json(items);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

// GET /api/order-items/:id
const getOrderItemById = async (req, res) => {
  try {
    const item = await orderItemService.getOrderItemById(req.params.id);
    if (!item)
      return res.status(404).json({ message: "Không tìm thấy mục đơn hàng" });
    res.json(item);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

// POST /api/order-items
const createOrderItem = async (req, res) => {
  try {
    const { order_id, service_id, quantity, price, note } = req.body;
    if (!order_id)
      return res.status(400).json({ message: "order_id là bắt buộc" });
    if (!service_id)
      return res.status(400).json({ message: "Dịch vụ là bắt buộc" });
    if (quantity == null)
      return res.status(400).json({ message: "Số lượng là bắt buộc" });
    if (price == null)
      return res.status(400).json({ message: "Giá là bắt buộc" });

    const item = await orderItemService.createOrderItem({
      order_id,
      service_id,
      quantity,
      price,
      note,
    });
    res.status(201).json({ message: "Thêm dịch vụ vào đơn hàng thành công", item });
  } catch (err) {
    res.status(400).json({ message: err.message });
  }
};

// PUT /api/order-items/:id
const updateOrderItem = async (req, res) => {
  try {
    const item = await orderItemService.updateOrderItem(req.params.id, req.body);
    if (!item)
      return res.status(404).json({ message: "Không tìm thấy mục đơn hàng" });
    res.json({ message: "Cập nhật mục đơn hàng thành công", item });
  } catch (err) {
    res.status(400).json({ message: err.message });
  }
};

// DELETE /api/order-items/:id
const deleteOrderItem = async (req, res) => {
  try {
    const item = await orderItemService.deleteOrderItem(req.params.id);
    if (!item)
      return res.status(404).json({ message: "Không tìm thấy mục đơn hàng" });
    res.json({ message: "Xóa mục đơn hàng thành công" });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

module.exports = {
  getItemsByOrderId,
  getOrderItemById,
  createOrderItem,
  updateOrderItem,
  deleteOrderItem,
};
