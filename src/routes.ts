import express from "express";
import EventRoutes from "./endpoints/Event/EventRoutes";
import EventLocationRoutes from "./endpoints/EventLocation/EventLocationRoutes";
import UserRoutes from "./endpoints/User/UserRoutes";
import PaymentRoutes from "./endpoints/Payment/PaymentRoutes";
import TagRoutes from "./endpoints/Tags/TagRoutes";
import ShoppingCartRoutes from "./endpoints/ShoppingCart/ShoppingCartRoutes";
import CategoryRoutes from "./endpoints/Category/CategoryRoutes";
import TicketRoutes from "./endpoints/Ticket/TicketRoutes";
import ReviewRoutes from "./endpoints/Review/ReviewRoutes";

const router = express.Router();

router.use('/payment', PaymentRoutes);
router.use('/events', EventRoutes)
router.use('/users', UserRoutes);
router.use('/event-locations', EventLocationRoutes);
router.use('/tags', TagRoutes)
router.use('/cart', ShoppingCartRoutes)
router.use('/categories', CategoryRoutes)
router.use('/tickets', TicketRoutes)
router.use('/reviews', ReviewRoutes)


export default router;