import ReviewModel from "./ReviewModel";
import {Request, Response} from "express";


export const getReviews = async (req: Request, res: Response) => {
    try {
        const reviews = await ReviewModel.find();
        res.status(200).json({value: reviews});
    } catch (error) {
        res.status(404).json({message: error});
    }
}

export const getReviewsByEventId = async (req: Request, res: Response) => {
    try {
        const reviews = await ReviewModel.find({event: req.params.id});
        res.status(200).json({value: reviews});
    } catch (error) {
        res.status(404).json({message: error});
    }
}

export const getReviewsByUserId = async (req: Request, res: Response) => {
    try {
        const reviews = await ReviewModel.find({user: req.params.id});
        res.status(200).json({value: reviews});
    } catch (error) {
        res.status(404).json({message: error});
    }
}

export const createReview = async (req: Request, res: Response) => {
    try {
        const review = await ReviewModel.create(req.body);
        res.status(201).json({value: review});
    } catch (error) {
        res.status(404).json({message: error});
    }
}

/*
export const updateReview = async (req: Request, res: Response) => {
    try {

    } catch (error) {

    }
}*/

export const deleteReview = async (req: Request, res: Response) => {
    try {
        const review = await ReviewModel.findByIdAndDelete(req.params.id);
        res.status(200).json({value: review});
    } catch (error) {
        res.status(404).json({message: error});
    }
}

export default {getReviews, getReviewsByEventId, getReviewsByUserId, createReview, deleteReview}
