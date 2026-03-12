const Order = require("../models/Order");

// Tạo mã đơn hàng tự động: DH + YYYYMMDD + 4 số ngẫu nhiên
const generateOrderCode = () => {
  const now = new Date();
  const date = now.toISOString().slice(0, 10).replace(/-/g, "");
  const rand = Math.floor(1000 + Math.random() * 9000);
  return `DH${date}-${rand}`;
};

// Lấy tất cả đơn hàng (có lọc theo status, payment_status, customer_id)
const getAllOrders = async ({ status, payment_status, customer_id, search } = {}) => {
  const filter = {};
  if (status) filter.status = status;
  if (payment_status) filter.payment_status = payment_status;
  if (customer_id) filter.customer_id = customer_id;

  let query = Order.find(filter)
    .populate("customer_id", "full_name phone address")

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
  customer_id,
  expected_return_date,
  note,
  payment_method,
  shelf_id,
  created_by,
}) => {
  const order_code = generateOrderCode();
  const order = new Order({
    order_code,
    customer_id,
    total_amount: 0,
    status: "PENDING_ITEMS",
    payment_status: "UNPAID",
    payment_method,
    expected_return_date,
    note,
    shelf_id: shelf_id || null,
    created_by,
  });
  return await order.save();
};

// Cập nhật thông tin đơn hàng
const updateOrder = async (id, { expected_return_date, note, shelf_id, payment_method }) => {
  return await Order.findByIdAndUpdate(
    id,
    { expected_return_date, note, shelf_id, payment_method },
    { new: true, runValidators: true }
  )
    .populate("customer_id", "full_name phone")
    .populate("shelf_id", "name");
};

// Cập nhật trạng thái đơn hàng
const updateOrderStatus = async (id, status) => {
  return await Order.findByIdAndUpdate(
    id,
    { status },
    { new: true, runValidators: true }
  );
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
};
