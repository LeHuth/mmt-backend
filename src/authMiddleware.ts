import jwt, {VerifyErrors} from 'jsonwebtoken';
import {NextFunction, Request as ExpressRequest, Response} from 'express';
import UserModel, {IUser} from '../src/endpoints/User/UserModel';
import EventModel from "./endpoints/Event/EventModel";

interface Request extends ExpressRequest {
    user?: IUser;
}

export const authenticateJWT = (
    req: Request,
    res: Response,
    next: NextFunction
) => {
    const authHeader = req.header('Authorization');

    if (authHeader) {
        const token = authHeader.split(' ')[1];
        jwt.verify(
            token,
            process.env.JWT_SECRET as string,
            (err: VerifyErrors | null, decoded: unknown) => {
                if (err) {
                    return next(new Error('Invalid token'));
                }
                if (typeof decoded === 'object' && decoded !== null) {
                    // @ts-ignore
                    UserModel.findById(decoded.user.id).then((user) => {
                        if (!user) {
                            return res.status(401).send({error: `Access denied.`});
                            /*return next(new Error('User not found'));*/
                        }
                        req.user = user;
                        next();
                    });
                } else {
                    return res.status(401).send({error: `Access denied.`});
                    /*next(new Error('Invalid token data'));*/
                }
            }
        );
    } else {
        res.status(401).json({error: `Access denied.`});
    }
};

const authorizeRole = (role: 'user' | 'admin' | 'organizer' | 'creator') => (
    req: Request,
    res: Response,
    next: NextFunction
) => {
    const user = req.user as IUser;
    if (role === 'user' && user) {
        next();
    } else if (role === 'admin' && user && user.isAdmin) {
        next();
    } else if (role === 'organizer' && user && user.isOrganizer) {
        next();
    } else {
        //next(new Error(`Access denied. Required role: ${role}`));
        res.status(401).json({error: `Access denied.`});
    }
};

const canEditEvent = (req: Request, res: Response, next: NextFunction) => {
    const user = req.user as IUser;
    const eventId = req.params.id;
    if (user) {
        UserModel.findById(user._id).then((user) => {
            if (!user) {
                return next(new Error('User not found'));
            }
            if (user.isAdmin) {
                next();
            } else {
                // @ts-ignore
                EventModel.findById(eventId).then((event) => {
                    if (!event) {
                        return next(new Error('Event not found'));
                    }

                    if (event.organizer == user._id.toString()) {
                        next();
                    } else {
                        res.status(401).json({error: `Access denied.`});
                    }
                });
            }
        });
    } else {
        res.status(401).json({error: `Access denied.`});
    }
}

export const isUser = authorizeRole('user');
export const isAdmin = authorizeRole('admin');
export const isOrganizer = authorizeRole('organizer');

export default canEditEvent