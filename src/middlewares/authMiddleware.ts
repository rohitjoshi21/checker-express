import { Request, Response, NextFunction } from 'express';
import { User } from '../models/userModel';
import { RedirectPaths } from '../config/redirects';
import jwt from 'jsonwebtoken';
import { parse } from 'cookie';
import { Socket, Server } from 'socket.io';
import { UserRepository } from '../repos/userRepo';
type MiddlewareFunction = Parameters<Server['use']>[0];

const userRepository = new UserRepository();

export const isAuthenticatedSocket: MiddlewareFunction = async (socket, next) => {
    try {
        let req = socket.request as Request;
        if (req) {
            let token;
            if (req.cookies) {
                token = req.cookies.token;
            } else {
                if (req.headers.cookie) {
                    // console.log(req.headers.cookie);
                    token = parse(req.headers.cookie).token;
                    // console.log('token parsed by middleware', token);
                } else {
                    console.log('Cookie not found');
                }
            }

            // console.log('inside middleware', req.url);
            if (!token) {
                throw new Error("Socket couldn't be authenticated");
            }

            const decoded = jwt.verify(token, process.env.JWT_SECRET as string) as jwt.JwtPayload;
            // const user = await User.findById(decoded.userId);
            const user = await userRepository.findUserById(decoded.userId);

            // user not found
            if (!user) {
                throw new Error('User not found');
            }
            socket.data.username = user.username;
        }
        next();
    } catch (error) {
        next(new Error('Authentication error in socket'));
    }
};

export const isAuthenticated = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
    let token;
    if (req.cookies) {
        token = req.cookies.token;
    } else {
        if (req.headers.cookie) {
            token = parse(req.headers.cookie).token;
            // console.log('token parsed by middleware', token);
        } else {
            console.log('Cookie not found');
        }
    }

    // console.log('inside middleware', req.url);
    if (!token) {
        res.redirect(RedirectPaths.authLogin);
        return;
    }

    try {
        const decoded = jwt.verify(token, process.env.JWT_SECRET as string) as jwt.JwtPayload;
        const user = await userRepository.findUserById(decoded.userId);

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
