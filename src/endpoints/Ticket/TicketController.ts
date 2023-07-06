import {Request, Response} from "express";
import TicketModel from "./TicketModel";
import TicketSaleStatsModel from "./TicketSaleStatsModel";
import {extractUserIdFromToken} from "../../helper";
import EventLocationModel from "../EventLocation/EventLocationModel";
import ReviewModel from "../Review/ReviewModel";

const create = (req: Request, res: Response) => {
    TicketModel.create(req.body)
        .then((data) => {
            return res.status(201).json(data);
        })
        .catch((err) => {
            return res.status(500).json({message: err.message});
        });
}

const get = (req: Request, res: Response) => {
    TicketModel.findById(req.params.id).then((data) => {
        return res.status(200).json(data);
    }).catch((err) => {
        return res.status(500).json({message: err.message});
    })
}

const deleteById = (req: Request, res: Response) => {
    TicketModel.findByIdAndDelete(req.params.id).then((data) => {
        return res.status(200).json(data);
    }).catch((err) => {
        return res.status(500).json({message: err.message});
    });
}

const createTicketSaleStats = (event_id: string, totalTickets: number) => {
    TicketSaleStatsModel.find({event_id: event_id}).then((data) => {
        if (data.length == 0) {
            TicketSaleStatsModel.create({event_id: event_id, totalTickets: totalTickets}).then((data) => {
                console.log("Ticket sale stats created for event: " + event_id);
                return true;
            }).catch((err) => {
                console.log(err);
                return false;
            })
        } else {
            console.log("Ticket sale stats already exists for this event.")
            return;
        }
    }).catch((err) => {
        console.log(err);
        return false;
    })
}

const getReviewReady = (req: Request, res: Response) => {
    console.log('getReviewReady');
    if (!req.headers.authorization) return res.status(401).json({message: "No authorization header provided."});
    const jwt = req.headers.authorization.split(" ")[1];
    extractUserIdFromToken(jwt, async (err, userId) => {
        const returnData = [];
        if (err) return res.status(401).json({message: err.message});
        const tickets = await TicketModel.find({owner_id: userId, event_id: req.body.event_id})
        if (tickets.length == 0) return res.status(404).json({message: "No ticket found for this event."});
        for (const ticket of tickets) {
            const review = await ReviewModel.find({ticket_id: ticket._id, user_id: ticket.owner_id});
            if (review.length > 0) continue;
            const location = await EventLocationModel.findById(ticket.location_id);
            if (!location) return res.status(404).json({message: "No location found for this ticket."});
            const returnTicket = {
                ticket_id: ticket._id,
                event_id: ticket.event_id,
                owner_id: ticket.owner_id,
                location_id: ticket.location_id,
                location_name: location.name,
                date: ticket.date,
                name: ticket.name
            }
            returnData.push(returnTicket);
        }
        return res.status(200).json(returnData);
    })
}


export default {create, get, deleteById, createTicketSaleStats, getReviewReady};