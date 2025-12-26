const Razorpay = require("razorpay");
const crypto = require("crypto");
const Order = require("../models/orderModel");
const User = require("../models/userModel");
const Service = require("../models/serviceModel");

// Initialize Razorpay
const razorpay = new Razorpay({
	key_id: process.env.RAZORPAY_KEY_ID,
	key_secret: process.env.RAZORPAY_KEY_SECRET,
});

// Create Razorpay Order
const createRazorpayOrder = async (req, res) => {
	try {
		console.log("Create order request body:", req.body);
		console.log("User from auth:", req.user);

		const {
			serviceId,
			serviceName,
			packageId,
			packageName,
			amount,
			totalAmount,
			servicePrice,
			discountAmount,
			cgstAmount,
			sgstAmount,
			igstAmount,
			CGST,
			SGST,
			IGST,
		} = req.body;

		// Use flexible field names (accept both totalAmount/amount and CGST/cgstAmount)
		const finalAmount = totalAmount || amount;
		const finalCGST = CGST || cgstAmount || 0;
		const finalSGST = SGST || sgstAmount || 0;
		const finalIGST = IGST || igstAmount || 0;

		// Validate only essential fields
		if (!serviceId || !serviceName || !finalAmount) {
			return res.status(400).json({ 
				success: false,
				message: "Missing required fields: serviceId, serviceName, and amount/totalAmount are required",
				received: { serviceId, serviceName, amount, totalAmount }
			});
		}

		const userId = req.user._id || req.user.userId;
		console.log("Looking for user with ID:", userId);

		// Get user details (User model uses _id as primary key, not userId)
		const user = await User.findById(userId);
		if (!user) {
			console.log("User not found for ID:", userId);
			return res.status(404).json({ 
				success: false,
				message: "User not found" 
			});
		}

		console.log("Found user:", user.name, user.email);

		// Create Razorpay order
		const options = {
			amount: Math.round(finalAmount * 100), // amount in paise
			currency: "INR",
			receipt: `order_${Date.now()}`,
			notes: {
				userId: userId,
				serviceId: serviceId,
				serviceName: serviceName,
			},
		};

		const razorpayOrder = await razorpay.orders.create(options);

		// Create order in database
		const newOrder = new Order({
			orderId: razorpayOrder.id,
			customerId: userId,
			customerName: user.name,
			customerEmail: user.email,
			customerMobile: user.mobile || "",
			serviceId: serviceId,
			serviceName: serviceName,
			packageId: packageId || "",
			packageName: packageName || "",
			servicePrice: servicePrice || finalAmount,
			discountAmount: discountAmount || 0,
			cgstAmount: finalCGST,
			sgstAmount: finalSGST,
			igstAmount: finalIGST,
			totalAmount: finalAmount,
			orderStatus: "Pending",
			paymentStatus: "Pending",
			paymentMethod: "Razorpay",
			razorpayOrderId: razorpayOrder.id,
			orderDate: new Date(),
		});

		await newOrder.save();
		console.log("Order created successfully:", newOrder.orderId);

		res.json({
			success: true,
			orderId: razorpayOrder.id,
			order: {
				id: razorpayOrder.id,
				amount: razorpayOrder.amount,
				currency: razorpayOrder.currency,
			},
			amount: razorpayOrder.amount,
			currency: razorpayOrder.currency,
			keyId: process.env.RAZORPAY_KEY_ID,
		});
	} catch (error) {
		console.error("Error creating Razorpay order:", error);
		console.error("Error stack:", error.stack);
		res.status(500).json({
			success: false,
			message: "Failed to create order",
			error: error.message,
			details: error.errors || error.toString(),
		});
	}
};

// Verify Payment
const verifyPayment = async (req, res) => {
	try {
		const {
			razorpay_order_id,
			razorpay_payment_id,
			razorpay_signature,
		} = req.body;

		// Verify signature
		const sign = razorpay_order_id + "|" + razorpay_payment_id;
		const expectedSign = crypto
			.createHmac("sha256", process.env.RAZORPAY_KEY_SECRET)
			.update(sign.toString())
			.digest("hex");

		if (razorpay_signature === expectedSign) {
			// Update order status
			const order = await Order.findOne({ razorpayOrderId: razorpay_order_id });
			
			if (!order) {
				return res.status(404).json({
					success: false,
					message: "Order not found",
				});
			}

			order.paymentStatus = "Paid";
			order.orderStatus = "In Process";
			order.razorpayPaymentId = razorpay_payment_id;

			// Calculate expected completion date based on service processing days
			const service = await Service.findOne({ _id: order.serviceId });
			if (service && service.processingdays) {
				const processingDays = parseInt(service.processingdays);
				const expectedDate = new Date();
				expectedDate.setDate(expectedDate.getDate() + processingDays);
				order.expectedCompletionDate = expectedDate;
				order.dueDate = expectedDate;
			}

			await order.save();

			res.json({
				success: true,
				message: "Payment verified successfully",
				orderId: order.orderId,
			});
		} else {
			// Update order as failed
			await Order.findOneAndUpdate(
				{ razorpayOrderId: razorpay_order_id },
				{ paymentStatus: "Failed" }
			);

			res.status(400).json({
				success: false,
				message: "Invalid payment signature",
			});
		}
	} catch (error) {
		console.error("Error verifying payment:", error);
		res.status(500).json({
			success: false,
			message: "Payment verification failed",
			error: error.message,
		});
	}
};

// Get Order Details
const getOrderDetails = async (req, res) => {
	try {
		const { orderId } = req.params;
		const order = await Order.findOne({ orderId: orderId });

		if (!order) {
			return res.status(404).json({
				success: false,
				message: "Order not found",
			});
		}

		res.json({
			success: true,
			order: order,
		});
	} catch (error) {
		console.error("Error fetching order:", error);
		res.status(500).json({
			success: false,
			message: "Failed to fetch order",
			error: error.message,
		});
	}
};

// Get Customer Orders
const getCustomerOrders = async (req, res) => {
	try {
		const userId = req.user._id || req.user.userId;
		const orders = await Order.find({ customerId: userId }).sort({ orderDate: -1 });

		res.json({
			success: true,
			orders: orders,
		});
	} catch (error) {
		console.error("Error fetching customer orders:", error);
		res.status(500).json({
			success: false,
			message: "Failed to fetch orders",
			error: error.message,
		});
	}
};

module.exports = {
	createRazorpayOrder,
	verifyPayment,
	getOrderDetails,
	getCustomerOrders,
};
