const unitService = require("../services/unitService");

// GET /api/units?search=keyword
const getAllUnits = async (req, res) => {
  try {
    const { search } = req.query;
    const units = search
      ? await unitService.searchUnits(search)
      : await unitService.getAllUnits();
    res.json(units);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

// GET /api/units/:id
const getUnitById = async (req, res) => {
  try {
    const unit = await unitService.getUnitById(req.params.id);
    if (!unit)
      return res.status(404).json({ message: "Không tìm thấy đơn vị tính" });
    res.json(unit);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

// POST /api/units
const createUnit = async (req, res) => {
  try {
    const { name, note, is_active } = req.body;
    if (!name)
      return res.status(400).json({ message: "Tên đơn vị tính là bắt buộc" });

    const unit = await unitService.createUnit({ name, note, is_active });
    res.status(201).json({ message: "Thêm đơn vị tính thành công", unit });
  } catch (err) {
    res.status(400).json({ message: err.message });
  }
};

// PUT /api/units/:id
const updateUnit = async (req, res) => {
  try {
    const unit = await unitService.updateUnit(req.params.id, req.body);
    if (!unit)
      return res.status(404).json({ message: "Không tìm thấy đơn vị tính" });
    res.json({ message: "Cập nhật đơn vị tính thành công", unit });
  } catch (err) {
    res.status(400).json({ message: err.message });
  }
};

// DELETE /api/units/:id
const deleteUnit = async (req, res) => {
  try {
    const unit = await unitService.deleteUnit(req.params.id);
    if (!unit)
      return res.status(404).json({ message: "Không tìm thấy đơn vị tính" });
    res.json({ message: "Xóa đơn vị tính thành công" });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

module.exports = {
  getAllUnits,
  getUnitById,
  createUnit,
  updateUnit,
  deleteUnit,
};
