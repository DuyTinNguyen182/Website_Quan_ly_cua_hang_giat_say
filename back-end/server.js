const express = require("express");
require("dotenv").config();
const cors = require("cors");
const cookieParser = require("cookie-parser");
const connectDB = require("./config/db");
const authRoute = require("./routes/authRoute");
const customerRoute = require("./routes/customerRoute");
const shelfRoute = require("./routes/shelfRoute");
const unitRoute = require("./routes/unitRoute");
const serviceRoute = require("./routes/serviceRoute");
const transactionRoute = require("./routes/transactionRoute");
const orderRoute = require("./routes/orderRoute");
const orderItemRoute = require("./routes/orderItemRoute");
const reportRoute = require("./routes/reportRoute");
const paymentRoute = require("./routes/paymentRoute");
const systemLogController = require("./controllers/systemLogController");
const { systemLogMiddleware } = require("./middleware/systemLogMiddleware");
const { authenticate, isAdmin } = require("./middleware/authMiddleware");

connectDB();

const app = express();

app.use(cors({ origin: true, credentials: true }));
app.use(express.json());
app.use(cookieParser());
app.use(systemLogMiddleware);

app.get("/", (req, res) => {
    res.send("Backend is running...");
});

// Routes
app.use("/api/auth", authRoute);
app.use("/api", authRoute);
app.use("/api/customers", customerRoute);
app.use("/api/shelves", shelfRoute);
app.use("/api/units", unitRoute);
app.use("/api/services", serviceRoute);
app.use("/api/transactions", transactionRoute);
app.use("/api/orders", orderRoute);
app.use("/api/order-items", orderItemRoute);
app.use("/api/reports", reportRoute);
app.use("/api/payments", paymentRoute);
app.get("/api/system-logs", authenticate, isAdmin, systemLogController.getSystemLogs);

const PORT = process.env.PORT || 5000;

app.listen(PORT, () => {
    console.log(`Server running on port ${PORT}`);
});