import TagModel from "./TagModel";
import {Request, Response} from "express";

const getAll = async (req: Request, res: Response) => {
    const tags = await TagModel.find();
    return res.status(200).json({tags: tags});
}

export default {
    getAll
}