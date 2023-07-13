import {Request, Response} from "express";
import TicketModel from "./TicketModel";
import TicketSaleStatsModel from "./TicketSaleStatsModel";
import {extractUserIdFromToken} from "../../helper";

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
const validate = (req: Request, res: Response) => {
    TicketModel.findOne({_id: req.params.uuid}).then((ticket) => {
        if (!ticket) {
            return res.status(404).json({success: false, message: "Ticket nicht gefunden."});
        }
        if (ticket.isUsed) {
            return res.status(409).json({
                success: false,
                message: "Ticket ist bereits verwendet.",
                usage: ticket.validatedAt
            });
        }
        ticket.isUsed = true;
        ticket.validatedAt = new Date().toLocaleString();
        ticket.save()
            .then(() => {
                return res.status(200).json({success: true, message: "Ticket validiert.", usage: ticket.validatedAt});
            })
            .catch((err) => {
                return res.status(500).json({success: false, message: err.message});
            });
    })
        .catch((err) => {
            return res.status(500).json({success: false, message: err.message});
        });
};

const getReviewReady = (req: Request, res: Response) => {
    console.log('getReviewReady');
    if (!req.headers.authorization) return res.status(401).json({message: "No authorization header provided."});
    const jwt = req.headers.authorization.split(" ")[1];
    extractUserIdFromToken(jwt, async (err, userId) => {
        if (err) return res.status(401).json({message: err.message});
        const tickets = await TicketModel.find({
            owner_id: userId,
            event_id: req.body.event_id,
            reviewed: false
        }).populate({path: 'location_id', select: 'name', model: 'EventLocation'}).populate({
            path: 'event_id',
            select: 'name'
        });
        return res.status(200).json(tickets);
    })
}


export default {create, get, deleteById, createTicketSaleStats, getReviewReady, validate};