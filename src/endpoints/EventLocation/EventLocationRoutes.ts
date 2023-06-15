import { Router } from 'express';
import EventLocationController from "./EventLocationController";
import {eventLocationValidationRules, validateRequest} from "./EventLocationValidators";

const router = Router();

// get all event locations
router.get('/', EventLocationController.getAll);

// get event location by id
router.get('/:id', EventLocationController.getById);

// create new event location
router.post('/', eventLocationValidationRules, validateRequest, EventLocationController.create);

// update event location
router.put('/:id', eventLocationValidationRules, validateRequest, EventLocationController.update);

// delete event location
router.delete('/:id', EventLocationController.deleteById);

export default router;