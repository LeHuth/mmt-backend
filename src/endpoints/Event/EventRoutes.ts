import { Router } from 'express';
import EventController from "./EventController";
import {eventValidationRules, validateRequest} from "./EventValidators";
import canEditEvent, {authenticateJWT, isAdmin, isOrganizer, isUser} from "../../authMiddleware";
const router = Router();

// get all events
router.get('/get/all', EventController.getAll);

// get event by id
router.get('/get/:id', EventController.getById);

// filter events
router.get('/filter', EventController.filter);


// create new event
router.post('/create', authenticateJWT, isOrganizer, EventController.create);

// update event
router.patch('/update/:id', authenticateJWT, canEditEvent, EventController.update);

// delete event
router.delete('/delete/:id', authenticateJWT, canEditEvent, EventController.deleteById);

export default router;