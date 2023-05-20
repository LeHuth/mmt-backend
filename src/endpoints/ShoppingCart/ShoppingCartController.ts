import  { Request, Response } from 'express';
import jwt from 'jsonwebtoken';
import ShoppingCartModel from './ShoppingCartModel';
import EventModel from '../Event/EventModel';
import TicketModel from '../Ticket/TicketModel';

const add = async (req: Request, res: Response) => {
    //@ts-ignore
    ShoppingCartModel.findOne({creatorId: req.body.userId}).then((data) => {
        if(!data){
            throw new Error("keine ShoppingCart  mit creatorId gefunden")
        }
        EventModel.findOne({id: req.body.eventId}).then((event) => {
            if(!event || event.available > 1){
                throw new Error("event nicht gefunden oder keine tickets mehr da")
            }
            const ticket = new TicketModel({eventId: event.id, price: event.price})
            data.items.push(ticket)
            data.totalPrice += ticket.price
            event.available --
        })
        return res.status(200).json(data);
    }).catch((err) => {
        return res.status(500).json({message: err.message});
    });
}

const deleteOneItem = async (req: Request, res: Response) => {
    ShoppingCartModel.findOne({creatorId: req.body.userId}).then((data) => {
        if(!data){
            throw new Error("keine ShoppingCart  mit creatorId gefunden")
        }
        //todo
    })
} 

const clear = async(req: Request, res: Response) => {
    ShoppingCartModel.findOne({creatorId: req.body.user.id}).then((data) => {
        if(!data){
            throw new Error("keine ShoppingCart  mit creatorId gefunden")
        }
        data.items = [];
        //eventavialable muss für jedes Item wieder hoch gesetzt werden
        data.totalPrice = 0;
    })
}

const getAllItems = async(req: Request, res: Response) => {
    ShoppingCartModel.findOne({creatorId: req.body.user.id}).then((data) => {
        if(!data){
            throw new Error("keine ShoppingCart  mit creatorId gefunden")
        }
        return res.status(200).json(data.items);
    }).catch((err) => {
        return res.status(500).json({message: err.message});
    });
}

const getPrice = async (req: Request, res: Response) => {
    ShoppingCartModel.findOne({creatorId: req.body.user.id}).then((data) => {
        if(!data){
            throw new Error("keine ShoppingCart  mit creatorId gefunden")
        }
        return res.status(200).json(data.totalPrice);
    }).catch((err) => {
        return res.status(500).json({message: err.message});
    });
}

export default { add, clear, getAllItems, deleteOneItem, getPrice }