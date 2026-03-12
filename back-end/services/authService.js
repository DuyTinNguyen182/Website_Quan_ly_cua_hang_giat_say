const bcrypt = require("bcryptjs");
const jwt = require("jsonwebtoken");
const User = require("../models/User");
const { SECRET_KEY } = require("../config/jwt");

const SALT_ROUNDS = 10;

// Lấy danh sách tất cả user (không trả về password)
const getAllUsers = async () => {
  return await User.find().select("-password");
};

// Lấy user theo ID
const getUserById = async (id) => {
  return await User.findById(id).select("-password");
};

// Tạo user mới (dành cho Admin)
const createUser = async ({ full_name, phone, email, gender, password, role }) => {
  const existing = await User.findOne({ phone });
  if (existing) throw new Error("Số điện thoại đã tồn tại");

  const hashed = await bcrypt.hash(password, SALT_ROUNDS);
  const user = new User({ full_name, phone, email, gender, password: hashed, role });
  return await user.save();
};

// Cập nhật thông tin user
const updateUser = async (id, { full_name, phone, email, gender, role, is_active }) => {
  return await User.findByIdAndUpdate(
    id,
    { full_name, phone, email, gender, role, is_active },
    { new: true, runValidators: true }
  ).select("-password");
};

// Đổi mật khẩu (có xác minh mật khẩu hiện tại)
const changePassword = async (id, currentPassword, newPassword) => {
  const user = await User.findById(id);
  if (!user) throw new Error("Không tìm thấy người dùng");
  const isMatch = await bcrypt.compare(currentPassword, user.password);
  if (!isMatch) throw new Error("Mật khẩu hiện tại không đúng");
  const hashed = await bcrypt.hash(newPassword, SALT_ROUNDS);
  return await User.findByIdAndUpdate(id, { password: hashed });
};

// Vô hiệu hóa user (soft delete)
const deleteUser = async (id) => {
  return await User.findByIdAndUpdate(
    id,
    { is_active: false },
    { new: true }
  ).select("-password");
};

// Đăng nhập - trả về JWT token
const login = async (phone, password) => {
  const user = await User.findOne({ phone });
  if (!user) throw new Error("Số điện thoại hoặc mật khẩu không đúng");
  if (!user.is_active) throw new Error("Tài khoản đã bị vô hiệu hóa");

  const isMatch = await bcrypt.compare(password, user.password);
  if (!isMatch) throw new Error("Số điện thoại hoặc mật khẩu không đúng");

  const payload = {
    user: { id: user._id, role: user.role, full_name: user.full_name },
  };
  const token = jwt.sign(payload, SECRET_KEY, { expiresIn: "8h" });

  return {
    token,
    user: { id: user._id, full_name: user.full_name, role: user.role },
  };
};

module.exports = {
  getAllUsers,
  getUserById,
  createUser,
  updateUser,
  changePassword,
  deleteUser,
  login,
};
