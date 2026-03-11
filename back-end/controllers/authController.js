const authService = require("../services/authService");

// POST /auth/login
const login = async (req, res) => {
  try {
    const { phone, password } = req.body;
    if (!phone || !password)
      return res
        .status(400)
        .json({ message: "Vui lòng nhập số điện thoại và mật khẩu" });

    const { token, user } = await authService.login(phone, password);

    res.cookie("token", token, {
      httpOnly: true,
      maxAge: 8 * 60 * 60 * 1000, // 8 giờ
    });

    res.json({ message: "Đăng nhập thành công", user });
  } catch (err) {
    res.status(401).json({ message: err.message });
  }
};

// POST /auth/logout
const logout = (req, res) => {
  res.clearCookie("token");
  res.json({ message: "Đăng xuất thành công" });
};

// GET /users
const getAllUsers = async (req, res) => {
  try {
    const users = await authService.getAllUsers();
    res.json(users);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

// GET /users/:id
const getUserById = async (req, res) => {
  try {
    const user = await authService.getUserById(req.params.id);
    if (!user)
      return res.status(404).json({ message: "Không tìm thấy người dùng" });
    res.json(user);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

// POST /users
const createUser = async (req, res) => {
  try {
    const user = await authService.createUser(req.body);
    res.status(201).json({ message: "Tạo tài khoản thành công", user });
  } catch (err) {
    res.status(400).json({ message: err.message });
  }
};

// PUT /users/:id
const updateUser = async (req, res) => {
  try {
    const user = await authService.updateUser(req.params.id, req.body);
    if (!user)
      return res.status(404).json({ message: "Không tìm thấy người dùng" });
    res.json({ message: "Cập nhật thành công", user });
  } catch (err) {
    res.status(400).json({ message: err.message });
  }
};

// PUT /users/:id/password
const changePassword = async (req, res) => {
  try {
    const { new_password } = req.body;
    if (!new_password)
      return res.status(400).json({ message: "Vui lòng nhập mật khẩu mới" });

    await authService.changePassword(req.params.id, new_password);
    res.json({ message: "Đổi mật khẩu thành công" });
  } catch (err) {
    res.status(400).json({ message: err.message });
  }
};

// DELETE /users/:id  (soft delete - vô hiệu hóa)
const deleteUser = async (req, res) => {
  try {
    const user = await authService.deleteUser(req.params.id);
    if (!user)
      return res.status(404).json({ message: "Không tìm thấy người dùng" });
    res.json({ message: "Vô hiệu hóa tài khoản thành công", user });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

module.exports = {
  login,
  logout,
  getAllUsers,
  getUserById,
  createUser,
  updateUser,
  changePassword,
  deleteUser,
};
