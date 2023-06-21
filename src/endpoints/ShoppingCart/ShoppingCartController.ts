import {Request, Response} from 'express';
import ShoppingCartModel, {IShoppingCartItem} from './ShoppingCartModel';
import jwt from "jsonwebtoken";
import {IJWTPayload} from "../../helper";

const getTokenAndDecode = async (req: Request, res: Response) => {
    const token = req.headers.authorization?.split(" ")[1];
    if (!token) {
        return null;
    }
    const decoded = await jwt.verify(token, process.env.JWT_SECRET as string);
    if (!decoded) {
        return null;
    }
    return decoded;
}

const add = async (req: Request, res: Response) => {
    const decoded = await getTokenAndDecode(req, res);
    if (!decoded) {
        return res.status(401).json({message: "Invalid credentials"});
    }
    const newItems: IShoppingCartItem[] = [...req.body.items];
    if (newItems.length === 0) {
        return res.status(400).json({message: "No items provided"});
    }

    const user_id = (decoded as IJWTPayload).user.id;

    const shoppingCart = await ShoppingCartModel.findOne({user_id: user_id});

    if (!shoppingCart) {
        const newShoppingCart = new ShoppingCartModel({
            user_id: user_id,
            items: newItems,
        });
        await newShoppingCart.save();
        return res.status(200).json({message: "Shopping cart created", shoppingCart: newShoppingCart});
    } else {
        shoppingCart.items = [...shoppingCart.items, ...newItems];
        await shoppingCart.save();
        return res.status(200).json({message: "Shopping cart updated", shoppingCart: shoppingCart});
    }
}

const remove = async (req: Request, res: Response) => {
    const decoded = await getTokenAndDecode(req, res);
    if (!decoded) {
        return res.status(401).json({message: "Invalid credentials"});
    }

    const user_id = (decoded as IJWTPayload).user.id;

    const shoppingCart = await ShoppingCartModel.findOne({user_id: user_id});

    if (!shoppingCart) {
        return res.status(404).json({message: "Shopping cart not found"});
    }

    const item_id = req.params.item_id;
    const index = shoppingCart.items.findIndex(item => item.item_id === item_id);
    if (index === -1) {
        return res.status(404).json({message: "Item not found"});
    }
    shoppingCart.items.splice(index, 1);
    await shoppingCart.save();

    return res.status(200).json({message: "Item removed", shoppingCart: shoppingCart});


}

export default {add}