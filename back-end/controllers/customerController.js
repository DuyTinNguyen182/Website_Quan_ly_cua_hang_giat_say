const customerService = require("../services/customerService");

// GET /api/customers?search=keyword
const getAllCustomers = async (req, res) => {
  try {
    const { search } = req.query;
    const customers = search
      ? await customerService.searchCustomers(search)
      : await customerService.getAllCustomers();
    res.json(customers);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

// GET /api/customers/:id
const getCustomerById = async (req, res) => {
  try {
    const customer = await customerService.getCustomerById(req.params.id);
    if (!customer)
      return res.status(404).json({ message: "Không tìm thấy khách hàng" });
    res.json(customer);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

// POST /api/customers
const createCustomer = async (req, res) => {
  try {
    const { full_name, phone, address, note } = req.body;
    if (!full_name)
      return res.status(400).json({ message: "Tên khách hàng là bắt buộc" });

    const customer = await customerService.createCustomer({
      full_name,
      phone,
      address,
      note,
    });
    res.status(201).json({ message: "Thêm khách hàng thành công", customer });
  } catch (err) {
    res.status(400).json({ message: err.message });
  }
};

// PUT /api/customers/:id
const updateCustomer = async (req, res) => {
  try {
    const customer = await customerService.updateCustomer(
      req.params.id,
      req.body
    );
    if (!customer)
      return res.status(404).json({ message: "Không tìm thấy khách hàng" });
    res.json({ message: "Cập nhật khách hàng thành công", customer });
  } catch (err) {
    res.status(400).json({ message: err.message });
  }
};

// DELETE /api/customers/:id
const deleteCustomer = async (req, res) => {
  try {
    const customer = await customerService.deleteCustomer(req.params.id);
    if (!customer)
      return res.status(404).json({ message: "Không tìm thấy khách hàng" });
    res.json({ message: "Xóa khách hàng thành công" });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

module.exports = {
  getAllCustomers,
  getCustomerById,
  createCustomer,
  updateCustomer,
  deleteCustomer,
};
