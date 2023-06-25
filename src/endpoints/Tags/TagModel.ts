import mongoose from "mongoose";
// eslint-disable-next-line @typescript-eslint/ban-ts-comment
// @ts-ignore
import {v4 as uuidv4} from 'uuid';


const tagSchema = new mongoose.Schema({
    _id: {type: String, required: true},
    name: {type: String, required: true},
    url_param: {type: String, required: false},
})

tagSchema.pre("save", function (next) {
    this.url_param = this.name.toLowerCase().replace(/ /g, "-");
    next();
})

const TagModel = mongoose.model("TagModel", tagSchema)

export default TagModel;