import express from 'express';
import ShoppingCartController from "./ShoppingCartController"

const router = express.Router();
router.get("/get/:user_uuid", ShoppingCartController.get);

// POST request um user zu adden
router.post("/add/:user_uuid", ShoppingCartController.add);

// DELETE request um user zu löschen
router.delete("/remove/:user_uuid", ShoppingCartController.remove);


export default router;