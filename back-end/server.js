const express = require("express");
require("dotenv").config();
const cors = require("cors");
const cookieParser = require("cookie-parser");
const connectDB = require("./config/db");
const authRoute = require("./routes/authRoute");
const customerRoute = require("./routes/customerRoute");

connectDB();

const app = express();

app.use(cors({ origin: true, credentials: true }));
app.use(express.json());
app.use(cookieParser());

app.get("/", (req, res) => {
    res.send("Backend is running...");
});

// Routes
app.use("/api/auth", authRoute);
app.use("/api", authRoute);
app.use("/api/customers", customerRoute);

const PORT = process.env.PORT || 5000;

app.listen(PORT, () => {
    console.log(`Server running on port ${PORT}`);
});