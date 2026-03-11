const serviceService = require("../services/serviceService");

// GET /api/services?search=keyword
const getAllServices = async (req, res) => {
  try {
    const { search } = req.query;
    const services = search
      ? await serviceService.searchServices(search)
      : await serviceService.getAllServices();
    res.json(services);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

// GET /api/services/:id
const getServiceById = async (req, res) => {
  try {
    const service = await serviceService.getServiceById(req.params.id);
    if (!service)
      return res.status(404).json({ message: "Không tìm thấy dịch vụ" });
    res.json(service);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

// POST /api/services
const createService = async (req, res) => {
  try {
    const { name, unit_id, price, note, is_active } = req.body;
    if (!name)
      return res.status(400).json({ message: "Tên dịch vụ là bắt buộc" });
    if (!unit_id)
      return res.status(400).json({ message: "Đơn vị tính là bắt buộc" });
    if (price == null)
      return res.status(400).json({ message: "Giá dịch vụ là bắt buộc" });

    const service = await serviceService.createService({
      name,
      unit_id,
      price,
      note,
      is_active,
    });
    res.status(201).json({ message: "Thêm dịch vụ thành công", service });
  } catch (err) {
    res.status(400).json({ message: err.message });
  }
};

// PUT /api/services/:id
const updateService = async (req, res) => {
  try {
    const service = await serviceService.updateService(
      req.params.id,
      req.body
    );
    if (!service)
      return res.status(404).json({ message: "Không tìm thấy dịch vụ" });
    res.json({ message: "Cập nhật dịch vụ thành công", service });
  } catch (err) {
    res.status(400).json({ message: err.message });
  }
};

// DELETE /api/services/:id
const deleteService = async (req, res) => {
  try {
    const service = await serviceService.deleteService(req.params.id);
    if (!service)
      return res.status(404).json({ message: "Không tìm thấy dịch vụ" });
    res.json({ message: "Xóa dịch vụ thành công" });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

module.exports = {
  getAllServices,
  getServiceById,
  createService,
  updateService,
  deleteService,
};
