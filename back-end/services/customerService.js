const Customer = require("../models/Customer");
const Order = require("../models/Order");

// Lấy tất cả khách hàng cùng với thống kê chi tiêu, công nợ
const getAllCustomersWithStats = async () => {
  const customers = await Customer.find().sort({ created_at: -1 }).lean();
  
  const stats = await Order.aggregate([
    {
      $group: {
        _id: "$customer_id",
        totalSpent: { $sum: "$total_amount" },
        debt: {
          $sum: {
            $cond: [
              { $and: [{ $ne: ["$payment_status", "PAID"] }, { $ne: ["$status", "CANCELLED"] }] },
              "$total_amount",
              0
            ]
          }
        },
        lastVisit: { $max: "$created_at" }
      }
    }
  ]);

  const statsMap = stats.reduce((acc, curr) => {
    acc[curr._id.toString()] = curr;
    return acc;
  }, {});

  return customers.map(c => ({
    ...c,
    stats: statsMap[c._id.toString()] || { totalSpent: 0, debt: 0, lastVisit: null }
  }));
};

const getAllCustomers = async () => {
  return await getAllCustomersWithStats();
};

// Lấy khách hàng theo ID
const getCustomerById = async (id) => {
  return await Customer.findById(id);
};

// Tìm kiếm khách hàng theo tên hoặc số điện thoại
const searchCustomers = async (keyword) => {
  const regex = new RegExp(keyword, "i");
  const customers = await Customer.find({
    $or: [{ full_name: regex }, { phone: regex }],
  }).sort({ created_at: -1 }).lean();

  if (!customers.length) return [];

  const customerIds = customers.map(c => c._id);
  const stats = await Order.aggregate([
    { $match: { customer_id: { $in: customerIds } } },
    {
      $group: {
        _id: "$customer_id",
        totalSpent: { $sum: "$total_amount" },
        debt: {
          $sum: {
            $cond: [
              { $and: [{ $ne: ["$payment_status", "PAID"] }, { $ne: ["$status", "CANCELLED"] }] },
              "$total_amount",
              0
            ]
          }
        },
        lastVisit: { $max: "$created_at" }
      }
    }
  ]);

  const statsMap = stats.reduce((acc, curr) => {
    acc[curr._id.toString()] = curr;
    return acc;
  }, {});

  return customers.map(c => ({
    ...c,
    stats: statsMap[c._id.toString()] || { totalSpent: 0, debt: 0, lastVisit: null }
  }));
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
