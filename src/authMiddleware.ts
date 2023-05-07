import jwt, { VerifyErrors } from 'jsonwebtoken';
import { Request as ExpressRequest, Response, NextFunction } from 'express';
import { IUser } from '../src/endpoints/User/UserModel';

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
          req.user = decoded as IUser;
          next();
        } else {
          next(new Error('Invalid token data'));
        }
      }
    );
  } else {
    next(new Error('Authorization header missing'));
  }
};

const authorizeRole = (role: 'user' | 'admin' | 'organizer') => (
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
    next(new Error(`Access denied. Required role: ${role}`));
  }
};

export const isUser = authorizeRole('user');
export const isAdmin = authorizeRole('admin');
export const isOrganizer = authorizeRole('organizer');