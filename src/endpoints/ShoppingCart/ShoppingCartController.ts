import {Request, Response} from 'express';
import ShoppingCartModel, {IShoppingCartItem} from './ShoppingCartModel';
import jwt from "jsonwebtoken";
import {IJWTPayload} from "../../helper";
import EventModel from "../Event/EventModel";

export const getTokenAndDecode = async (req: Request, res: Response) => {
    const token = req.headers.authorization?.split(" ")[1];
    if (!token) {
        console.log("No token provided");
        return null;
    }
    try {
        return await jwt.verify(token, process.env.JWT_SECRET as string);
    } catch (e) {
        console.error("Invalid token");
        return null;
    }

}

const updateTotalPrice = async (user_id: string) => {
    const shoppingCart = await ShoppingCartModel.findOne({user_id: user_id});
    if (!shoppingCart) {
        console.log("No shopping cart found");
        return;
    }
    const total = shoppingCart.items.reduce((acc: number, item: any) => acc + item.amount * item.price, 0);
    console.log("Total price: ", total);
    await ShoppingCartModel.updateOne({user_id: shoppingCart.user_id}, {$set: {totalPrice: total}});
    await shoppingCart.save();
    return;
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
        console.log("No shopping cart found")
        const newShoppingCart = new ShoppingCartModel({
            user_id: user_id,
            items: newItems,
            totalPrice: newItems.reduce((acc, item) => acc + item.amount * item.price, 0)
        });
        await newShoppingCart.save();
        return res.status(200).json({message: "Shopping cart created", shoppingCart: newShoppingCart});
    } else {
        for (const item of newItems) {
            const index = shoppingCart.items.findIndex(i => i.event_id === item.event_id);
            if (index === -1) {
                shoppingCart.items.push(item);
            } else {
                shoppingCart.items[index].amount += item.amount;
                await shoppingCart.save();
                await ShoppingCartModel.updateOne({user_id: shoppingCart.user_id}, {$set: {items: shoppingCart.items}});
            }
        }

        //update total price

        await shoppingCart.save();

        await updateTotalPrice(shoppingCart.user_id);
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

    const event_id = req.params.event_id;
    const index = shoppingCart.items.findIndex(item => item.event_id === event_id);
    if (index === -1) {
        return res.status(404).json({message: "Item not found"});
    }
    shoppingCart.items.splice(index, 1);
    await shoppingCart.save();
    await updateTotalPrice(shoppingCart.user_id);
    return res.status(200).json({message: "Item removed", shoppingCart: shoppingCart});


}

const get = async (req: Request, res: Response) => {
    const decoded = await getTokenAndDecode(req, res);
    if (!decoded) {
        return res.status(401).json({message: "Invalid credentials"});
    }

    const user_id = (decoded as IJWTPayload).user.id;

    const shoppingCart = await ShoppingCartModel.findOne({user_id: user_id});

    if (!shoppingCart) {
        return res.status(404).json({message: "Shopping cart not found"});
    }
    const returnItems = [];
    for (const cartItem in shoppingCart.items) {
        // @ts-ignore
        const item = cartItem as IShoppingCartItem
        const event = await EventModel.findOne({event_id: item.event_id});
        if (!event) {
            return res.status(404).json({message: "Event not found"});
        }
        returnItems.push({
            ...event.toObject(),
            amount: item.amount,
        })
    }

    return res.status(200).json({
        message: "Shopping cart found",
        shoppingCart: {...shoppingCart.toObject(), returnItems: returnItems}
    });
}

const updateItem = async (req: Request, res: Response) => {
    const decoded = await getTokenAndDecode(req, res);
    if (!decoded) {
        return res.status(401).json({message: "Invalid credentials"});
    }

    const user_id = (decoded as IJWTPayload).user.id;

    let shoppingCart = await ShoppingCartModel.findOne({user_id: user_id});

    if (!shoppingCart) {
        return res.status(404).json({message: "Shopping cart not found"});
    }

    const amount: string = req.query.amount as string

    if (!amount) {
        return res.status(400).json({message: "No amount provided"});
    }

    if (parseInt(amount) < 1 || parseInt(amount) > 10) {
        return res.status(400).json({message: "Amount must be between 1 and 10"});
    }

    const event_id = req.params.event_id;
    const index = shoppingCart.items.findIndex(item => item.event_id === event_id);
    if (index === -1) {
        return res.status(404).json({message: "Item not found"});
    }
    shoppingCart.items[index].amount = parseInt(amount);
    await shoppingCart.save();
    await ShoppingCartModel.updateOne({user_id: shoppingCart.user_id}, {$set: {items: shoppingCart.items}});

    await updateTotalPrice(user_id);

    shoppingCart = await ShoppingCartModel.findOne({user_id: user_id});
    return res.status(200).json({message: "Item updated", shoppingCart: shoppingCart});
}

export default {add, remove, get, updateItem}