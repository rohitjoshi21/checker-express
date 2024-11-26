import { Request, Response, NextFunction } from 'express';
import { AuthService } from '../services/authService';
import { CustomError } from '../types/CustomError';

export class AuthController {
    private authService: AuthService;

    constructor(authService: AuthService) {
        this.authService = authService;
    }

    getLoginPage(req: Request, res: Response): void {
        res.render('auth/login');
    }

    async postLogin(req: Request, res: Response, next: NextFunction): Promise<void> {
        try {
            const { username, password } = req.body;
            const token = await this.authService.authenticateUser(username, password);
            res.cookie('token', token, { httpOnly: true });
            res.redirect('/');
        } catch (error) {
            next(error);
        }
    }

    getSignupPage(req: Request, res: Response) {
        res.render('auth/signup');
    }

    async postSignup(req: Request, res: Response, next: NextFunction) {
        try {
            const { username, email, password, cpassword } = req.body;
            if (password != cpassword) {
                throw new CustomError('Passwords not matched', 400, 'ValidationError');
            }
            await this.authService.registerUser(username, email, password);
            res.redirect('/auth/login');
        } catch (error) {
            next(error);
        }
    }
}
