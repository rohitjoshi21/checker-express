import { Request, Response, NextFunction } from 'express';
import jwt from 'jsonwebtoken';


export const isAuthenticated = (req: Request, res: Response, next: NextFunction): void => {
    const token = req.cookies.token || req.headers.authorization?.split(' ')[1];

    if (!token) {
        return res.redirect('/auth/login');
    }

    try {
    
        jwt.verify(token, process.env.JWT_SECRET as string);
        next();
    } catch (error) {
        return res.redirect('/auth/login');
    }
};
