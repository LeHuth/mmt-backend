import express from 'express';
import ShoppingCartController from "./ShoppingCartController"

const router = express.Router();

// POST request um user zu adden
router.post("/addItem/:id", ShoppingCartController.add);


export default router;