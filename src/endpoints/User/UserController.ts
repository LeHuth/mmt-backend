import  { Request, Response } from 'express';
import jwt from 'jsonwebtoken';
import bcrypt from "bcryptjs"
import UserModel from './UserModel';
import * as process from "process";

const registration = async (req: Request, res: Response) => {
    const { username, email, password, isAdmin, isOrganizer } = req.body;

    //prüfen ob daten vollständig
    if( !username || !email || !password){
        return res.status(400).json({ message: "Please provide all required fields" });
    }
    
    //prüfen ob daten korrekt
    //TODO: expresss-validator nutzen
    const validEmail = /^[\w.-]+@[a-zA-Z0-9]+\.[a-zA-Z]{2,}$/i;
    if(!validEmail.test(email)){
        return res.status(400).json({ message: "Invalid Email address" });
    }
    //Username unique
    if(await UserModel.findOne({username}) ){
       return res.status(400).json({ message: "Username is already taken" });
    }

    //Email unique
    if (await UserModel.findOne({email})){
        return res.status(400).json({ message: "Email is already taken" });
    }


    // TODO: extract hashing to a separate function
    //paswort hashen
    const hashedPassword = await bcrypt.hash(password, 10);

    //user erstellen und in db speichern,
    UserModel.create({username:username, email:email, isAdmin:isAdmin, isOrganizer:isOrganizer, password:hashedPassword})
        .then((user) => {
            res.status(201).json({username: user.username, email: user.email, isAdmin: user.isAdmin, isOrganizer: user.isOrganizer});
        }).catch((error) => {
            console.error(error);
            res.status(500).json({error: "Error creating user"});
        });
    }

const login = async (req: Request, res: Response) => {

    const { email, password } = req.body;

    try {
        // Authenticate user
        const user = await UserModel.findOne({ email });
        if (!user || !user.password) {
            return res.status(400).json({ msg: 'Invalid email or password' });
        }

        const isMatch = await bcrypt.compare(password, user.password);
        if (!isMatch) {
            return res.status(400).json({ msg: 'Invalid email or password' });
        }

        // Generate JWT
        const payload = {
            user: {
                id: user.id
            }
        };

        if(!process.env.JWT_SECRET){
            return res.status(500).json({ msg: 'Server error' });
        }
        try {
            const token = jwt.sign(payload, process.env.JWT_SECRET , { expiresIn: '1h' });
            res.json({
                token,
                user: {
                    id: user.id,
                    name: user.username,
                    email: user.email
                }
            });
        } catch (err) {
            console.error(err);
            res.status(500).send('Server error');
        }
    } catch (err) {
        console.error(err);
        res.status(500).send('Server error');
    }
}

export default { registration, login }

