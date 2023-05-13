import { Schema, model } from "mongoose"

export interface IUser{
    _id: string
    username: string
    email: string
    password?: string;
    isAdmin: boolean;
    isOrganizer: boolean;
}

// todo: implement method to check password (used for login)
interface IUserMethods {
    checkPassword: (password: string) => Promise<boolean>
}
// basic user schema, extend this for more complex users
const userSchema = new Schema<IUser> ({
    username: { type: String, unique: true, required: true },
    email: {type: String, unique:true, required: true },
    password: {type: String, required: true },
    isAdmin: {type: Boolean, required: true, default: false },
    isOrganizer: {type: Boolean, required: true, default: false },
})


const UserModel = model("UserModel", userSchema)
export default UserModel;