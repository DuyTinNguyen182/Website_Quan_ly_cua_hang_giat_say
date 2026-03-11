const Shelf = require("../models/Shelf");

// Lấy tất cả kệ
const getAllShelves = async () => {
  return await Shelf.find().sort({ createdAt: -1 });
};

// Lấy kệ theo ID
const getShelfById = async (id) => {
  return await Shelf.findById(id);
};

// Tìm kiếm kệ theo tên
const searchShelves = async (keyword) => {
  const regex = new RegExp(keyword, "i");
  return await Shelf.find({ name: regex }).sort({ createdAt: -1 });
};

// Tạo kệ mới
const createShelf = async ({ name, note, is_active }) => {
  const existing = await Shelf.findOne({ name });
  if (existing) throw new Error("Tên kệ đã tồn tại");
  const shelf = new Shelf({ name, note, is_active });
  return await shelf.save();
};

// Cập nhật kệ
const updateShelf = async (id, { name, note, is_active }) => {
  if (name) {
    const existing = await Shelf.findOne({ name, _id: { $ne: id } });
    if (existing) throw new Error("Tên kệ đã tồn tại");
  }
  return await Shelf.findByIdAndUpdate(
    id,
    { name, note, is_active },
    { new: true, runValidators: true }
  );
};

// Xóa kệ
const deleteShelf = async (id) => {
  return await Shelf.findByIdAndDelete(id);
};

module.exports = {
  getAllShelves,
  getShelfById,
  searchShelves,
  createShelf,
  updateShelf,
  deleteShelf,
};
