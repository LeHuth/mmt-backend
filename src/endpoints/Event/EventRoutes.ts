import { Router } from 'express';
import teapot from './EventController';

const router = Router();

// get all events
router.get('/get/all', teapot);

// get event by id
router.get('/get/:id', teapot);

// create new event
router.post('/create', teapot);

// update event
router.put('/update/:id', teapot);

export default router;