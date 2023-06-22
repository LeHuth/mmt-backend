import { Router } from "express";
import TicketController from "./TicketController";

const router = Router();

// ticket erstellen
router.post("/create", TicketController.create);

//get ticket ba ID
router.get("/get/:id", TicketController.get);

//delete ticket
router.delete("/delete/:id", TicketController.deleteById);

//validate ticket
router.post("/validate/:uuid", TicketController.validate);

export default router;
