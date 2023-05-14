import { Schema, model } from "mongoose"

interface IShoppingCart{
    creatorId: string;
    items: object[];
    totalPrice: number;
}

const shoppingCartSchema = new Schema<IShoppingCart> ({
    creatorId: {type: String, unique: true, required: true},
    items: {type: [Object]},
    totalPrice: {type: Number, default: 0}
})

const ShoppingCartModel = model("ShoppingCartModel", shoppingCartSchema)
export default ShoppingCartModel;