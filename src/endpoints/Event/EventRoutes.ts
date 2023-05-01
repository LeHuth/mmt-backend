import { Router } from 'express';
import EventController from "./EventController";
import {eventValidationRules, validateRequest} from "./EventValidators";

const router = Router();

// get all events
router.get('/get/all', EventController.getAll);

// get event by id
router.get('/get/:id', EventController.getById);

// create new event
router.post('/create', eventValidationRules,validateRequest, EventController.create);

// update event
router.patch('/update/:id', EventController.update);

// delete event
router.delete('/delete/:id', EventController.deleteById);

export default router;