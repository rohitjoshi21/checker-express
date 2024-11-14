import express from 'express';
import { getLoginPage, getSignupPage, postLogin, postSignup } from '../controllers/authController';

const router = express.Router();


router.get('/login', getLoginPage);

router.post('/login', postLogin);

router.get('/signup', getSignupPage);

router.post('/signup', postSignup);

export default router;
