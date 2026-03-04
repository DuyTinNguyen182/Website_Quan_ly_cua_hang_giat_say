const mongoose = require("mongoose");

const customerSchema = new mongoose.Schema(
  {
    full_name: { type: String, required: true },
    phone: { type: String, required: true, unique: true },
    address: { type: String },
    note: { type: String },
  },
  { timestamps: { createdAt: "created_at", updatedAt: false } }
);

const Customer = mongoose.model("Customer", customerSchema);
module.exports = Customer;