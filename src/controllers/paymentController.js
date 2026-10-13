import Payment from "../models/Payment.js";
import Reservation from "../models/Reservation.js";
import crypto from "crypto";

// Create a simulated payment
export const createPayment = async (req, res) => {
  try {
    const { reservationId, paymentMethod } = req.body;

    // The authenticated user ID should be set by your auth middleware.
    const userId = req.user?._id || req.user?.id;

    if (!userId) {
      return res.status(401).json({
        success: false,
        message: "Authentication required.",
      });
    }

    if (!reservationId || !paymentMethod) {
      return res.status(400).json({
        success: false,
        message: "Reservation ID and payment method are required.",
      });
    }

    const allowedMethods = ["card", "bank_transfer", "cash", "other"];

    if (!allowedMethods.includes(paymentMethod)) {
      return res.status(400).json({
        success: false,
        message: "Invalid payment method.",
      });
    }

    const reservation = await Reservation.findById(reservationId);

    if (!reservation) {
      return res.status(404).json({
        success: false,
        message: "Reservation not found.",
      });
    }

    // Confirm that the reservation belongs to this user.
    const reservationUserId = String(reservation.user);
    if (reservationUserId !== String(userId)) {
      return res.status(403).json({
        success: false,
        message: "You cannot pay for another user's reservation.",
      });
    }

    if (reservation.status === "cancelled") {
      return res.status(400).json({
        success: false,
        message: "Cannot pay for a cancelled reservation.",
      });
    }

    // Use the amount calculated and stored by the reservation module.
    const amount = reservation.totalAmount;

    if (typeof amount !== "number" || !Number.isFinite(amount) || amount <= 0) {
      return res.status(400).json({
        success: false,
        message: "Reservation has an invalid payment amount.",
      });
    }

    const transactionReference = `SIM-${crypto.randomUUID()}`;

    // Create a pending payment record first.
    const payment = await Payment.create({
      reservation: reservation._id,
      user: userId,
      amount,
      paymentMethod,
      transactionReference,
      status: "pending",
      paymentType: "simulated",
    });

    // Simulate processing; this does not charge real money.
    const succeeded = Math.random() < 0.9;

    payment.status = succeeded ? "successful" : "failed";

    if (succeeded) {
      payment.paidAt = new Date();
    }

    await payment.save();

    return res.status(201).json({
      success: true,
      message: succeeded
        ? "Simulated payment successful."
        : "Simulated payment failed.",
      data: payment,
    });
  } catch (error) {
    console.error("Create payment error:", error);

    return res.status(500).json({
      success: false,
      message: "Unable to process payment.",
    });
  }
};

// Get a payment by ID
export const getPaymentById = async (req, res) => {
  try {
    const userId = req.user?._id || req.user?.id;

    if (!userId) {
      return res.status(401).json({
        success: false,
        message: "Authentication required.",
      });
    }

    const payment = await Payment.findOne({
      _id: req.params.id,
      user: userId,
    }).populate("reservation");

    if (!payment) {
      return res.status(404).json({
        success: false,
        message: "Payment not found.",
      });
    }

    return res.status(200).json({
      success: true,
      data: payment,
    });
  } catch (error) {
    console.error("Get payment error:", error);

    return res.status(500).json({
      success: false,
      message: "Unable to retrieve payment.",
    });
  }
};

// Get the authenticated user's payment history
export const getPaymentHistory = async (req, res) => {
  try {
    const userId = req.user?._id || req.user?.id;

    if (!userId) {
      return res.status(401).json({
        success: false,
        message: "Authentication required.",
      });
    }

    const payments = await Payment.find({ user: userId })
      .populate("reservation")
      .sort({ createdAt: -1 });

    return res.status(200).json({
      success: true,
      count: payments.length,
      data: payments,
    });
  } catch (error) {
    console.error("Payment history error:", error);

    return res.status(500).json({
      success: false,
      message: "Unable to retrieve payment history.",
    });
  }
};
