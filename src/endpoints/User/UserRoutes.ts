import express from 'express';
import UserController from "../User/UserController"

const router = express.Router();

// POST request um user zu registrieren
router.post("/user/registration", UserController.registration);

// POST /users/login
router.post('/user/login', UserController.login);

// GET /users/get/:id
router.get('/user/get/:id', UserController.getUserById);

// DELETE /users/delete/:id
router.delete('/user/delete/:id', UserController.deleteUserById);

export default router;