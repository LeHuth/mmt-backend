import { Router } from 'express';
import EventLocationController from "./EventLocationController";
import {eventLocationValidationRules, validateRequest} from "./EventLocationValidators";

const router = Router();

// get all event locations
router.get('/', EventLocationController.getAll);

// get event location by id
router.get('/get/:id', EventLocationController.getById);

// create new event location
router.post('/create', EventLocationController.create);

// update event location
router.put('/update/:id', EventLocationController.update);

// delete event location
router.delete('/delete/:id', EventLocationController.deleteById);

// filter event locations
router.get('/filter', EventLocationController.filter);

export default router;