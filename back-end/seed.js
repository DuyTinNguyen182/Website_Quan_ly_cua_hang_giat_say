require("dotenv").config();
const mongoose = require("mongoose");
const bcrypt = require("bcryptjs");
const User = require("./models/User");

async function seed() {
  await mongoose.connect(process.env.MONGO_URI);
  console.log("MongoDB connected");

  const phone = "0931014232";
  const password = "123456";
  const existing = await User.findOne({ phone });

  if (existing) {
    console.log("Tài khoản admin đã tồn tại:", phone);
  } else {
    const hashed = await bcrypt.hash(password, 10);
    await User.create({
      full_name: "Admin",
      phone,
      password: hashed,
      role: "ADMIN",
    });
    console.log("Tạo tài khoản admin thành công!");
    console.log("  SĐT     :", phone);
    console.log("  Mật khẩu:", password);
  }

  await mongoose.disconnect();
}

seed().catch((err) => { console.error(err); process.exit(1); });
