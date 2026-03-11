const mongoose = require("mongoose");

const transactionSchema = new mongoose.Schema(
  {
    // THÊM MỚI: Loại giao dịch (INCOME: Thu / EXPENSE: Chi)
    type: { 
      type: String, 
      enum: ["INCOME", "EXPENSE"], 
      required: true 
    }, 
    
    category: { type: String, required: true }, // Nhóm thu chi: Điện, nước, mặt bằng,...
    amount: { type: Number, required: true }, // Số tiền
    description: { type: String }, // Lý do / Ghi chú thu chi
    
    transaction_date: { type: Date, required: true }, 

    created_by: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true,
    },
  },
  { timestamps: { createdAt: "created_at", updatedAt: false } }
);

const Transaction = mongoose.model("Transaction", transactionSchema);
module.exports = Transaction;