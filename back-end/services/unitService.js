const Unit = require("../models/Unit");

// Lấy tất cả đơn vị tính
const getAllUnits = async () => {
  return await Unit.find().sort({ createdAt: -1 });
};

// Lấy đơn vị tính theo ID
const getUnitById = async (id) => {
  return await Unit.findById(id);
};

// Tìm kiếm đơn vị tính theo tên
const searchUnits = async (keyword) => {
  const regex = new RegExp(keyword, "i");
  return await Unit.find({ name: regex }).sort({ createdAt: -1 });
};

// Tạo đơn vị tính mới
const createUnit = async ({ name, note, is_active }) => {
  const existing = await Unit.findOne({ name });
  if (existing) throw new Error("Tên đơn vị tính đã tồn tại");
  const unit = new Unit({ name, note, is_active });
  return await unit.save();
};

// Cập nhật đơn vị tính
const updateUnit = async (id, { name, note, is_active }) => {
  if (name) {
    const existing = await Unit.findOne({ name, _id: { $ne: id } });
    if (existing) throw new Error("Tên đơn vị tính đã tồn tại");
  }
  return await Unit.findByIdAndUpdate(
    id,
    { name, note, is_active },
    { new: true, runValidators: true }
  );
};

// Xóa đơn vị tính
const deleteUnit = async (id) => {
  return await Unit.findByIdAndDelete(id);
};

module.exports = {
  getAllUnits,
  getUnitById,
  searchUnits,
  createUnit,
  updateUnit,
  deleteUnit,
};
