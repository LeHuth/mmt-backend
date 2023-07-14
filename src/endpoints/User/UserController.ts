import {Request, Response} from 'express';
import jwt from 'jsonwebtoken';
import bcrypt from "bcryptjs"
import UserModel from './UserModel';
import * as process from "process";
import paymentController from "../Payment/PaymentController";
// @ts-ignore
import nodemailer from 'nodemailer';
// @ts-ignore
import formData from 'form-data';
import TicketModel from "../Ticket/TicketModel";
import {extractUserIdFromToken} from "../../helper";

const registration = async (req: Request, res: Response) => {
    const {username, email, password, isAdmin, isOrganizer, first_name, last_name, base_url} = req.body;

    //prüfen ob daten vollständig
    if (!email || !password) {
        return res.status(400).json({message: "Please provide all required fields"});
    }

    //prüfen ob daten korrekt
    //TODO: expresss-validator nutzen
    //const validEmail = /^[\w.-]+@[a-zA-Z0-9]+\.[a-zA-Z]{2,}$/i;
    //if (!validEmail.test(email)) {
    //   return res.status(400).json({message: "Invalid Email address"});
    //}

    //Email unique
    if (await UserModel.findOne({email})) {
        return res.status(400).json({message: "Email is already taken"});
    }


    // TODO: extract hashing to a separate function
    //paswort hashen
    const hashedPassword = await bcrypt.hash(password, 10);
    if (isOrganizer) {
        return res.status(400).json({message: "Organizer registration is not yet implemented"});
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
        //const data = await paymentController.createCustomer(email, first_name, last_name,);
        //user erstellen und in db speichern,
        UserModel.create({
            username: first_name + "-" + last_name,
            fist_name: first_name,
            last_name: last_name,
            email: email,
            isAdmin: isAdmin,
            isOrganizer: isOrganizer,
            password: hashedPassword,
            isVerified: false,
            stripe_id: 'not-verified'
        })
            .then(async (user) => {
                //const token = jwt.sign(payload, process.env.JWT_SECRET, {expiresIn: '1h'});
                const token = jwt.sign({userId: user._id}, process.env.JWT_SECRET as string, {expiresIn: '2h'});

                const transporter = nodemailer.createTransport({
                    host: "live.smtp.mailtrap.io",
                    port: 465,
                    auth: {
                        user: "api",
                        pass: process.env.MAILTRAP_API_KEY
                    }
                });

                // send mail with defined transport object
                const info = await transporter.sendMail({
                    from: 'signup@mapmytickets.de', // sender address
                    to: [user.email], // list of receivers
                    subject: "Account Verification", // Subject line
                    text: 'Please verify your account by clicking the link: https://api.mapmytickets.de/users/confirmation/' + token + '\n', // plain text body
                    //html: "<b>Hello world!</b>", // html body
                });
                console.log("Message sent: %s", info.messageId);
                res.status(201).json({msg: 'User created, please verify your email'});
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

        if (!user.isVerified) {
            console.log('User not verified');
            return res.status(400).json({msg: 'Please verify your email'});
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

const listLineItems = async (stripe: any, checkouts: object[]) => {
    // @ts-ignore
    const returnItems = [];
    for (const items of checkouts) {
        // @ts-ignore
        const lineItems = await stripe.checkout.sessions.listLineItems(items.id);
        returnItems.push(lineItems);
    }
    // @ts-ignore
    return returnItems;
}

const getProdcts = async (items: object[], stripe: any) => {
    const returnItems = [];
    for (const item of items) {
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
        if (!user_id) {
            return res.status(400).json({msg: 'no user id'});
        }
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
        console.log('items ', items.length)
        const products = await getProdcts(items, stripe);
        console.log('products ', products.length)
        return res.status(200).send({products: products});

    } catch (err) {
        console.error(err);
        res.status(500).send('Server error');
    }
}

const sendMail = async (req: Request, res: Response) => {

    // create reusable transporter object using the default SMTP transport
    const transporter = nodemailer.createTransport({
        host: "live.smtp.mailtrap.io",
        port: 25,
        auth: {
            user: "api",
            pass: process.env.MAILTRAP_API_KEY
        }
    });

    // send mail with defined transport object
    const info = await transporter.sendMail({
        from: 'signup@mapmytickets.de', // sender address
        to: "bht.playtest@gmail.com", // list of receivers
        subject: "Account Verification", // Subject line
        text: 'Please verify your account by clicking the link: \nhttp://' + req.headers.host + '/users/confirmation/' + 'my-token' + '.\n',
    },);
    return res.status(200).send({msg: info.response});

}

const confirmation = async (req: Request, res: Response) => {
    try {
        // @ts-ignore
        const {userId} = jwt.verify(req.params.token, process.env.JWT_SECRET as string);

        // Look for the user and update the isVerified field
        await UserModel.updateOne({_id: userId}, {isVerified: true});

        const user = await UserModel.findById(userId).select('-password');
        if (!user) {
            return res.status(404).json({msg: 'User not found'});
        }
        if (user.isVerified) {
            return res.status(200).send('Your account has been successfully verified');
        }
        const data = await paymentController.createCustomer(user.email, user.fist_name, user.last_name);
        user.stripe_id = data.id;
        await user.save();

        res.status(200).send('Your account has been successfully verified');
    } catch (error) {
        res.send('Invalid or expired token');
    }
}

const getUser = async (req: Request, res: Response) => {
    const id = req.params.id;

    //prüfen ob id vollständig
    if (!id) {
        return res.status(400).json({message: "Please provide user ID"});
    }

    UserModel.findById(id)
        .then((user) => {
            if (!user) {
                res.status(404).json({message: "User not found"});
            } else {
                res.status(200).json({
                    name: user.username,
                    email: user.email,
                    admin: user.isAdmin,
                    organizer: user.isOrganizer
                });
            }
        }).catch((error) => {
        console.error(error);
        res.status(500).json({error: "Error fetching user"});
    });
}

const getUsers = async (req: Request, res: Response) => {
    try {
        // find users from DB
        const users = await UserModel.find().exec();

        // map DB users to resources
        const usersResource = users.map(user => ({
            id: user.id,
            name: user.username,
            email: user.email,
            isAdmin: user.isAdmin,
            isOrganizer: user.isOrganizer
        }));

        // respond with the resources
        return res.status(200).json({users: usersResource});

    } catch (error) {
        console.error(error);
        return res.status(500).json({error: "Error retrieving users"});
    }
}

const createUser = async (req: Request, res: Response) => {
    const {username, email, password, isAdmin, isOrganizer} = req.body;

    //prüfen ob daten vollständig
    if (!username || !email || !password || isAdmin || isOrganizer === undefined) {
        return res.status(400).json({message: "Please provide all required fields"});
    }

    //prüfen ob daten korrekt
    //TODO: expresss-validator nutzen
    const validEmail = /^[\w.-]+@[a-zA-Z0-9]+\.[a-zA-Z]{2,}$/i;
    if (!validEmail.test(email)) {
        return res.status(400).json({message: "Invalid Email address"});
    }

    // Prüfen ob admin ein boolescher Wert ist
    if (typeof isAdmin !== 'boolean') {
        return res.status(400).json({message: "Admin must be a boolean"});
    }

    //Username unique
    if (await UserModel.findOne({username})) {
        return res.status(400).json({message: "Username is already taken"});
    }

    //Email unique
    if (await UserModel.findOne({email})) {
        return res.status(400).json({message: "Email is already taken"});
    }

    // TODO: extract hashing to a separate function
    //paswort hashen
    const hashedPassword = await bcrypt.hash(password, 10);

    //user erstellen und in db speichern,
    UserModel.create({username, email: email.toLowerCase(), isAdmin, isOrganizer, password: hashedPassword})
        .then((user) => {
            res.status(201).json({
                name: user.username,
                email: user.email,
                admin: user.isAdmin,
                organizer: user.isOrganizer
            });
        }).catch((error) => {
        console.error(error);
        res.status(500).json({error: "Error creating user"});
    });
}

const updateUser = async (req: Request, res: Response) => {
    const {username, email, password, isAdmin, isOrganizer} = req.body;
    const id = req.params.id;

    //prüfen ob daten vollständig
    if (!username || !email || password === undefined || isAdmin === undefined || isOrganizer === undefined) {
        return res.status(400).json({message: "Please provide all required fields"});
    }

    //prüfen ob daten korrekt
    //TODO: expresss-validator nutzen
    const validEmail = /^[\w.-]+@[a-zA-Z0-9]+\.[a-zA-Z]{2,}$/i;
    if (!validEmail.test(email)) {
        return res.status(400).json({message: "Invalid Email address"});
    }

    // Prüfen ob admin ein boolescher Wert ist
    if (typeof isAdmin !== 'boolean') {
        return res.status(400).json({message: "Admin must be a boolean"});
    }

    //Email unique
    const existingEmail = await UserModel.findOne({email});
    if (existingEmail && String(existingEmail._id) !== id) {
        return res.status(400).json({message: "Email is already taken"});
    }

    // TODO: extract hashing to a separate function
    //passwort hashen, falls es geändert wurde
    let hashedPassword = undefined;
    if (password !== undefined) {
        hashedPassword = await bcrypt.hash(password, 10);
    }

    //user in db aktualisieren
    UserModel.findByIdAndUpdate(id, {
        username,
        email: email.toLowerCase(),
        isAdmin,
        isOrganizer,
        password: hashedPassword
    }, {new: true})
        .then((user) => {
            if (!user) {
                res.status(404).json({message: "User not found"});
            } else {
                res.status(200).json({
                    name: user.username,
                    email: user.email,
                    admin: user.isAdmin,
                    organizer: user.isOrganizer
                });
            }
        }).catch((error) => {
        console.error(error);
        res.status(500).json({error: "Error updating user"});
    });
}

const deleteUser = async (req: Request, res: Response) => {
    const id = req.params.id;

    UserModel.findByIdAndRemove(id)
        .then((user) => {
            if (!user) {
                res.status(404).json({message: "User not found"});
            } else {
                res.status(200).json({message: "User successfully deleted"});
            }
        }).catch((error) => {
        console.error(error);
        res.status(500).json({error: "Error deleting user"});
    });
}

const getMyOrders = (req: Request, res: Response) => {
    const jwt = req.headers.authorization?.split(" ")[1];
    if (!jwt) {
        return res.status(401).send({message: "No token provided"});
    }

    extractUserIdFromToken(jwt, (err, userId) => {
        if (err) {
            console.error(err);
            return res.status(401).send({message: "Invalid token"});
        } else {
            TicketModel.find({owner_id: userId})
                .then((orders) => {
                    res.status(200).json({orders: orders});
                }).catch((error) => {
                console.error(error);
                res.status(500).json({error: "Error fetching order history"});
            });
        }
    });
}

export default {
    registration,
    login,
    getUser,
    getUsers,
    createUser,
    updateUser,
    deleteUser,
    getOrderHistory,
    sendMail,
    confirmation,
    getMyOrders
};
