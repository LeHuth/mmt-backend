import express from 'express';
import ShoppingCartController from "./ShoppingCartController"

const router = express.Router();

// POST request um Item zu adden
router.post("/addItem/:userId/:eventId", ShoppingCartController.add);

// request to clear shoopingcart
router.delete("/clear/:id", ShoppingCartController.clear);

//request um alle Items zu bekommen
router.get("/getItems/:id", ShoppingCartController.getAllItems)

//request um Item zu löschen
router.delete("/deleteItem/:userId/:itemId", ShoppingCartController.deleteOneItem)
//request um gesamtPreis zu bekommen
router.get("/getPrice(:id", ShoppingCartController.getPrice)


export default router;