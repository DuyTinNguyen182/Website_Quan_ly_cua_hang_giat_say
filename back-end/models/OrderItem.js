const mongoose = require("mongoose");

const orderItemSchema = new mongoose.Schema(
  {
    order_id: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Order",
      required: true,
    },

    service_id: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Service",
      required: true,
    },

    quantity: { type: Number, required: true },
    price: { type: Number, required: true },
    subtotal: { type: Number, required: true },
    
    // Ghi chú tình trạng đồ (Ví dụ: "Áo sơ mi bị sờn cổ", "Quần bò lem màu nhẹ")
    note: { type: String }, 
  },
  { timestamps: true }
);

const OrderItem = mongoose.model("OrderItem", orderItemSchema);
module.exports = OrderItem;