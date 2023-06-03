import {Request, Response} from "express";
import EventModel, {IEvent} from "../Event/EventModel";
import UserModel, {IUser} from "../User/UserModel";
import process from "process";
import {Types} from "mongoose";

const calculateOrderAmount = (items: IEvent[]) => {
    let sum = 0;
    for (const item of items) {

        console.log(item);
        EventModel.findById(item._id).then((event) => {
            if (!event) {
                throw new Error("Event not found");
            }
            sum += event.ticketInfo.price;
        });
    }
    return 1400;
};

const createCustomer = async (user: IUser) => {
    // eslint-disable-next-line @typescript-eslint/no-var-requires
    const stripe = require('stripe')(process.env.STRIPE_SECRET_KEY);
    const customer = await stripe.customers.create({
        email: user.email,
        name: user.username,
        metadata: {
            _id: user._id,
            isAdmin: user.isAdmin,
            isOrganizer: user.isOrganizer,
        }
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
        return_url: `http://${baseUrl}/success`,
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
    console.log(items);
    const lineItems = [];
    for (const item of items) {
        const product = await stripeInstance.products.retrieve(item.stripe_id, {
            stripeAccount: item.organizer_stripe_id,
        });
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
        name: items.title,
        description: items.description,
        images: [items.image],
        default_price_data: {
            currency: 'eur',
            unit_amount: items.ticketInfo.price * 100,
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

const checkoutSession = async (req: Request, res: Response) => {
    // eslint-disable-next-line @typescript-eslint/no-var-requires
    const stripe = require('stripe')(process.env.STRIPE_SECRET_KEY);
    try {
        req.headers.authorization = process.env.STRIPE_SECRET_KEY;
        const eventArray: IEvent[] = [];
        const {items, baseUrl} = req.body;
        for (const item of items) {
            const event = await EventModel.findById(item)
            if (!event) {
                throw new Error("Event not found");
            }
            eventArray.push(event);
        }
        //ToDo: somehow get the organizer stripe id from the event
        const lineItems = await createLineItems(eventArray, stripe);
        //This will break if the events are from different organizers
        const session = await stripe.checkout.sessions.create({
            payment_method_types: ['card', 'paypal'],
            mode: 'payment',
            line_items: lineItems,
            success_url: `http://${baseUrl}/success`,
            cancel_url: `https://${baseUrl}/cancel`,
        }, {
            stripeAccount: eventArray[0].organizer_stripe_id,
        })
        res.status(200).send({url: session.url})
    } catch
        (error) {
        res.status(500).send({error: error})
    }
}

export default {paymentIntent, checkoutSession, test, createProduct, createCustomer, createAccount};