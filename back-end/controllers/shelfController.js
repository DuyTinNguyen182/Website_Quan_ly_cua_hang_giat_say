const shelfService = require("../services/shelfService");

// GET /api/shelves?search=keyword
const getAllShelves = async (req, res) => {
  try {
    const { search } = req.query;
    const shelves = search
      ? await shelfService.searchShelves(search)
      : await shelfService.getAllShelves();
    res.json(shelves);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

// GET /api/shelves/:id
const getShelfById = async (req, res) => {
  try {
    const shelf = await shelfService.getShelfById(req.params.id);
    if (!shelf)
      return res.status(404).json({ message: "Không tìm thấy kệ" });
    res.json(shelf);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

// POST /api/shelves
const createShelf = async (req, res) => {
  try {
    const { name, note, is_active } = req.body;
    if (!name)
      return res.status(400).json({ message: "Tên kệ là bắt buộc" });

    const shelf = await shelfService.createShelf({ name, note, is_active });
    res.status(201).json({ message: "Thêm kệ thành công", shelf });
  } catch (err) {
    res.status(400).json({ message: err.message });
  }
};

// PUT /api/shelves/:id
const updateShelf = async (req, res) => {
  try {
    const shelf = await shelfService.updateShelf(req.params.id, req.body);
    if (!shelf)
      return res.status(404).json({ message: "Không tìm thấy kệ" });
    res.json({ message: "Cập nhật kệ thành công", shelf });
  } catch (err) {
    res.status(400).json({ message: err.message });
  }
};

// DELETE /api/shelves/:id
const deleteShelf = async (req, res) => {
  try {
    const shelf = await shelfService.deleteShelf(req.params.id);
    if (!shelf)
      return res.status(404).json({ message: "Không tìm thấy kệ" });
    res.json({ message: "Xóa kệ thành công" });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

module.exports = {
  getAllShelves,
  getShelfById,
  createShelf,
  updateShelf,
  deleteShelf,
};
