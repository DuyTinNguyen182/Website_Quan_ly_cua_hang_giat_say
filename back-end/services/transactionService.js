const Transaction = require("../models/Transaction");

// Lấy tất cả giao dịch (có thể lọc theo type, khoảng ngày)
const getAllTransactions = async ({ type, from, to } = {}) => {
  const filter = {};
  if (type) filter.type = type;
  if (from || to) {
    filter.transaction_date = {};
    if (from) filter.transaction_date.$gte = new Date(from);
    if (to) filter.transaction_date.$lte = new Date(to);
  }
  return await Transaction.find(filter)
    .populate("created_by", "full_name")
    .sort({ transaction_date: -1 });
};

// Lấy giao dịch theo ID
const getTransactionById = async (id) => {
  return await Transaction.findById(id).populate("created_by", "full_name");
};

// Tạo giao dịch mới
const createTransaction = async ({
  type,
  category,
  amount,
  description,
  transaction_date,
  created_by,
}) => {
  const transaction = new Transaction({
    type,
    category,
    amount,
    description,
    transaction_date,
    created_by,
  });
  return await transaction.save();
};

// Cập nhật giao dịch
const updateTransaction = async (
  id,
  { type, category, amount, description, transaction_date }
) => {
  return await Transaction.findByIdAndUpdate(
    id,
    { type, category, amount, description, transaction_date },
    { new: true, runValidators: true }
  ).populate("created_by", "full_name");
};

// Xóa giao dịch
const deleteTransaction = async (id) => {
  return await Transaction.findByIdAndDelete(id);
};

module.exports = {
  getAllTransactions,
  getTransactionById,
  createTransaction,
  updateTransaction,
  deleteTransaction,
};
