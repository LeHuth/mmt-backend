import {Request, Response} from 'express';
import jwt from 'jsonwebtoken';
import bcrypt from "bcryptjs"
import UserModel from './UserModel';
import * as process from "process";
import paymentController from "../Payment/PaymentController";
import {Types} from "mongoose";

const registration = async (req: Request, res: Response) => {
    const {username, email, password, isAdmin, isOrganizer, first_name, last_name, base_url} = req.body;

    //prüfen ob daten vollständig
    if (!email || !password) {
        return res.status(400).json({message: "Please provide all required fields"});
    }

    //prüfen ob daten korrekt
    //TODO: expresss-validator nutzen
    const validEmail = /^[\w.-]+@[a-zA-Z0-9]+\.[a-zA-Z]{2,}$/i;
    if (!validEmail.test(email)) {
        return res.status(400).json({message: "Invalid Email address"});
    }

    //Email unique
    if (await UserModel.findOne({email})) {
        return res.status(400).json({message: "Email is already taken"});
    }


    // TODO: extract hashing to a separate function
    //paswort hashen
    const hashedPassword = await bcrypt.hash(password, 10);
    if (isOrganizer) {
        const data = await paymentController.createAccount(email, first_name, last_name, base_url);
        UserModel.create({
            fist_name: first_name,
            last_name: last_name,
            email: email,
            isAdmin: isAdmin,
            isOrganizer: isOrganizer,
            password: hashedPassword,
            stripe_id: data.account_data.id
        }).then((user) => {
            return res.status(201).send({user: user, account_link: data.account_link});
        }).catch((error) => {
            console.error(error);
            return res.status(500).json({error: "Error creating user"});
        });

    } else {
        const data = await paymentController.createCustomer(email, first_name, last_name,);
        //user erstellen und in db speichern,
        UserModel.create({
            fist_name: first_name,
            last_name: last_name,
            email: email,
            isAdmin: isAdmin,
            isOrganizer: isOrganizer,
            password: hashedPassword,
            stripe_id: data.id
        })
            .then((user) => {
                res.status(201).json({
                    _id: user._id,
                    fist_name: user.fist_name,
                    last_name: user.last_name,
                    email: user.email,
                    isAdmin: user.isAdmin,
                    isOrganizer: user.isOrganizer,
                    stripe_id: user.stripe_id
                });
            }).catch((error) => {
            console.error(error);
            res.status(500).json({error: "Error creating user"});
        });
    }
}

const login = async (req: Request, res: Response) => {

    const {email, password} = req.body;

    try {
        // Authenticate user
        const user = await UserModel.findOne({email});
        if (!user || !user.password) {
            console.log('User not found');
            return res.status(400).json({msg: 'Invalid email or password'});
        }

        const isMatch = await bcrypt.compare(password, user.password);
        if (!isMatch) {
            console.log('Invalid credentials');
            return res.status(400).json({msg: 'Invalid email or password'});
        }

        // Generate JWT
        const payload = {
            user: {
                id: user.id
            }
        };

        if (!process.env.JWT_SECRET) {
            return res.status(500).json({msg: 'Server error'});
        }
        try {
            const token = jwt.sign(payload, process.env.JWT_SECRET, {expiresIn: '1h'});
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

const getUserById = async (req: Request, res: Response) => {
    try {
        const user = await UserModel.findById(req.params.id).select('-password');
        if (!user) {
            return res.status(404).json({msg: 'User not found'});
        }
        res.json(user);
    } catch (err) {
        console.error(err);
        res.status(500).send('Server error');
    }
}

const deleteUserById = async (req: Request, res: Response) => {
    try {
        const deletedUser = await UserModel.findByIdAndDelete(req.params.id);
        if (!deletedUser) {
            return res.status(404).send({msg: 'User not found'});
        } else {
            console.log('User deleted')
            return res.status(204).send({msg: 'User deleted'});
        }
    } catch (err) {
        console.error(err);
        return res.status(500).send('Server error');
    }
}

const listLineItems = async (stripe :any, checkouts: object[]) => {
    // @ts-ignore
    const returnItems = [];
    for(const items of checkouts) {
        // @ts-ignore
        const lineItems = await stripe.checkout.sessions.listLineItems(items.id);
        returnItems.push(lineItems);
    }
    // @ts-ignore
    return returnItems;
}

const getProdcts = async (items: object[], stripe: any) => {
    const returnItems = [];
    for(const item of items) {
        // @ts-ignore
        for (const data of item.data) {
            // @ts-ignore
            const product = await stripe.products.retrieve(data.price.product);
            returnItems.push(product);
        }

    }
    // @ts-ignore
    return returnItems;
}

const getOrderHistory = async (req: Request, res: Response) => {
    const user_id = req.params.user_id;
    console.log(req.params);
    try {
        const user = await UserModel.findById(user_id).select('-password');
        if (!user) {
            console.log('User not found')
            return res.status(404).json({msg: 'User not found'});
        }
        //console.log(user)

        // eslint-disable-next-line @typescript-eslint/no-var-requires
        const stripe = require('stripe')(process.env.STRIPE_SECRET_KEY);

        const checkout_sessions = await stripe.checkout.sessions.list({
            // @ts-ignore
            customer: user.stripe_id,
        });
        //console.log('checkout_sessions ',checkout_sessions)
        const paid_checkouts = checkout_sessions.data.filter((session: any) => {
            return session.payment_status === 'paid';
        });

        const items = await listLineItems(stripe, paid_checkouts);
        console.log('items ',items.length)
        const products = await getProdcts(items, stripe);
        console.log('products ',products.length)
        return res.status(200).send({products: products});

    } catch (err) {
        console.error(err);
        res.status(500).send('Server error');
    }
}

export default {registration, login, getUserById, deleteUserById ,getOrderHistory};

