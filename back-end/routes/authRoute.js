const express = require("express");
const router = express.Router();
const authController = require("../controllers/authController");
const { authenticate, isAdmin } = require("../middleware/authMiddleware");

// =====================
//  Auth
// =====================
// POST /api/auth/login  - Đăng nhập (công khai)
router.post("/login", authController.login);

// POST /api/auth/logout - Đăng xuất (cần đăng nhập)
router.post("/logout", authenticate, authController.logout);

// =====================
//  CRUD User
// =====================
// GET /api/users        - Lấy danh sách user (Admin)
router.get("/users", authenticate, isAdmin, authController.getAllUsers);

// POST /api/users       - Tạo user mới (Admin)
router.post("/users", authenticate, isAdmin, authController.createUser);

// GET /api/users/:id    - Lấy user theo ID (đã đăng nhập)
router.get("/users/:id", authenticate, authController.getUserById);

// PUT /api/users/:id    - Cập nhật thông tin user (Admin)
router.put("/users/:id", authenticate, isAdmin, authController.updateUser);

// PUT /api/users/:id/password - Đổi mật khẩu (đã đăng nhập)
router.put(
  "/users/:id/password",
  authenticate,
  authController.changePassword
);

// DELETE /api/users/:id - Vô hiệu hóa user / soft delete (Admin)
router.delete(
  "/users/:id",
  authenticate,
  isAdmin,
  authController.deleteUser
);

module.exports = router;
