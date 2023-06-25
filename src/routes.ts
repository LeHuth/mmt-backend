import express from "express";
import EventRoutes from "./endpoints/Event/EventRoutes";
import EventLocationRoutes from "./endpoints/EventLocation/EventLocationRoutes";
import UserRoutes from "./endpoints/User/UserRoutes";
import PaymentRoutes from "./endpoints/Payment/PaymentRoutes";
import TagRoutes from "./endpoints/Tags/TagRoutes";
import ShoppingCartRoutes from "./endpoints/ShoppingCart/ShoppingCartRoutes";

const router = express.Router();

router.use('/payment', PaymentRoutes);
router.use('/events', EventRoutes)
router.use('/users', UserRoutes);
router.use('/event-locations', EventLocationRoutes);
router.use('/tags', TagRoutes)
router.use('/cart', ShoppingCartRoutes)


export default router;