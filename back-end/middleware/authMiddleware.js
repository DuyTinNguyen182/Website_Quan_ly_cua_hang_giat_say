const jwt = require("jsonwebtoken");
const config = require("../config/jwt");

const authenticate = (req, res, next) => {
  const token = req.cookies.token;
  if (!token) {
    return res
      .status(401)
      .json({ message: "Unauthorized - No token provided" });
  }

  try {
    const secretKey = config.SECRET_KEY;
    const decoded = jwt.verify(token, secretKey);
    req.user = decoded.user;
    //console.log('Authenticated user:', req.user);
    next();
  } catch (err) {
    console.error(err);
    return res.status(401).json({ message: "Unauthorized - Invalid token" });
  }
};

const isAdmin = (req, res, next) => {
  if (!req.user || req.user.role !== "Admin") {
    return res
      .status(403)
      .json({ message: "Forbidden - Admin access required" });
  }
  next();
};

module.exports = { authenticate, isAdmin };