import { Router } from 'express';
import EventController from "./EventController";
import {eventValidationRules, validateRequest} from "./EventValidators";

const router = Router();

// get all events
router.get('/get/all', EventController.getAll);

// get event by id
router.get('/get/:id', EventController.teapot);

// create new event
router.post('/create', eventValidationRules,validateRequest, EventController.create);

// update event
router.put('/update/:id', EventController.teapot);

export default router;