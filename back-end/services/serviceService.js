const Service = require("../models/Service");

// Lấy tất cả dịch vụ (có populate unit)
const getAllServices = async () => {
  return await Service.find().populate("unit_id", "name").sort({ createdAt: -1 });
};

// Lấy dịch vụ theo ID
const getServiceById = async (id) => {
  return await Service.findById(id).populate("unit_id", "name");
};

// Tìm kiếm dịch vụ theo tên
const searchServices = async (keyword) => {
  const regex = new RegExp(keyword, "i");
  return await Service.find({ name: regex })
    .populate("unit_id", "name")
    .sort({ createdAt: -1 });
};

// Tạo dịch vụ mới
const createService = async ({ name, unit_id, price, note, is_active }) => {
  const service = new Service({ name, unit_id, price, note, is_active });
  return await service.save();
};

// Cập nhật dịch vụ
const updateService = async (id, { name, unit_id, price, note, is_active }) => {
  return await Service.findByIdAndUpdate(
    id,
    { name, unit_id, price, note, is_active },
    { new: true, runValidators: true }
  ).populate("unit_id", "name");
};

// Xóa dịch vụ
const deleteService = async (id) => {
  return await Service.findByIdAndDelete(id);
};

module.exports = {
  getAllServices,
  getServiceById,
  searchServices,
  createService,
  updateService,
  deleteService,
};
