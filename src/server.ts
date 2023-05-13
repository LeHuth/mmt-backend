import express from "express";
import mongoose from "mongoose";
import dotenv from "dotenv";
import cors from "cors";
import * as process from "process";

import EventRoutes from "./endpoints/Event/EventRoutes";
import UserRoutes from "./endpoints/User/UserRoutes";
import UserModel from "./endpoints/User/UserModel";
import {createDefaultAdmin, createDefaultOrganizer, createDefaultUser} from "./helper";

dotenv.config();
const app = express();
app.use(cors());
app.use(express.json({limit: '50mb'}));
// @ts-ignore
app.use(express.json());

app.use('/events',EventRoutes)
app.use('/users', UserRoutes);

// todo: maybe extract this function to a separate file
async function connectToMongo() {
    console.log('Connecting to MongoDB...');
try {
    if(!process.env.MONGO_URI) {
        throw new Error("MONGO_URI is not defined");
    }
    const connection = await mongoose.connect(process.env.MONGO_URI);
    console.log('MongoDB connected');
    //add function that creates admin user if it doesn't exist
    await createDefaultAdmin();
    await createDefaultOrganizer();
    await createDefaultUser();

} catch (error) {
    console.error('Error connecting to MongoDB:', error);
}
}
connectToMongo().then(() => {
    if(!process.env.PORT) {
        throw new Error("PORT is not defined");
    }
    app.listen(process.env.PORT, () => {
        console.log(`Server started on ${process.env.PORT}`);
    });
})

export default app;
