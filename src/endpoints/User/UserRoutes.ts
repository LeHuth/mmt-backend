import express from 'express';
import UserController from "../User/UserController"

const router = express.Router();

// POST request um user zu registrieren
router.post("/user/signup", UserController.registration);

// POST /users/login
router.post('/user/login', UserController.login);

// Route für das Abrufen eines einzelnen Benutzers
router.get('/user/:id', UserController.getUser);

// Route für das Abrufen aller Benutzer
router.get('/users', UserController.getUsers);

// Route für das Erstellen eines Benutzers
router.post('/user', UserController.createUser);

// Route für das Aktualisieren eines Benutzers
router.put('/user/:id', UserController.updateUser);

// Route für das Löschen eines Benutzers
router.delete('/user/:id', UserController.deleteUser);

router.get('/get-order-history/:user_id', UserController.getOrderHistory);

router.post('/send-mail', UserController.sendMail);

router.get('/confirmation/:token', UserController.confirmation);

router.get('/my/orders', UserController.getMyOrders);

export default router;