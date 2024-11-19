import { Request, Response, NextFunction } from 'express';
import jwt from 'jsonwebtoken';
import { RedirectPaths } from '../config/redirects';

export const redirectIfAuthenticated = (req: Request, res: Response, next: NextFunction): void => {
    try {
        const token = req.cookies.token

        if (token) {
            const decoded = jwt.verify(token, process.env.JWT_SECRET as string);
            if (decoded) {
                res.redirect(RedirectPaths.home);
                return;
            }
        }
    } catch (error) {
        // If token is invalid or an error occurs, proceed normally
    }

    next();
};