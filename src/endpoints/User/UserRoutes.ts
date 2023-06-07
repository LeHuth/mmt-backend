import express from 'express';
import UserController from "../User/UserController"

const router = express.Router();

// POST request um user zu registrieren
router.post("/user/signup", UserController.registration);

// POST /users/login
router.post('/user/login', UserController.login);

// GET /users/get/:id
router.get('/user/get/:id', UserController.getUserById);

// DELETE /users/delete/:id
router.delete('/user/delete/:id', UserController.deleteUserById);

router.get('/get-order-history/:user_id', UserController.getOrderHistory);

router.post('/send-mail', UserController.sendMail);

router.get('/confirmation/:token', UserController.confirmation);

export default router;