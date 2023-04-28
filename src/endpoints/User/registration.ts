import express, { Request, Response } from 'express';
import bcrypt from "bcryptjs"

const app = express();


//User endpunkt definieren, keine ahnung ob das mit dem user/register klappt
app.post("/user/registration", async (req: Request, res: Response) =>{

    //daten aus request extrahieren
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
    //if( username bereits in datenbank ){
    //  return res.status(400).json({ message: "Username is already taken" });
    //}

    //paswort hashen
    const hashedPassword = await bcrypt.hash(password, 10);

    //user ertsellen und daten darin speichern
    const user = {username, email, hashedPassword, isAdmin, isOrganizer};

    //user in datenbank speichern
    //db.collection.save(user);   ???? keine ahnung

    //response dass user erstellt wurde
    res.status(201).json({message: "User registered successfully"});
});