import { Request, Response } from "express";
import ShoppingCartModel from "./ShoppingCartModel";
import TicketModel from "../Ticket/TicketModel";
import EventModel from "../Event/EventModel";

  // Create a new shopping cart for a user
  const create = (req: Request, res: Response) => {
    ShoppingCartModel.create(req.body)
      .then((data) => {
        return res.status(201).json(data);
      })
      .catch((err: Error) => {
        return res.status(500).json({ message: err.message });
      });
  };
  
  // Retrieve a user's active shopping cart
  const read = (req: Request, res: Response) => {
    const { creatorId } = req.params;
  
    ShoppingCartModel.findOne({ creatorId })
      .then((cart) => {
        if (!cart) {
          return res.status(200).json({ items: {}, totalPrice: 0 });
        }
  
        return res.status(200).json(cart);
      })
      .catch((err: Error) => {
        return res.status(500).json({ message: err.message });
      });
  };

// Add an item to a user's shopping cart
const addItem = (req: Request, res: Response) => {
    const { creatorId } = req.params;
    const { eventId, quantity } = req.body;
  
    ShoppingCartModel.findOne({ creatorId })
      .then((cart) => {
        if (!cart) {
          return res.status(404).json({ error: "No active shopping cart found for the user" });
        }
  
        const items = cart.get("items") as { [productId: string]: number };
        const totalPrice = cart.get("totalPrice") as number;
        const itemQuantity = items[eventId] || 0;
  
        // Find the product by productId and validate its stock
        EventModel.findById(eventId)
          .then((product) => {
            if (!product) {
              return res.status(404).json({ error: "Product not found" });
            }
            if (product.available < quantity) {
              return res.status(400).json({ error: "Insufficient stock" });
            }
  
            // Adjust the item quantity and total price
            items[eventId] = itemQuantity + quantity;
            const price = product.get("price") as number;
            cart.set("totalPrice", totalPrice + price * quantity);
            product.available -= quantity;
  
            // Save the updated shopping cart
            cart
              .save()
              .then((updatedCart) => {
                return res.json(updatedCart);
              })
              .catch((err: Error) => {
                console.error("Error saving the updated shopping cart:", err);
                return res.status(500).json({ message: "Internal server error" });
              });
          })
          .catch((err: Error) => {
            console.error("Error finding the product:", err);
            return res.status(500).json({ message: "Internal server error" });
          });
      })
      .catch((err: Error) => {
        console.error("Error finding the shopping cart:", err);
        return res.status(500).json({ message: "Internal server error" });
      });
  };
  
  // Remove an item from a user's shopping cart
  const removeItem = (req: Request, res: Response) => {
    const { creatorId, eventId } = req.params;
  
    ShoppingCartModel.findOne({ creatorId })
      .then((cart) => {
        if (!cart) {
          return res.status(404).json({ error: "No active shopping cart found for the user" });
        }
  
        const items = cart.get("items") as { [eventId: string]: number };
        const totalPrice = cart.get("totalPrice") as number;
        const itemQuantity = items[eventId];
  
        if (!itemQuantity) {
          return res.status(404).json({ error: "Item not found in the shopping cart" });
        }
  
        // Find the event by eventId
        EventModel.findById(eventId)
          .then((event) => {
            if (!event) {
              return res.status(404).json({ error: "Event not found" });
            }
  
            const price = event.get("price") as number;
  
            // Remove the item from the shopping cart and adjust the total price
            delete items[eventId];
            cart.set("totalPrice", totalPrice - price * itemQuantity);
            event.available -= itemQuantity;
  
            // Save the updated shopping cart
            cart
              .save()
              .then((updatedCart) => {
                return res.json(updatedCart);
              })
              .catch((err: Error) => {
                console.error("Error saving the updated shopping cart:", err);
                return res.status(500).json({ message: "Internal server error" });
              });
          })
          .catch((err: Error) => {
            console.error("Error finding the event:", err);
            return res.status(500).json({ message: "Internal server error" });
          });
      })
      .catch((err: Error) => {
        console.error("Error finding the shopping cart:", err);
        return res.status(500).json({ message: "Internal server error" });
      });
  };

  export default {create, addItem, removeItem, read}
  
