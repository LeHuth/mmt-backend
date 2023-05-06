import { Router } from "express";
import TicketController from "./TicketController";

const router = Router();

// ticket erstellen
router.post("/create", TicketController.create);

//get ticket ba ID
router.get("/get/:id", TicketController.get);

//delete ticket
router.delete("/delete/:id", TicketController.deleteById);


export default router;
