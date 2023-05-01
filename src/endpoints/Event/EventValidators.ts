import {body, validationResult} from "express-validator";
import {NextFunction, Request, Response} from "express";


const eventValidationRules = [
    body('title')
        .trim()
        .notEmpty()
        .isLength({min: 5, max: 50})
        .withMessage('Title is required.'),
    body('description')
        .trim()
        .notEmpty()
        .isLength({min: 5, max: 500})
        .withMessage('Description is required.'),
    body('date')
        .trim()
        .notEmpty()
        .isISO8601()
        .withMessage('Date is required and should be in ISO8601 format.'),
    body('time')
        .notEmpty()
        .withMessage('Time is required.'),
    body('location')
        .trim()
        .notEmpty()
        .withMessage('Location is required.'),
    body('category')
        .trim()
        .notEmpty()
        .withMessage('Category is required.'),
    body('tags')
        .isArray()
        .withMessage('Tags is required and should be an array of strings.'),
    body('organizer')
        .trim()
        .notEmpty()
        .withMessage('Organizer is required.'),
    body('image')
        .trim()
        .notEmpty()
        .withMessage('Image is required.'),
    body('ticketInfo')
        .isObject()
        .withMessage('TicketInfo is required and should be an object.'),
    body('ticketInfo.ticketTypes')
        .isArray()
        .withMessage('TicketTypes should be an array of objects.'),
    body('ticketInfo.name')
        .trim()
        .notEmpty()
        .withMessage('Name is required.'),
    body('ticketInfo.price')
        .isFloat({ min: 0 })
        .withMessage('Price is required and should be a positive number or zero.'),
    body('ticketInfo.available')
        .isInt({ min: 0 })
        .withMessage('Available is required and should be a positive integer or zero.'),
];

const validateRequest = (req : Request, res : Response, next:NextFunction) => {
    const errors = validationResult(req);
    if (!errors.isEmpty())

    {
        return res.status(400).json({ errors: errors.array() });
    }
    next();
};

export {eventValidationRules, validateRequest};