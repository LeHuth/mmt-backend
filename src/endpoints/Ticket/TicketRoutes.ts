import { Router } from "express";
import TicketController from "./TicketController";

const router = Router();

router.post("/create", TicketController.create);

export default router;
