import {model, Schema} from 'mongoose';
import EventLocationModel from "../EventLocation/EventLocationModel";
// eslint-disable-next-line @typescript-eslint/ban-ts-comment
// @ts-ignore
import {v4 as uuidv4} from 'uuid';


export interface IHappening {
    date: Date;
    time: string;
    place: string;
}

export interface IEvent {
    _id?: string;
    stripe_id?: string;
    organizer_stripe_id?: string;
    name: string;
    quip?: string;
    description: string;
    happenings: IHappening[];
    tags: string[];
    category: string;
    organizer: string;
    images: string[];
    price: number;
    available: number;
}

const eventSchema = new Schema<IEvent>({
    _id: {type: String, required: false},
    name: {type: String, required: true},
    stripe_id: {type: String, default: 'not-set'},
    organizer_stripe_id: {type: String, default: 'not-set'},
    quip: {type: String, required: false},
    description: {type: String, required: true},
    happenings: [{
        date: {type: Date, required: true},
        time: {type: String, required: true},
        place: {type: String, ref: EventLocationModel, required: true}
    }],
    tags: {type: [String], required: true},
    category: {type: String, required: true},
    organizer: {type: String, required: true},
    images: {type: [String], required: true},
    price: {type: Number, required: true},
    available: {type: Number, required: true}
})

eventSchema.pre("save", function (next) {
    this._id = uuidv4();
    next();
});


const EventModel = model<IEvent>("EventModel", eventSchema)

export default EventModel;