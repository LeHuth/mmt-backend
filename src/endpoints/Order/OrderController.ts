import {OrderModel} from "./OrderModel";
// eslint-disable-next-line @typescript-eslint/ban-ts-comment
// @ts-ignore
import {v4 as uuidv4} from 'uuid';

const createOrder = async (userId: string, products: string[], total: number) => {
    const order = new OrderModel({
        _id: uuidv4(),
        userId: userId,
        products: products,
        total: total
    });
    return await order.save();
}


export default {
    createOrder
}