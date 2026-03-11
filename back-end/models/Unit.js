const mongoose = require("mongoose");

const unitSchema = new mongoose.Schema(
  {
    name: { type: String, required: true, unique: true }, // VD: Kg, Cái, Bộ...
    note: { type: String }, // Ghi chú
    is_active: { type: Boolean, default: true },
  },
  { timestamps: true }
);

const Unit = mongoose.model("Unit", unitSchema);
module.exports = Unit;