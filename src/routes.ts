import express from "express";
const router = express.Router();

import EventRoutes from "./endpoints/Event/EventRoutes";
import EventLocationRoutes from "./endpoints/EventLocation/EventLocationRoutes";
import UserRoutes from "./endpoints/User/UserRoutes";
import PaymentRoutes from "./endpoints/Payment/PaymentRoutes";

router.use('/payment', PaymentRoutes);
router.use('/events',EventRoutes)
router.use('/users', UserRoutes);
router.use('/event-locations', EventLocationRoutes);


export default router;