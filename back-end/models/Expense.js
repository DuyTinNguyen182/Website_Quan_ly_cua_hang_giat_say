const mongoose = require("mongoose");

const expenseSchema = new mongoose.Schema(
  {
    category: { type: String, required: true }, // Điện, nước, lương...
    amount: { type: Number, required: true },
    description: { type: String },
    expense_date: { type: Date, required: true },

    created_by: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true,
    },
  },
  { timestamps: { createdAt: "created_at", updatedAt: false } }
);

const Expense = mongoose.model("Expense", expenseSchema);
module.exports = Expense;