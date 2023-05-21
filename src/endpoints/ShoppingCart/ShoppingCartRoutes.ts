import { Router } from "express";
import ShoppingCartController from "./ShoppingCartController";


const router = Router();

// Create a new shopping cart for a user
router.post("/", ShoppingCartController.create);

// Retrieve a user's active shopping cart
router.get("/:creatorId", ShoppingCartController.read);

// Add an item to a user's shopping cart
router.post("/:creatorId/items", ShoppingCartController.addItem);


// Remove an item from a user's shopping cart
router.delete("/:creatorId/items/:itemId", ShoppingCartController.removeItem);

// Clear all items from a user's shopping cart
//router.delete("/:creatorId/items", ShoppingCartController.clearCart);


export default router;
