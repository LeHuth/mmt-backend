import express, { Request, Response } from 'express';
import bcrypt from "bcryptjs"
import UserModel from './UserModel';

const registration = async (req: Request, res: Response) => {
    const { username, email, password, isAdmin, isOrganizer } = req.body;

    //prüfen ob daten vollständig
    if( !username || !email || !password){
        return res.status(400).json({ message: "Please provide all required fields" });
    }
    
    //prüfen ob daten korrekt
    //Email valide
    const validEmail: RegExp = /^[\w.-]+@[a-zA-Z0-9]+\.[a-zA-Z]{2,}$/i;
    if(validEmail.test(email) == false){
        return res.status(400).json({ message: "Invalid Email address" });
    }
    //Username unique
    if( await UserModel.findOne({username}) ){
       return res.status(400).json({ message: "Username is already taken" });
    }

    //paswort hashen
    const hashedPassword = await bcrypt.hash(password, 10);

    //user ertsellen und daten darin speichern
    const user = new UserModel({username, email, hashedPassword, isAdmin, isOrganizer});

    //user in datenbank speichern
    await user.save();

    //response dass user erstellt wurde
    res.status(201).json({message: "User registered successfully"});
}

export default { registration }

