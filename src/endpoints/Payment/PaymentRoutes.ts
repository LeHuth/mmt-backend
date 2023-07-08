import express from "express";
import paymentController from "./PaymentController";

const router = express.Router();

router.post('/create-payment-intent', paymentController.paymentIntent);

router.post('/create-checkout-session', paymentController.checkoutSession);

//router.post('/webhook', paymentController.webhook);

router.get('/get-charges/:stripe_id', paymentController.getCharges);

router.post('/checkout', paymentController.checkout);

router.get('/prepare-checkout', paymentController.prepareCheckout);

router.post('/webhook', express.raw({type: 'application/json'}), paymentController.webhook);

export default router;