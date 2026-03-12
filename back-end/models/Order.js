const mongoose = require("mongoose");

const orderSchema = new mongoose.Schema(
  {
    order_code: { type: String, required: true, unique: true },

    customer_id: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Customer",
      required: true,
    },

    total_amount: { type: Number, default: 0 },

    status: {
      type: String,
      enum: ["RECEIVED", "PENDING_ITEMS", "ITEMS_READY", "WASHING", "READY", "COMPLETED", "CANCELLED"],
      default: "PENDING_ITEMS",
    },

    payment_status: {
      type: String,
      enum: ["UNPAID", "PAID"],
      default: "UNPAID",
    },

    payment_method: {
      type: String,
      enum: ["CASH", "BANK"],
      default: "CASH",
    },

    expected_return_date: { type: Date },
    note: { type: String },

    // Liên kết vị trí Kệ lưu đồ
    shelf_id: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Shelf",
      default: null, // Đơn mới nhận có thể chưa có kệ
    },

    created_by: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true,
    },
  },
  { timestamps: { createdAt: "created_at", updatedAt: true } }
);

const Order = mongoose.model("Order", orderSchema);
module.exports = Order;