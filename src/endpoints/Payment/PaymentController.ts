import {Request, Response} from "express";
import EventModel, {IEvent} from "../Event/EventModel";
import process from "process";

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

const createLineItems = async (items: IEvent[], stripeInstance : any) => {
    console.log(items);
    const lineItems = [];
    for (const item of items) {
        /*product_data: {
                    name: item.title,
                    images: [item.image],
                    price_data: {
                currency: 'eur',
                product: item.stripe_id,
                unit_amount: item.ticketInfo.price * 100,
            },
                },*/
        const product = await stripeInstance.products.retrieve(item.stripe_id)
        lineItems.push({
            price: product.default_price,
            quantity: 1,
        });
    }
    return lineItems;
}

const createProduct = async (items: IEvent) => {
    // eslint-disable-next-line @typescript-eslint/no-var-requires
    const stripe = require('stripe')(process.env.STRIPE_SECRET_KEY);
    const product = await stripe.products.create({
        name: items.title,
        description: items.description,
        images: [items.image],
        default_price_data: {
            currency: 'eur',
            unit_amount: items.ticketInfo.price * 100,
        },
    });
    return product;
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
        const lineItems = await createLineItems(eventArray, stripe);
        const session = await stripe.checkout.sessions.create({
            payment_method_types: ['card', 'paypal'],
            mode: 'payment',
            line_items: lineItems,
            success_url: `http://${baseUrl}/success`,
            cancel_url: `https://${baseUrl}/cancel`,
        })
        res.status(200).send({url: session.url})
    } catch
        (error) {
        res.status(500).send({error: error})
    }
}

export default {paymentIntent, checkoutSession, test, createProduct};