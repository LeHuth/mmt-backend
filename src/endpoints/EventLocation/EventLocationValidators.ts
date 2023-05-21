import { body, validationResult } from "express-validator";
import { NextFunction, Request, Response } from "express";

const eventLocationValidationRules = [
    body('name')
        .trim()
        .notEmpty()
        .withMessage('Name is required.'),
    body('address')
        .trim()
        .notEmpty()
        .withMessage('Address is required.'),
    body('latitude')
        .notEmpty()
        .isNumeric()
        .withMessage('Latitude is required and should be numeric.')
        .bail()
        .custom((value, { req }) => {
            if (value < -90 || value > 90) {
                throw new Error('Latitude must be between -90 and 90.');
            }
            return true;
        }),
    body('longitude')
        .notEmpty()
        .isNumeric()
        .withMessage('Longitude is required and should be numeric.')
        .bail()
        .custom((value, { req }) => {
            if (value < -180 || value > 180) {
                throw new Error('Longitude must be between -180 and 180.');
            }
            return true;
        })
];

const validateRequest = (req : Request, res : Response, next: NextFunction) => {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
        return res.status(400).json({ errors: errors.array() });
    }
    next();
};

export { eventLocationValidationRules, validateRequest };