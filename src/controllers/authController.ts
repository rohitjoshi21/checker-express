import { Request, Response, RequestHandler } from 'express';
import { authService } from '../services/authService'; 
import bcrypt from 'bcrypt';
import jwt from 'jsonwebtoken';

export const getLoginPage = (req: Request, res: Response) => {
    res.render('auth/login');
};

// Handle login form submission
export const postLogin: RequestHandler = async (req: Request, res: Response):Promise<void> => {
    const { username, password } = req.body;

    try {
        // Authenticate user with authService
        const user = await authService.authenticateUser(username, password);

        if (!user) {
            res.status(401).send("Invalid username or password");
            return;
        }

        // Generate a token (use your secret key here)
        const token = jwt.sign({ userId: user.id }, process.env.JWT_SECRET as string, { expiresIn: '1h' });
        
        // Send the token as a cookie or in the response
        res.cookie('token', token, { httpOnly: true });
        res.redirect('/'); // Redirect to dashboard or desired route
    } catch (error) {
        // console.log(error)
        res.status(500).send("Error during login");
    }
};

// Render the signup page
export const getSignupPage = (req: Request, res: Response) => {
    res.render('auth/signup');
};

// Handle signup form submission
export const postSignup = async (req: Request, res: Response) => {
    const { username, password } = req.body;

    try {
        // Hash the password
        const hashedPassword = await bcrypt.hash(password, 10);

        // Register the user with authService
        await authService.registerUser(username, hashedPassword);

        res.redirect('/auth/login'); // Redirect to login after successful signup
    } catch (error) {
        res.status(500).send("Error during signup");
    }
};
