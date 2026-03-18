const mongoose = require("mongoose");

const systemLogSchema = new mongoose.Schema(
  {
    module: { type: String, required: true },
    action: { type: String, required: true },
    description: { type: String, required: true },
    method: { type: String, required: true },
    path: { type: String, required: true },
    status_code: { type: Number, required: true },
    user_id: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      default: null,
    },
    staff_name: { type: String, default: "Hệ thống" },
    role: { type: String, default: null },
    ip: { type: String, default: null },
  },
  { timestamps: { createdAt: "created_at", updatedAt: false } }
);

const SystemLog = mongoose.model("SystemLog", systemLogSchema);
module.exports = SystemLog;
