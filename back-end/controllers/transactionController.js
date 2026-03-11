const transactionService = require("../services/transactionService");

// GET /api/transactions?type=INCOME&from=2024-01-01&to=2024-12-31
const getAllTransactions = async (req, res) => {
  try {
    const { type, from, to } = req.query;
    const transactions = await transactionService.getAllTransactions({
      type,
      from,
      to,
    });
    res.json(transactions);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

// GET /api/transactions/:id
const getTransactionById = async (req, res) => {
  try {
    const transaction = await transactionService.getTransactionById(
      req.params.id
    );
    if (!transaction)
      return res.status(404).json({ message: "Không tìm thấy giao dịch" });
    res.json(transaction);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

// POST /api/transactions
const createTransaction = async (req, res) => {
  try {
    const { type, category, amount, description, transaction_date } = req.body;
    if (!type)
      return res.status(400).json({ message: "Loại giao dịch là bắt buộc" });
    if (!category)
      return res.status(400).json({ message: "Nhóm thu chi là bắt buộc" });
    if (amount == null)
      return res.status(400).json({ message: "Số tiền là bắt buộc" });
    if (!transaction_date)
      return res.status(400).json({ message: "Ngày giao dịch là bắt buộc" });

    const transaction = await transactionService.createTransaction({
      type,
      category,
      amount,
      description,
      transaction_date,
      created_by: req.user.id,
    });
    res
      .status(201)
      .json({ message: "Thêm giao dịch thành công", transaction });
  } catch (err) {
    res.status(400).json({ message: err.message });
  }
};

// PUT /api/transactions/:id
const updateTransaction = async (req, res) => {
  try {
    const transaction = await transactionService.updateTransaction(
      req.params.id,
      req.body
    );
    if (!transaction)
      return res.status(404).json({ message: "Không tìm thấy giao dịch" });
    res.json({ message: "Cập nhật giao dịch thành công", transaction });
  } catch (err) {
    res.status(400).json({ message: err.message });
  }
};

// DELETE /api/transactions/:id
const deleteTransaction = async (req, res) => {
  try {
    const transaction = await transactionService.deleteTransaction(
      req.params.id
    );
    if (!transaction)
      return res.status(404).json({ message: "Không tìm thấy giao dịch" });
    res.json({ message: "Xóa giao dịch thành công" });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

module.exports = {
  getAllTransactions,
  getTransactionById,
  createTransaction,
  updateTransaction,
  deleteTransaction,
};
