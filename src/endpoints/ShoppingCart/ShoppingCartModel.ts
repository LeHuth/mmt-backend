import { Schema, model } from "mongoose"
import TicketModel from "../Ticket/TicketModel";
import EventModel from "../Event/EventModel";

interface IShoppingCart{
    creatorId: string;
    items: {[event: string]: number};
    totalPrice: number;
}

const shoppingCartSchema = new Schema<IShoppingCart> ({
    creatorId: {type: String, unique: true, required: true},
    items: {type: {String: Number}},
    totalPrice: {type: Number, default: 0}
})

const ShoppingCartModel = model("ShoppingCartModel", shoppingCartSchema)
export default ShoppingCartModel;