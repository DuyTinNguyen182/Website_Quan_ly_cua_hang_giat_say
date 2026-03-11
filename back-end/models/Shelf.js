const mongoose = require("mongoose");

const shelfSchema = new mongoose.Schema(
  {
    name: { type: String, required: true, unique: true }, // VD: A-01, B-02...
    note: { type: String }, // Ghi chú
    is_active: { type: Boolean, default: true },
  },
  { timestamps: true }
);

const Shelf = mongoose.model("Shelf", shelfSchema);
module.exports = Shelf;