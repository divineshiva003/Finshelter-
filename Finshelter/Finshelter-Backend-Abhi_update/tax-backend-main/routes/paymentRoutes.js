const express = require("express");
const router = express.Router();
const {
	createRazorpayOrder,
	verifyPayment,
	getOrderDetails,
	getCustomerOrders,
} = require("../controllers/paymentController");
const authMiddleware = require("../middlewares/authMiddleware");

// Create Razorpay Order
router.post("/create-order", authMiddleware, createRazorpayOrder);

// Verify Payment
router.post("/verify-payment", authMiddleware, verifyPayment);

// Get Order Details
router.get("/order/:orderId", authMiddleware, getOrderDetails);

// Get Customer Orders
router.get("/my-orders", authMiddleware, getCustomerOrders);

module.exports = router;
