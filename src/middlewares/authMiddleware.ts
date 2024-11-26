import { Request, Response } from 'express';
import { RedirectPaths } from '../config/redirects';
import jwt from 'jsonwebtoken';
import { parse } from 'cookie';
// import { Server } from 'socket.io';
import { UserRepository } from '../repos/userRepo';

const userRepository = new UserRepository();

export const isAuthenticated = async (req: Request, res: Response, next: any): Promise<void> => {
    try {
        let token;
        if (req.cookies) {
            token = req.cookies.token;
        } else if (req.headers.cookie) {
            //if cookie are not parsed by cookie-parser, used for socket requests
            token = parse(req.headers.cookie).token;
        }
        if (!token) {
            res.redirect(RedirectPaths.authLogin);
            return;
        }
        const decoded = jwt.verify(token, process.env.JWT_SECRET as string) as jwt.JwtPayload;
        const user = await userRepository.findUserById(decoded.userId);

        if (!user) {
            res.redirect(RedirectPaths.authLogin);
            return;
        }
        req['username'] = user.username;
        next();
    } catch (error) {
        const errorMessage = error instanceof Error ? error.message : 'Unknown Error';
        console.error('Authentication error:', errorMessage);
        res.redirect(RedirectPaths.authLogin);
        return;
    }
};
