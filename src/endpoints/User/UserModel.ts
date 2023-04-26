import { Schema, model } from "mongoose"

interface IUser{
    username: string
    email: string
    password: string;
}

const userSchema = new Schema<IUser> ({
    username: { type: String, unique: true, required: true },
    email: {type: String, required: true }
})