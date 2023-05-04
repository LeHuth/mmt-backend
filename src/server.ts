import express from "express";
import mongoose from "mongoose";
import dotenv from "dotenv";
import cors from "cors";
import * as process from "process";




dotenv.config();
const app = express();
app.use(cors());
app.use(express.json({limit: '50mb'}));
// @ts-ignore
app.use(express.json());

// todo: maybe extract this function to a separate file
async function connectToMongo() {
    console.log('Connecting to MongoDB...');
try {
    if(!process.env.MONGO_URI) {
        throw new Error("MONGO_URI is not defined");
    }
    const connection = await mongoose.connect(process.env.MONGO_URI);
    console.log('MongoDB connected');
    // todo: add function that creates admin user if it doesn't exist
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
