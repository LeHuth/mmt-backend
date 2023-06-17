import {model , Schema} from 'mongoose';


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
    happenings?: IHappening[];
    tags: string[];
    organizer: string;
    images: string[];
    price: number;
    available: number;
}

const eventSchema = new Schema<IEvent>({
    name: {type: String, required: true},
    stripe_id: {type: String, default: 'not-set'},
    organizer_stripe_id: {type: String, default: 'not-set'},
    quip: {type: String, required: false},
    description: {type: String, required: true},
    happenings: [{
        date: {type: Date, required: true},
        time: {type: String, required: true},
        place: {type: String, required: true}
    }],
    tags: {type: [String], required: true},
    organizer: {type: String, required: true},
    images: {type: [String], required: true},
    price: {type: Number, required: true},
    available: {type: Number, required: true}
})



const EventModel = model<IEvent>("EventModel", eventSchema)

export default EventModel;