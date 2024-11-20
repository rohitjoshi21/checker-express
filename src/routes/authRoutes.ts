import express from 'express';
import { AuthController } from '../controllers/authController';
import { AuthService } from '../services/authService';

const authController = new AuthController(new AuthService());

const router = express.Router();

router.get('/login', authController.getLoginPage.bind(authController));

router.post('/login', authController.postLogin.bind(authController));

router.get('/signup', authController.getSignupPage.bind(authController));

router.post('/signup', authController.postSignup.bind(authController));

export default router;
