import ReviewModel from "./ReviewModel";
import {Request, Response} from "express";
import {extractUserIdFromToken} from "../../helper";
import UserModel from "../User/UserModel";
import TicketModel from "../Ticket/TicketModel";


export const getReviews = async (req: Request, res: Response) => {
    try {
        const reviews = await ReviewModel.find();
        res.status(200).json({value: reviews});
    } catch (error) {
        res.status(404).json({message: error});
    }
}

const addUserNameToReviews = async (reviews: any) => {
    const returnData = [];
    for (const review of reviews) {
        const user = await UserModel.findById(review.user_id)
        if (!user) return null;
        returnData.push({...review.toObject(), first_name: user.fist_name, last_name: user.last_name});
    }
    return returnData;
}

export const getReviewsByEventId = async (req: Request, res: Response) => {
    try {
        const reviews = await ReviewModel.find({event_id: req.params.id});
        const reviewsWithUserName = await addUserNameToReviews(reviews);
        res.status(200).json(reviewsWithUserName);
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
        if (!req.headers.authorization) return res.status(401).json({message: "No authorization header provided."});
        const jwt = req.headers.authorization.split(" ")[1];
        extractUserIdFromToken(jwt, async (err, userId) => {
            if (err) return res.status(401).json({message: err.message});
            req.body.user_id = userId;
            const review = await ReviewModel.create(req.body);
            await TicketModel.findOneAndUpdate({_id: req.body.ticket_id}, {reviewed: true})
            res.status(201).json({value: review});
        });


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

const getMyReviewsForEvent = async (req: Request, res: Response) => {
    if (!req.headers.authorization) return res.status(401).json({message: "No authorization header provided."});
    const jwt = req.headers.authorization.split(" ")[1];
    extractUserIdFromToken(jwt, async (err, userId) => {
        if (err) return res.status(401).json({message: err.message});
        console.log(req.params.id, userId);
        const reviews = await ReviewModel.find({event_id: req.params.id, user_id: userId});
        res.status(200).json({value: reviews});
    })
}

const getAllReviewsForEvent = async (req: Request, res: Response) => {
    try {
        const reviews = await ReviewModel.find({event_id: req.params.id});
        res.status(200).json({value: reviews});
    } catch (error) {
        res.status(404).json({message: error});
    }
}

export default {
    getReviews,
    getReviewsByEventId,
    getReviewsByUserId,
    createReview,
    deleteReview,
    getMyReviewsForEvent,
    getAllReviewsForEvent
}
