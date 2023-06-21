import { model, Schema } from "mongoose";
import {TICKET_STATUS} from "./TicketSaleStatsModel";
export interface ITicket {
    name: string;
    uuid?: string;
    event_id: string;
    owner_id: string;
    price: number;
    date: string;
    location_id: string;
    isUsed: boolean;
    status: TICKET_STATUS;
}

const ticketSchema = new Schema<ITicket>({
    name: { type: String, required: true },
    uuid: { type: String, required: false },
    event_id: { type: String, required: true },
    owner_id: { type: String, required: true },
    price: { type: Number, required: true },
    date: { type: String, required: true },
    location_id: { type: String, required: true },
    isUsed: { type: Boolean, required: true, default: false },
    status: { type: String, required: true, default: "pending" }
})

const TicketModel = model<ITicket>("TicketModel", ticketSchema)
export default TicketModel;