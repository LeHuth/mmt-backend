import CategoryModel from "./CategoryModel";
import {Request, Response} from "express";
import EventModel from "../Event/EventModel";


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
        const allEvents = await EventModel.find()
        const allCategories = await CategoryModel.find()
        for (const category of allCategories) {
            const event_count = await EventModel.find({category: category._id}).count()
            await CategoryModel.findOneAndUpdate({_id: category._id}, {$set: {amount: event_count}})
        }
        /*for (const event of allEvents) {
            await CategoryModel.findOneAndUpdate({_id: event.category}, {$inc: {amount: 1}})
        }*/
        const categories = await CategoryModel.find({amount: {$gt: 0}});

        res.status(200).json({value: categories});
    } catch (error) {
        res.status(404).json({message: error});
    }
}

export default {getAllCategories, getActiveCategories}