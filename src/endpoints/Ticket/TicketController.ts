import {Request, Response } from "express";
import TicketModel from "./TicketModel";
import { Document } from "mongoose"

const create = (req: Request, res: Response) => {
    TicketModel.create(req.body)
        .then((data) => {
            return res.status(201).json(data);})
        .catch((err) => {
            return res.status(500).json({message: err.message});
        });
}
export default { create };