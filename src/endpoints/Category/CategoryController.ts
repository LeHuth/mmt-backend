import CategoryModel from "./CategoryModel";
import {Request, Response} from "express";


const getAllCategories = async (req: Request, res: Response) => {
    try {
        const categories = await CategoryModel.find();
        res.status(200).json({value: categories});
    } catch (error) {
        res.status(404).json({message: error});
    }
}

const getActiveCategories = async (req: Request, res: Response) => {
    try {
        const categories = await CategoryModel.find({amount: {$gt: 0}});
        res.status(200).json({value: categories});
    } catch (error) {
        res.status(404).json({message: error});
    }
}

export default {getAllCategories, getActiveCategories}