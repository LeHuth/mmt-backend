import express from 'express';
import ShoppingCartController from "./ShoppingCartController"

const router = express.Router();
router.get("/get/:user_uuid", ShoppingCartController.get);

// POST request um item zu shopping cart hinzuzufügen
router.post("/add/:user_uuid", ShoppingCartController.add);

// DELETE request um item aus shopping cart zu entfernen
router.delete("/remove/:user_uuid", ShoppingCartController.remove);

router.post('/update-item/:event_id', ShoppingCartController.updateItem);


export default router;