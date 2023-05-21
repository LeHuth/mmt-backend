import {model , Schema} from 'mongoose';

export interface IEventLocation {
    name: string;
    address: string;
    latitude: number;
    longitude: number;
}

const eventSchema = new Schema<IEventLocation>({
    name: {type: String, required: true},
    address: {type: String, required: true},
    latitude: {type: Number, required: false},
    longitude: {type: Number, required: false},
})

const EventLocationModel = model<IEventLocation>("EventLocation", eventSchema)

export default EventLocationModel;