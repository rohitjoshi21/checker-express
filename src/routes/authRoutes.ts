import express from 'express';
import { AuthController } from '../controllers/authController';

const authController = new AuthController();

const router = express.Router();

router.get('/login', authController.getLoginPage);

router.post('/login', authController.postLogin);

router.get('/signup', authController.getSignupPage);

router.post('/signup', authController.postSignup);

export default router;
