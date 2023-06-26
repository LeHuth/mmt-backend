import {Request, Response} from "express";
import EventModel, {IEvent} from "../Event/EventModel";
import UserModel from "../User/UserModel";
import process from "process";
import {Types} from "mongoose";
import jwt from "jsonwebtoken";
import {IJWTPayload} from "../../helper";
import {getTokenAndDecode} from "../ShoppingCart/ShoppingCartController";
import ShoppingCartModel from "../ShoppingCart/ShoppingCartModel";
import TicketModel from "../Ticket/TicketModel";
import {TicketStatus} from "../Ticket/TicketSaleStatsModel";
// eslint-disable-next-line @typescript-eslint/ban-ts-comment
// @ts-ignore
import {v4 as uuidv4} from 'uuid';

const calculateOrderAmount = (items: IEvent[]) => {
    let sum = 0;
    for (const item of items) {

        console.log(item);
        EventModel.findById(item._id).then((event) => {
            if (!event) {
                throw new Error("Event not found");
            }
            sum += event.price;
        });
    }
    return 1400;
};

const createCustomer = async (email: string, fist_name: string, last_name: string) => {
    // eslint-disable-next-line @typescript-eslint/no-var-requires
    const stripe = require('stripe')(process.env.STRIPE_SECRET_KEY);
    const customer = await stripe.customers.create({
        email: email,
        name: fist_name + " " + last_name,
    });
    return customer;
}

const createAccount = async (email: string, first_name: string, last_name: string, baseUrl: string) => {
    // eslint-disable-next-line @typescript-eslint/no-var-requires
    const stripe = require('stripe')(process.env.STRIPE_SECRET_KEY);
    const account = await stripe.accounts.create({
        type: 'express',
        email: email,
        capabilities: {
            card_payments: {requested: true},
            transfers: {requested: true},
        },
        business_type: 'individual',
        individual: {
            email: email,
            first_name: first_name,
            last_name: last_name,
        },
        country: 'DE',
        default_currency: 'eur',

    });

    const accountLink = await stripe.accountLinks.create({
        account: account.id,
        refresh_url: 'https://example.com/reauth',
        return_url: `http://${baseUrl}/payment/success`,
        type: 'account_onboarding',
    });
    return {account_data: account, account_link: accountLink}
}

const paymentIntent = async (req: Request, res: Response) => {
    // eslint-disable-next-line @typescript-eslint/no-var-requires
    const stripe = require('stripe')(process.env.STRIPE_SECRET_KEY);
    const {items} = req.body;
    let amount: number;
    try {
        amount = calculateOrderAmount(items);
        const paymentIntent = await stripe.paymentIntents.create({
            amount: amount,
            currency: "eur",
            automatic_payment_methods: {
                enabled: true,
            },
        });

        res.status(200).send({
            clientSecret: paymentIntent.client_secret,
        });
    } catch (error) {
        console.error(error);
        res.status(400).send({error: "Error calculating order amount"});
    }
};

const test = async (req: Request, res: Response) => {
    const {items} = req.body;
    console.log(items);

    res.status(200).send({message: "test"});
}

const createLineItems = async (items: IEvent[], stripeInstance: any) => {
    const lineItems = [];
    /*product_data: {
        name: item.title,
            images: [item.image],
            price_data: {
            currency: 'eur',
                product: item.stripe_id,
                unit_amount: item.ticketInfo.price * 100,
        },
    },*/
    for (const item of items) {
        const product = await stripeInstance.products.retrieve(item.stripe_id);
        console.log(product)
        lineItems.push({
            price: product.default_price,
            quantity: 1,
        });
    }
    return lineItems
}

const createProduct = async (items: IEvent, organizer_id: string) => {
    // eslint-disable-next-line @typescript-eslint/no-var-requires
    const stripe = require('stripe')(process.env.STRIPE_SECRET_KEY);
    const organizer = await UserModel.findOne({_id: new Types.ObjectId(organizer_id)});
    if (!organizer) {
        throw new Error("Organizer not found");
    }
    console.log(organizer)
    const account = await stripe.accounts.retrieve(organizer.stripe_id)
    console.log(account)
    const product = await stripe.products.create({
        name: items.name,
        description: items.description,
        images: [items.name],
        default_price_data: {
            currency: 'eur',
            unit_amount: items.price * 100,
        },
        metadata: {
            organizer: items.organizer,
            organizer_stripe_id: account.id,
        },
    }, {
        stripeAccount: account.id,
    });
    return {product: product, account: account};
}

const calcTotalAmount = async (lineItems: object[], stripe: any) => {
    let returnAmount = 0;
    for (const item of lineItems) {
        // @ts-ignore
        const price = await stripe.prices.retrieve(item.price);
        if (price) {
            console.log('price ', price)
            returnAmount += price.unit_amount;
        }

    }
    console.log('totalAmount ', returnAmount)
    return returnAmount;
}

const checkoutSession = async (req: Request, res: Response) => {
    console.log('start checkout')
    // eslint-disable-next-line @typescript-eslint/no-var-requires
    const stripe = require('stripe')(process.env.STRIPE_SECRET_KEY);
    // decode the jwt token and get user id

    const token = req.headers.authorization;
    if (!token) {
        res.status(401).send({error: "No token provided"});
        return;
    }
    const decoded = jwt.verify(token.split(' ')[1], process.env.JWT_SECRET as string);
    if (!decoded) {
        res.status(401).send({error: "Invalid token"});
        return;
    }
    // @ts-ignore
    const user_id = decoded.user.id;
    const user = await UserModel.findById(user_id);
    if (!user) {
        res.status(404).send({error: "User not found"});
        return;
    }
    try {
        req.headers.authorization = process.env.STRIPE_SECRET_KEY;
        const eventArray: IEvent[] = [];
        const {items, baseUrl} = req.body;
        console.log('hererer')
        for (const item of items) {
            const event = await EventModel.findById(item)
            if (!event) {
                console.log(event)
                throw new Error("Event not found");
            }
            eventArray.push(event);
            console.log(eventArray)
        }
        //ToDo: somehow get the organizer stripe id from the event
        const lineItems = await createLineItems(eventArray, stripe);
        console.log(lineItems)
        //This will break if the events are from different organizers
        //console.log(eventArray[0].organizer_stripe_id)
        const session = await stripe.checkout.sessions.create({
            customer: user.stripe_id,
            payment_method_types: ['card', 'paypal'],
            mode: 'payment',
            line_items: lineItems,
            success_url: `http://${baseUrl}/success`,
            cancel_url: `https://${baseUrl}/cancel`,
        })

        /*if (user.checkout_session_id) {
            user.checkout_session_id.push(session.id);
            await user.save();
        } else {
            UserModel.updateMany({_id: user_id}, {$set :{checkout_session_id: [session.id]}}).then((result) => {
                console.log(result);
            }).catch((error) => {
                console.log(error);
            })
        }*/

        res.status(200).send({url: session.url})
    } catch (error) {
        res.status(500).send({error: error})
    }
}


const getCharges = async (req: Request, res: Response) => {
    // eslint-disable-next-line @typescript-eslint/no-var-requires

    const stripe_id = req.params.stripe_id;
    if (!stripe_id) {
        res.status(400).send({error: "No stripe id provided"});
        return;
    }
    // eslint-disable-next-line @typescript-eslint/no-var-requires
    const stripe = require('stripe')(process.env.STRIPE_SECRET_KEY);
    // fetch paymetent intents from stripe api

    const paymentIntents = await stripe.paymentIntents.list({
        customer: stripe_id,
    });


    const charges = await stripe.charges.list({
        limit: 3,
        payment_intent: paymentIntents.data[0].id,
    });
    res.status(200).send({charges: paymentIntents});
}

const checkIfEventIsAvailable = async (event_id: string, amount: number) => {
    const result = await EventModel.find({_id: event_id})
    const event = result[0] as IEvent;
    return !(!event || event.available - amount < 0);
}

const createTickets = async (items: { event_id: string, amount: number }[], user_id: string) => {
    const tickets = [];
    for (const item of items) {
        const Event = await EventModel.findById(item.event_id);
        if (!Event) {
            continue;
        }

        for (let i = 0; i < item.amount; i++) {
            const ticket = await new TicketModel({
                _id: uuidv4(),
                name: Event.name,
                event_id: item.event_id,
                owner_id: user_id,
                price: Event.price,
                date: Event.happenings[0].date,
                location_id: Event.happenings[0].place,
                isUsed: false,
                status: TicketStatus.PENDING,

            });
            await ticket.save();
            tickets.push(ticket);
        }
    }

    return tickets;
}

const checkout = async (req: Request, res: Response) => {
    const decoded = await getTokenAndDecode(req, res);
    if (!decoded) {
        return res.status(401).json({message: "Invalid credentials"});
    }

    const user_id = (decoded as IJWTPayload).user.id;

    const shoppingCart = await ShoppingCartModel.findOne({user_id: user_id});

    if (!shoppingCart) {
        return res.status(404).json({message: "Shopping cart not found"});
    }

    // step 1: check if all the items in the shopping cart are still available
    const items = shoppingCart.items;
    for (const item of items) {
        const available = await checkIfEventIsAvailable(item.event_id, item.amount);
        if (!available) {
            return res.status(400).json({message: "Not enough tickets available"});
        }
    }

    // step 2: create Tickets from the shopping cart
    const tickets = await createTickets(items, user_id);
    shoppingCart.items = [];
    await shoppingCart.save();
    return res.status(200).json({tickets: tickets});

}

const prepareCheckout = async (req: Request, res: Response) => {
    const decoded = await getTokenAndDecode(req, res);
    if (!decoded) {
        return res.status(401).json({message: "Invalid credentials"});
    }

    const user_id = (decoded as IJWTPayload).user.id;

    const shoppingCart = await ShoppingCartModel.findOne({user_id: user_id});

    if (!shoppingCart) {
        return res.status(404).json({message: "Shopping cart not found"});
    }

    // return all the events in the shopping cart
    const items = shoppingCart.items;
    const events = [];
    for (const item of items) {
        const event = await EventModel.findById(item.event_id);
        if (!event) {
            continue;
        }
        events.push({...event.toJSON(), amount: item.amount});
    }

    return res.status(200).json({events: events});
}

export default {
    paymentIntent,
    checkoutSession,
    test,
    createProduct,
    createCustomer,
    createAccount,
    getCharges,
    checkout,
    prepareCheckout
};