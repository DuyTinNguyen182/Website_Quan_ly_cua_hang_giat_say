const Order = require("../models/Order");
const OrderItem = require("../models/OrderItem");

const toNonNegativeNumber = (value) => {
  const n = Number(value);
  return Number.isFinite(n) && n >= 0 ? n : 0;
};

const calcDiscountAmount = ({ subtotal, discount_type, discount_value }) => {
  if (discount_type === "FIXED") {
    return Math.min(toNonNegativeNumber(discount_value), subtotal);
  }

  const percent = Math.min(toNonNegativeNumber(discount_value), 100);
  return Math.round((subtotal * percent) / 100);
};

const recalcOrderTotalByOrderId = async (order_id) => {
  const [order, items] = await Promise.all([
    Order.findById(order_id),
    OrderItem.find({ order_id }).select("subtotal"),
  ]);

  if (!order) return null;

  const subtotal = items.reduce((sum, item) => sum + (item.subtotal || 0), 0);
  const surcharge = toNonNegativeNumber(order.surcharge);
  const discount_amount = calcDiscountAmount({
    subtotal,
    discount_type: order.discount_type,
    discount_value: order.discount_value,
  });
  const total_amount = Math.max(subtotal + surcharge - discount_amount, 0);

  order.discount_amount = discount_amount;
  order.total_amount = total_amount;
  await order.save();
  return order;
};

// Tạo mã đơn hàng tự động: DH + YYYYMMDD + 4 số ngẫu nhiên
const generateOrderCode = () => {
  const now = new Date();
  const date = now.toISOString().slice(0, 10).replace(/-/g, "");
  const rand = Math.floor(1000 + Math.random() * 9000);
  return `DH${date}-${rand}`;
};

// Lấy tất cả đơn hàng (có lọc theo status, payment_status, customer_id, khoảng ngày)
const getAllOrders = async ({ status, payment_status, customer_id, search, from, to } = {}) => {
  const filter = {};
  if (status) filter.status = status;
  if (payment_status) filter.payment_status = payment_status;
  if (customer_id) filter.customer_id = customer_id;
  if (from || to) {
    filter.created_at = {};
    if (from) filter.created_at.$gte = new Date(from);
    if (to) filter.created_at.$lte = new Date(to);
  }

  let query = Order.find(filter)
    .populate("customer_id", "full_name phone address")
    .populate("created_by", "full_name")
    .populate("shelf_id", "name")
    .sort({ created_at: -1 });

  return await query;
};

// Lấy đơn hàng theo ID
const getOrderById = async (id) => {
  return await Order.findById(id)
    .populate("customer_id", "full_name phone address")
    .populate("shelf_id", "name")
    .populate("created_by", "full_name");
};

// Tạo đơn hàng mới
const createOrder = async ({
  order_code,
  status,
  customer_id,
  expected_return_date,
  note,
  payment_status,
  payment_method,
  shelf_id,
  surcharge,
  discount_type,
  discount_value,
  created_by,
}) => {
  const final_order_code = order_code || generateOrderCode();
  const normalizedDiscountType = discount_type === "FIXED" ? "FIXED" : "PERCENT";
  const normalizedDiscountValue = toNonNegativeNumber(discount_value);

  const order = new Order({
    order_code: final_order_code,
    customer_id,
    total_amount: 0,
    status: status || "PENDING_ITEMS",
    payment_status: payment_status || "UNPAID",
    payment_method,
    expected_return_date,
    note,
    shelf_id: shelf_id || null,
    surcharge: toNonNegativeNumber(surcharge),
    discount_type: normalizedDiscountType,
    discount_value: normalizedDiscountValue,
    discount_amount: 0,
    created_by,
  });
  return await order.save();
};

// Cập nhật thông tin đơn hàng
const updateOrder = async (
  id,
  {
    expected_return_date,
    note,
    shelf_id,
    payment_method,
    surcharge,
    discount_type,
    discount_value,
    payment_status,
  }
) => {
  const payload = {
    expected_return_date,
    note,
    shelf_id,
    payment_method,
    payment_status,
  };

  if (surcharge !== undefined) payload.surcharge = toNonNegativeNumber(surcharge);
  if (discount_value !== undefined) payload.discount_value = toNonNegativeNumber(discount_value);
  if (discount_type !== undefined) payload.discount_type = discount_type === "FIXED" ? "FIXED" : "PERCENT";

  const updated = await Order.findByIdAndUpdate(id, payload, { new: true, runValidators: true });
  if (!updated) return null;

  await recalcOrderTotalByOrderId(id);

  return await Order.findById(id)
    .populate("customer_id", "full_name phone")
    .populate("shelf_id", "name");
};

// Cập nhật trạng thái đơn hàng
const updateOrderStatus = async (id, status) => {
  return await Order.findByIdAndUpdate(
    id,
    { status },
    { new: true, runValidators: true }
  ).populate("customer_id", "full_name phone");
};

// Cập nhật trạng thái thanh toán
const updatePaymentStatus = async (id, { payment_status, payment_method }) => {
  return await Order.findByIdAndUpdate(
    id,
    { payment_status, payment_method },
    { new: true, runValidators: true }
  );
};

// Xóa đơn hàng
const deleteOrder = async (id) => {
  return await Order.findByIdAndDelete(id);
};

module.exports = {
  getAllOrders,
  getOrderById,
  createOrder,
  updateOrder,
  updateOrderStatus,
  updatePaymentStatus,
  deleteOrder,
  recalcOrderTotalByOrderId,
};
