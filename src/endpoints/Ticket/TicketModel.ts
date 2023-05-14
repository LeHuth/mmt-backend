import { model, Schema } from "mongoose";

export interface ITicket {
    eventId: string;
    price: number;
}

const ticketSchema = new Schema<ITicket>({
    eventId: {type: String, required: true},
    price: { type: Number, required: true}
})

const TicketModel = model<ITicket>("TicketModel", ticketSchema)
export default TicketModel;