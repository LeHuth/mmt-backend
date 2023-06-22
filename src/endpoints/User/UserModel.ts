import {model, Schema} from "mongoose"
import bcrypt from "bcryptjs"
// eslint-disable-next-line @typescript-eslint/ban-ts-comment
// @ts-ignore
import {v4 as uuidv4} from 'uuid';

export interface IUser {
    _id: string
    username?: string
    fist_name: string
    last_name: string
    email: string
    password?: string;
    isAdmin: boolean;
    isOrganizer: boolean;
    isVerified: boolean;
    stripe_id: string;
    checkout_session_id?: string[];
}

// todo: implement method to check password (used for login)
interface IUserMethods {
    checkPassword: (password: string) => Promise<boolean>
}

// basic user schema, extend this for more complex users
const userSchema = new Schema<IUser>({
    _id: {type: String, required: true, default: uuidv4()},
    username: {type: String, unique: false, required: false},
    fist_name: {type: String, required: true},
    last_name: {type: String, required: true},
    email: {type: String, unique: true, required: true},
    password: {type: String, required: true},
    isAdmin: {type: Boolean, required: true, default: false},
    isOrganizer: {type: Boolean, required: true, default: false},
    stripe_id: {type: String, required: true},
    isVerified: {type: Boolean, default: false},
    checkout_session_id: {type: [String], required: false, default: []}
})

userSchema.method("checkPassword", async function (password: string): Promise<boolean> {
    if (!this.password) {
        throw new Error("Passwort nicht gespeichert.");
    }
    return await bcrypt.compare(password, this.password);
});

userSchema.pre("save", async function (next) {
    this._id = uuidv4();
    next();
});

const UserModel = model<IUser>("UserModel", userSchema)
export default UserModel;