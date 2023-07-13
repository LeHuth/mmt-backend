import {model, Schema} from "mongoose";
import {TICKET_STATUS} from "./TicketSaleStatsModel";
// eslint-disable-next-line @typescript-eslint/ban-ts-comment
// @ts-ignore
import {v4 as uuidv4} from 'uuid';

export interface ITicket {
    _id?: string;
    name: string;
    uuid?: string;
    event_id: string;
    owner_id: string;
    price: number;
    date: string;
    location_id: string;
    isUsed: boolean;
    validatedAt?: string;
    status: TICKET_STATUS;
    reviewed?: boolean;
}

const ticketSchema = new Schema<ITicket>({
    _id: {type: String, required: false, default: uuidv4()},
    name: {type: String, required: true},
    uuid: {type: String, required: false},
    event_id: {type: String, required: true},
    owner_id: {type: String, required: true},
    price: {type: Number, required: true},
    date: {type: String, required: true},
    location_id: {type: String, required: true},
    isUsed: {type: Boolean, required: true, default: false},
    status: {type: String, required: true, default: "pending"},
    validatedAt: {type: String, required: false},
    reviewed: {type: Boolean, required: false, default: false}
})

const TicketModel = model<ITicket>("TicketModel", ticketSchema)
export default TicketModel;