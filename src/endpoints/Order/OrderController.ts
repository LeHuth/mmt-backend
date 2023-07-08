import {OrderModel} from "./OrderModel";


const createOrder = async (userId: string, products: string[], total: number) => {
    const order = new OrderModel({
        userId: userId,
        products: products,
        total: total
    });
    return await order.save();
}


export default {
    createOrder
}