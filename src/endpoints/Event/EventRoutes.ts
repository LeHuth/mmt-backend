import {Router} from 'express';
import EventController from "./EventController";
import canEditEvent, {authenticateJWT, isOrganizer} from "../../authMiddleware";

const router = Router();

// get all events
router.get('/get/all', EventController.getAll);

// get event by id
router.get('/get/:id', EventController.getById);

// filter events
router.get('/filter', EventController.filter);

// get events by category
router.get('/get/category/:id', EventController.getByCategory);

// create new event
router.post('/create', authenticateJWT, isOrganizer, EventController.create);

// update event
router.patch('/update/:id', authenticateJWT, canEditEvent, EventController.update);

// delete event
router.delete('/delete/:id', authenticateJWT, canEditEvent, EventController.deleteById);


export default router;