import express from "express";
const router = express.Router();

import EventRoutes from "./endpoints/Event/EventRoutes";
import UserRoutes from "./endpoints/User/UserRoutes";

router.use('/events',EventRoutes)
router.use('/users', UserRoutes);


export default router;