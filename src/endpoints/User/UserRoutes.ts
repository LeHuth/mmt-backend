import express from 'express';
import UserController from "../User/UserController"

const router = express.Router();

// POST request um user zu registrieren
router.post("/user/registration", UserController.registration);

// POST /users/login
router.post('/user/login', UserController.login);

export default router;