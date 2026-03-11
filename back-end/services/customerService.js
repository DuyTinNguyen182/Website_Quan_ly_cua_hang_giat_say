const Customer = require("../models/Customer");

// Lấy tất cả khách hàng
const getAllCustomers = async () => {
  return await Customer.find().sort({ created_at: -1 });
};

// Lấy khách hàng theo ID
const getCustomerById = async (id) => {
  return await Customer.findById(id);
};

// Tìm kiếm khách hàng theo tên hoặc số điện thoại
const searchCustomers = async (keyword) => {
  const regex = new RegExp(keyword, "i");
  return await Customer.find({
    $or: [{ full_name: regex }, { phone: regex }],
  }).sort({ created_at: -1 });
};

// Tạo khách hàng mới
const createCustomer = async ({ full_name, phone, address, note }) => {
  if (phone) {
    const existing = await Customer.findOne({ phone });
    if (existing) throw new Error("Số điện thoại đã tồn tại");
  }
  const customer = new Customer({ full_name, phone, address, note });
  return await customer.save();
};

// Cập nhật khách hàng
const updateCustomer = async (id, { full_name, phone, address, note }) => {
  if (phone) {
    const existing = await Customer.findOne({ phone, _id: { $ne: id } });
    if (existing) throw new Error("Số điện thoại đã tồn tại");
  }
  return await Customer.findByIdAndUpdate(
    id,
    { full_name, phone, address, note },
    { new: true, runValidators: true }
  );
};

// Xóa khách hàng
const deleteCustomer = async (id) => {
  return await Customer.findByIdAndDelete(id);
};

module.exports = {
  getAllCustomers,
  getCustomerById,
  searchCustomers,
  createCustomer,
  updateCustomer,
  deleteCustomer,
};
