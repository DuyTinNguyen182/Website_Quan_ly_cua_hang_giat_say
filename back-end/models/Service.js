const mongoose = require("mongoose");

const serviceSchema = new mongoose.Schema(
  {
    name: { type: String, required: true },
    price_type: {
      type: String,
      enum: ["PER_KG", "PER_ITEM"],
      required: true,
    },
    price: { type: Number, required: true },
    is_active: { type: Boolean, default: true },
  },
  { timestamps: true }
);

const Service = mongoose.model("Service", serviceSchema);
module.exports = Service;