import express from "express";
const router = express.Router();

import EventRoutes from "./endpoints/Event/EventRoutes";
import UserRoutes from "./endpoints/User/UserRoutes";
import PaymentRoutes from "./endpoints/Payment/PaymentRoutes";

router.use('/payment', PaymentRoutes);
router.use('/events',EventRoutes)
router.use('/users', UserRoutes);


export default router;