import {Request, Response} from "express";
import EventModel from "./EventModel";
import {Document} from "mongoose";

const teapot = (req:Request, res:Response) => {
    return res.status(418).json({message: "I'm a teapot"});
};

const create = (req:Request, res: Response) => {
    EventModel.create(req.body).then((data:Document) => {
        return res.status(201).json(data);
    }).catch((err) => {
        return res.status(500).json({message: err.message});
    });
}

const getAll = (req:Request, res:Response) => {
    EventModel.find().then((data:Document[]) => {
        return res.status(200).json(data);
    }).catch((err) => {
        return res.status(500).json({message: err.message});
    });
}

export default {teapot, create, getAll};