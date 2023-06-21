import mongoose from "mongoose";
export type TICKET_STATUS = "pending" | "fulfilled" | "cancelled";
export interface ITicketSale {
    _id: string;
    event_id: string;
    user_id: string;
    date: Date;
    status: TICKET_STATUS;
}

export interface ITicketSaleStats {
    _id: string;
    event_id: string;
    soldTicketsArray?: ITicketSale[];
    totalTicketsSold?: number;
    totalTicketsAvailable?: number;
    totalTickets: number;
    totalRevenue?: number;
}

const ticketSaleStatsSchema = new mongoose.Schema<ITicketSaleStats>({
    event_id: {type: String, required: true},
    soldTicketsArray: {type: [Object], required: false, default: []},
    totalTicketsSold: {type: Number, required: false, default: 0},
    totalTicketsAvailable: {type: Number, required: false},
    totalTickets: {type: Number, required: true},
    totalRevenue: {type: Number, required: false, default: 0},
});

const TicketSaleStatsModel = mongoose.model<ITicketSaleStats>("TicketSaleStatsModel", ticketSaleStatsSchema);

export default TicketSaleStatsModel;