import {model , Schema} from 'mongoose';

export interface IEvent {
    title: string;
    description: string;
    date: Date;
    time: string;
    location: string;
    category: string;
    tags: string[];
    organizer: string;
    image: string;
    available: number;
    price: number;
}

const eventSchema = new Schema<IEvent>({
    title: {type: String, required: true},
    description: {type: String, required: true},
    date: {type: Date, required: true},
    time: {type: String, required: true},
    location: {type: String, required: true},
    category: {type: String, required: true},
    tags: {type: [String], required: true},
    organizer: {type: String, required: true},
    image: {type: String, required: true},
    available: {type: Number, required: true},
    price: {type: Number, required: true}
})

const EventModel = model<IEvent>("EventModel", eventSchema)

export default EventModel;