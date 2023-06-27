import mongoose from "mongoose";

export interface ICategory {
    _id: string;
    name: string;
    url_param: string;
    amount?: number;
}

const CategorySchema = new mongoose.Schema({
    _id: {type: String, required: true},
    name: {type: String, required: true},
    url_param: {type: String, required: false},
    amount: {type: Number, required: false, default: 0}
});

CategorySchema.pre("save", function (next) {
    this.url_param = this.name.toLowerCase().replace(/ /g, "-");
    next();
});

const CategoryModel = mongoose.model("Category", CategorySchema);

export default CategoryModel;
