import mongoose from "mongoose";



const tagSchema = new mongoose.Schema({
    name: { type: String, required: true },
})

const TagModel = mongoose.model("TagModel", tagSchema)

export default TagModel;