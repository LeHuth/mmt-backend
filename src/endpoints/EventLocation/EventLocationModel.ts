import {model, Schema} from 'mongoose';
import axios from "axios";
export interface IAddress {
    street: string;
    houseNumber: string;
    zipCode: string;
    city: string;
    country: string;
}

export interface ILocation {
    latitude: number;
    longitude: number;
}

export interface IOpenHours {
    monday: string;
    tuesday: string;
    wednesday: string;
    thursday: string;
    friday: string;
    saturday: string;
    sunday: string;
}

export interface IEventLocation {
    name: string;
    address: IAddress;
    location?: ILocation;
    openHours?: IOpenHours;
    description?: string;
}

const eventSchema = new Schema<IEventLocation>({
    name: {type: String, required: true},
    address: {
        street: {type: String, required: true},
        houseNumber: {type: String, required: true},
        zipCode: {type: String, required: true},
        city: {type: String, required: true},
        country: {type: String, required: true}
    },
    location: {
        latitude: {type: Number, required: false},
        longitude: {type: Number, required: false}
    },
    openHours: {
        monday: {type: String, required: false},
        tuesday: {type: String, required: false},
        wednesday: {type: String, required: false},
        thursday: {type: String, required: false},
        friday: {type: String, required: false},
        saturday: {type: String, required: false},
        sunday: {type: String, required: false}
    },
    description: {type: String, required: false}
})

eventSchema.methods.computeLocation = async function(address : IAddress): Promise<void> {

    const url = "https://nominatim.openstreetmap.org/search?format=json&street=" + address.street + "+" + address.houseNumber + "&city=" + address.city + "&country=" + address.country + "&postalcode=" + address.zipCode;
    const response = await axios.get(url);
    const data = response.data;
    if(data.length > 0){
        this.location = {
            latitude: parseFloat(data[0].lat),
            longitude: parseFloat(data[0].lon)
        }
    } else{
        this.location = {
            latitude: 0,
            longitude: 0
        }
    }
}

const EventLocationModel = model<IEventLocation>("EventLocation", eventSchema)

export default EventLocationModel;