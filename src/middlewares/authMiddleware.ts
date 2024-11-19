import { Request, Response, NextFunction } from 'express';
import { User } from '../models/userModel';
import { RedirectPaths } from '../config/redirects';
import jwt from 'jsonwebtoken';

// this middleware authenticates a user and add username in the request field

export const isAuthenticated = async (
    req: Request,
    res: Response,
    next: NextFunction,
): Promise<void> => {
    const token = req.cookies.token;

    if (!token) {
        res.redirect(RedirectPaths.authLogin);
        return;
    }

    try {
        const decoded = jwt.verify(
            token,
            process.env.JWT_SECRET as string,
        ) as jwt.JwtPayload;
        const user = await User.findById(decoded.userId);

        // user not found
        if (!user) {
            res.redirect(RedirectPaths.authLogin);
            return;
        }
        req['username'] = user.username;
        next();
    } catch (error) {
        console.error('Authentication error:', error);
        res.redirect(RedirectPaths.authLogin);
        return;
    }
};
