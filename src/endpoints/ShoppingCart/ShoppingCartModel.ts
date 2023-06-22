import {model, Schema} from "mongoose"

export interface IShoppingCartItem {
    event_id: string;
    amount: number;
    price: number;
}

interface IShoppingCart {
    user_id: string;
    items: IShoppingCartItem[]
    totalPrice: number;
}

const shoppingCartSchema = new Schema<IShoppingCart>({
    user_id: {type: String, unique: true, required: true},
    items: {type: [Object], required: false, default: []},
    totalPrice: {type: Number, required: false, default: 0}
})

const ShoppingCartModel = model("ShoppingCartModel", shoppingCartSchema)
export default ShoppingCartModel;