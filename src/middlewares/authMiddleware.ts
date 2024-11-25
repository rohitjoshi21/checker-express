import { Request, Response, NextFunction } from 'express';
import { RedirectPaths } from '../config/redirects';
import jwt from 'jsonwebtoken';
import { parse } from 'cookie';
import { Server } from 'socket.io';
import { UserRepository } from '../repos/userRepo';

const userRepository = new UserRepository();

export type MiddlewareFunction = Parameters<Server['use']>[0];

export const isAuthenticatedSocket: MiddlewareFunction = async (socket, next) => {
    try {
        let req = socket.request as Request;
        let token;

        if (req.headers.cookie) {
            token = parse(req.headers.cookie).token;
            if (!token) {
                throw new Error("Socket couldn't be authenticated, cookies not found");
            }
        } else {
            throw new Error("Socket couldn't be authenticated, token not found in cookies");
        }

        const decoded = jwt.verify(token, process.env.JWT_SECRET as string) as jwt.JwtPayload;
        const user = await userRepository.findUserById(decoded.userId);

        if (!user) {
            throw new Error('User not found for the given userid');
        }
        socket.data.username = user.username;
        next();
    } catch (error) {
        const errorMessage = error instanceof Error ? error.message : 'Authentication error in socket';
        next(new Error(errorMessage));
    }
};

export const isAuthenticated = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
    try {
        let token;
        token = req.cookies.token;
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
