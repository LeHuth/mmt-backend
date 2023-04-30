import {Request, Response} from "express";

const teapot = (req:Request, res: Response) => {
    return res.status(418).json({message: "I'm a teapot"});
};

export default teapot;