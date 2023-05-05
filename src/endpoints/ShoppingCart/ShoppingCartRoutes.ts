import express from 'express';
import ShoppingCartController from "./ShoppingCartController"

const router = express.Router();

// POST request um user zu registrieren
router.post("/addItem/:id", ShoppingCartController.create);

export default router;