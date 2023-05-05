import  { Request, Response } from 'express';
import jwt from 'jsonwebtoken';
import ShoppingCartModel from './ShoppingCartModel';

const add = async (req: Request, res: Response) => {
    //@ts-ignore
    ShoppingCartModel.findOne({creatorId: req.body.user.id}).then((data) => {
        
        return res.status(200).json(data);
    }).catch((err) => {
        return res.status(500).json({message: err.message});
    });
}