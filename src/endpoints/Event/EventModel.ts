import {model , Schema} from 'mongoose';

type ticketInfoObject = {
    ticketTypes: object[];
    name: string;
    price: number;
    available: number;
}

export interface IEvent {
    _id?: string;
    stripe_id?: string;
    title: string;
    description: string;
    date: Date;
    time: string;
    location: string;
    category: string;
    tags: string[];
    organizer: string;
    image: string;
    ticketInfo: ticketInfoObject;
}

const eventSchema = new Schema<IEvent>({
    title: {type: String, required: true},
    stripe_id: {type: String, required: true},
    description: {type: String, required: true},
    date: {type: Date, required: true},
    time: {type: String, required: true},
    location: {type: String, required: true},
    category: {type: String, required: true},
    tags: {type: [String], required: true},
    organizer: {type: String, required: true},
    image: {type: String, required: true},
    ticketInfo: {type: Object, required: true}
})

const EventModel = model<IEvent>("EventModel", eventSchema)

export default EventModel;