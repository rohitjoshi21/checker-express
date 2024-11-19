import { Request, Response, NextFunction } from 'express';
import { AuthService } from '../services/authService';

export class AuthController {
    private authService: AuthService;

    constructor() {
        this.authService = new AuthService();
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
            const { username, password } = req.body;
            await this.authService.registerUser(username, password);
            res.redirect('/auth/login');
        } catch (error) {
            next(error);
        }
    }
}
