import express, { Request, Response } from 'express';
import bcrypt from "bcryptjs"
import UserModel from './UserModel';
import UserRoutes from "./UserRoutes";

const registration = async (req: Request, res: Response) => {
    const { username, email, password, isAdmin, isOrganizer } = req.body;

    //prüfen ob daten vollständig
    if( !username || !email || !password){
        return res.status(400).json({ message: "Please provide all required fields" });
    }
    
    //prüfen ob daten korrekt
    //TODO: expresss-validator nutzen
    const validEmail: RegExp = /^[\w.-]+@[a-zA-Z0-9]+\.[a-zA-Z]{2,}$/i;
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

export default { registration }

