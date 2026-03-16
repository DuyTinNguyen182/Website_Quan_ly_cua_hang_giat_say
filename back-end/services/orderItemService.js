const OrderItem = require("../models/OrderItem");
const Order = require("../models/Order");

// Tính lại tổng tiền đơn hàng
const recalcOrderTotal = async (order_id) => {
  const items = await OrderItem.find({ order_id });
  const total = items.reduce((sum, item) => sum + item.subtotal, 0);
  await Order.findByIdAndUpdate(order_id, { total_amount: total });
};

// Lấy tất cả items theo đơn hàng
const getItemsByOrderId = async (order_id) => {
  return await OrderItem.find({ order_id }).populate({
    path: "service_id",
    populate: { path: "unit_id", select: "name" }
  });
};

// Lấy tất cả order items, có thể lọc qua order dates (tạm thời không filter được dates trừ khi dùng aggregation nhưng chỉ để báo cáo)
// Tùy chọn: tìm tất cả Order trong from-to, sau đó tìm items có order_id thuộc danh sách đó
const getAllOrderItems = async ({ from, to } = {}) => {
  let orderFilter = {};
  if (from || to) {
    orderFilter.created_at = {};
    if (from) orderFilter.created_at.$gte = new Date(from);
    if (to) orderFilter.created_at.$lte = new Date(to);
  }
  
  let validOrderIds = [];
  if (from || to) {
    const orders = await Order.find(orderFilter).select('_id');
    validOrderIds = orders.map(o => o._id);
  }

  const query = (from || to) ? { order_id: { $in: validOrderIds } } : {};
  
  return await OrderItem.find(query).populate({
    path: "service_id",
    populate: { path: "unit_id", select: "name" }
  });
};

// Lấy item theo ID
const getOrderItemById = async (id) => {
  return await OrderItem.findById(id).populate({
    path: "service_id",
    populate: { path: "unit_id", select: "name" }
  });
};

// Thêm item vào đơn hàng
const createOrderItem = async ({ order_id, service_id, quantity, price, note }) => {
  const subtotal = quantity * price;
  const item = new OrderItem({ order_id, service_id, quantity, price, subtotal, note });
  await item.save();
  await recalcOrderTotal(order_id);
  return item;
};

// Cập nhật item
const updateOrderItem = async (id, { service_id, quantity, price, note }) => {
  const item = await OrderItem.findById(id);
  if (!item) return null;

  const updatedQty = quantity ?? item.quantity;
  const updatedPrice = price ?? item.price;
  const subtotal = updatedQty * updatedPrice;

  const updated = await OrderItem.findByIdAndUpdate(
    id,
    { service_id, quantity: updatedQty, price: updatedPrice, subtotal, note },
    { new: true, runValidators: true }
  );

  await recalcOrderTotal(item.order_id);
  return updated;
};

// Xóa item
const deleteOrderItem = async (id) => {
  const item = await OrderItem.findByIdAndDelete(id);
  if (item) await recalcOrderTotal(item.order_id);
  return item;
};

// Xóa tất cả items của một đơn (dùng khi xóa đơn hàng)
const deleteItemsByOrderId = async (order_id) => {
  return await OrderItem.deleteMany({ order_id });
};

module.exports = {
  getAllOrderItems,
  getItemsByOrderId,
  getOrderItemById,
  createOrderItem,
  updateOrderItem,
  deleteOrderItem,
  deleteItemsByOrderId,
};
