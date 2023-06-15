import { model, Schema } from "mongoose";

export interface ITicket {
    name: string;
    event_id: string;
    owner_id: string;
    price: number;
    date: string;
    location_id: string;
    isUsed: boolean;
}

const ticketSchema = new Schema<ITicket>({
    name: { type: String, required: true },
    event_id: { type: String, required: true },
    owner_id: { type: String, required: true },
    price: { type: Number, required: true },
    date: { type: String, required: true },
    location_id: { type: String, required: true },
    isUsed: { type: Boolean, required: true, default: false }
})

const TicketModel = model<ITicket>("TicketModel", ticketSchema)
export default TicketModel;