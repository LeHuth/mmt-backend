import { Schema, model } from "mongoose"
import TicketModel from "../Ticket/TicketModel";

interface IShoppingCart{
    creatorId: string;
    items: object[];
    totalPrice: number;
}

const shoppingCartSchema = new Schema<IShoppingCart> ({
    creatorId: {type: String, unique: true, required: true},
    items: {type: [TicketModel]},
    totalPrice: {type: Number, default: 0}
})

const ShoppingCartModel = model("ShoppingCartModel", shoppingCartSchema)
export default ShoppingCartModel;