import express from "express";
import mongoose from "mongoose";
import dotenv from "dotenv";
import cors from "cors";
import * as process from "process";
import router from "./routes";
import {
    createDefaultAdmin,
    createDefaultCategories,
    createDefaultEvent,
    createDefaultLocation,
    createDefaultOrganizer,
    createDefaultTags,
    createDefaultUser,
    createDefaultTicket
} from "./helper";

import PaymentController from "./endpoints/Payment/PaymentController";
// @ts-ignore
import swaggerUi from 'swagger-ui-express';
// eslint-disable-next-line @typescript-eslint/no-var-requires
const swaggerFile = require('../swagger_output.json');

dotenv.config();
const app = express();
app.use(cors());

app.use(function (req, res, next) {
    res.header("Access-Control-Allow-Origin", "*");
    res.header("Access-Control-Allow-Headers", "Origin, X-Requested-With, Content-Type, Accept");
    req.header("Access-Control-Allow-Origin");
    req.header("Access-Control-Allow-Headers");
    next();
});

app.post('/webhook', express.raw({type: 'application/json'}), PaymentController.webhook);

app.options('*', cors());
app.use(express.json({limit: '50mb'}));
// @ts-ignore
app.use(express.json());
app.use('/doc', swaggerUi.serve, swaggerUi.setup(swaggerFile));
app.use(router);

// todo: maybe extract this function to a separate file
async function connectToMongo() {
    console.log('Connecting to MongoDB...');
    try {
        if (!process.env.MONGO_URI) {
            throw new Error("MONGO_URI is not defined");
        }
        const connection = await mongoose.connect(process.env.MONGO_URI);
        console.log(connection.connection.db.databaseName);

        console.log('MongoDB connected');
        //add function that creates admin user if it doesn't exist
        await createDefaultAdmin();
        await createDefaultOrganizer();
        await createDefaultUser();
        await createDefaultLocation();
        await createDefaultTags();
        await createDefaultCategories();
        await createDefaultEvent();
        await createDefaultTicket();

    } catch (error) {
        console.error('Error connecting to MongoDB:', error);
    }
}

connectToMongo().then(() => {
    if (!process.env.PORT) {
        throw new Error("PORT is not defined");
    }
    app.listen(process.env.PORT, () => {
        console.log(`Server started on ${process.env.PORT}`);
    });
})

export default app;
