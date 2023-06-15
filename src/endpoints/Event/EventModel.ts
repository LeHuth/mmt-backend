import {model , Schema} from 'mongoose';


export interface ISchedule {
    date: Date;
    time: string;
    location_id: string;
}

export interface IEvent {
    _id?: string;
    stripe_id?: string;
    organizer_stripe_id?: string;
    title: string;
    quip?: string;
    description: string;
    schedule?: ISchedule[];
    tags: string[];
    organizer: string;
    image: string;
    price: number;
    available: number;
}

const eventSchema = new Schema<IEvent>({
    title: {type: String, required: true},
    stripe_id: {type: String, required: true},
    organizer_stripe_id: {type: String, required: true},
    quip: {type: String, required: false},
    description: {type: String, required: true},
    schedule: [{
        date: {type: Date, required: true},
        time: {type: String, required: true},
        location_id: {type: String, required: true}
    }],
    tags: {type: [String], required: true},
    organizer: {type: String, required: true},
    image: {type: String, required: true},
    price: {type: Number, required: true},
    available: {type: Number, required: true}
})

const EventModel = model<IEvent>("EventModel", eventSchema)

export default EventModel;