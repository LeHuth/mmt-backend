import mongoose from "mongoose";
// eslint-disable-next-line @typescript-eslint/ban-ts-comment
// @ts-ignore
import {v4 as uuidv4} from 'uuid';

export interface IReview {
    _id: string;
    event_id: string;
    user_id: string;
    rating: number;
    comment: string;
}

const ReviewSchema = new mongoose.Schema({
    _id: {type: String, required: true},
    event_id: {type: String, required: true},
    user_id: {type: String, required: true},
    rating: {type: Number, required: true},
    comment: {type: String, required: true}
});

ReviewSchema.pre("save", function (next) {
    this._id = uuidv4();
    next();
});

const ReviewModel = mongoose.model("Review", ReviewSchema);

export default ReviewModel;