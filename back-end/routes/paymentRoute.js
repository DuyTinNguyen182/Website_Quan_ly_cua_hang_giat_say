const express = require("express");
const router = express.Router();
const paymentController = require("../controllers/paymentController");

// Endpoint requested from frontend
router.post("/create-payment-link", paymentController.createPaymentLink);

// Endpoint webhook for PayOS API
router.post("/webhook", paymentController.receiveWebhook);

module.exports = router;