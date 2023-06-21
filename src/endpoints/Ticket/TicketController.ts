import {Request, Response } from "express";
import TicketModel from "./TicketModel";
import TicketSaleStatsModel from "./TicketSaleStatsModel";
import { Document } from "mongoose"

const create = (req: Request, res: Response) => {
    TicketModel.create(req.body)
        .then((data) => {
            return res.status(201).json(data);})
        .catch((err) => {
            return res.status(500).json({message: err.message});
        });
}

const get = (req:Request, res:Response) => {
    TicketModel.findById(req.params.id).then((data) => {
        return res.status(200).json(data);
    }).catch((err) => {
        return res.status(500).json({message: err.message});
    })
}

const deleteById = (req:Request, res:Response) => {
    TicketModel.findByIdAndDelete(req.params.id).then((data) => {
        return res.status(200).json(data);
    }).catch((err) => {
        return res.status(500).json({message: err.message});
    });
}

const createTicketSaleStats = (event_id:string, totalTickets: number) => {
    TicketSaleStatsModel.find({event_id: event_id}).then((data) => {
        if(data.length == 0){
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



export default { create, get, deleteById, createTicketSaleStats };