import mongoose from "mongoose";
import {TICKET_STATUS} from "../Ticket/TicketSaleStatsModel";
// eslint-disable-next-line @typescript-eslint/ban-ts-comment
// @ts-ignore
import {v4 as uuidv4} from 'uuid';

export interface IOrder {
    _id: string;
    userId: string;
    products: string[];
    total: number;
    status: TICKET_STATUS;
    createdAt: Date;
}


const OrderSchema = new mongoose.Schema<IOrder>({
    _id: {type: String, required: false, default: uuidv4()},
    userId: {type: String, required: true},
    products: {type: [String], required: true},
    total: {type: Number, required: true},
    status: {type: String, required: false, default: "pending"},
    createdAt: {type: Date, required: false, default: Date.now}
});


export const OrderModel = mongoose.model<IOrder>("Order", OrderSchema);
