import express, { Request, Response } from 'express';
import bcrypt from "bcryptjs"

const app = express();


//User endpunkt definieren, keine ahnung ob das mit dem api/register klappt
app.post("/api/register", async (req: Request, res: Response) =>{

    //daten aus request extrahieren
    const { username, email, password, isAdmin, isOrganizer } = req.body;

    //prüfen ob daten vollständig
    if( !username || !email || !password){
        //wenn nicht --> response
        return res.status(400).json({ message: "Please provide all required fields" });
    }

    //paswort hashen
    const hashedPassword = await bcrypt.hash(password, 10);

    //user ertsellen und daten darin speichern
    const user = {username, email, hashedPassword, isAdmin, isOrganizer};

    //response dass user erstellt wurde
    res.status(201).json({message: "User registered successfully"});
});