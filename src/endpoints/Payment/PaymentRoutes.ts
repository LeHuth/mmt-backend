import express from "express";
import paymentController from "./PaymentController";

const router = express.Router();

router.post('/create-payment-intent', paymentController.paymentIntent);

router.post('/create-checkout-session', paymentController.checkoutSession);
export default router;