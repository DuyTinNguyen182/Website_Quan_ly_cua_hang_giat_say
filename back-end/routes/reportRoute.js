const express = require("express");
const router = express.Router();
const reportController = require("../controllers/reportController");
const { authenticate } = require("../middleware/authMiddleware");

// GET /api/reports/revenue?from=2024-01-01&to=2024-12-31
router.get("/revenue", authenticate, reportController.getRevenueReport);

// GET /api/reports/fund?from=2024-01-01&to=2024-12-31
router.get("/fund", authenticate, reportController.getFundReport);

module.exports = router;