"use strict";
var __awaiter = (this && this.__awaiter) || function (thisArg, _arguments, P, generator) {
    function adopt(value) { return value instanceof P ? value : new P(function (resolve) { resolve(value); }); }
    return new (P || (P = Promise))(function (resolve, reject) {
        function fulfilled(value) { try { step(generator.next(value)); } catch (e) { reject(e); } }
        function rejected(value) { try { step(generator["throw"](value)); } catch (e) { reject(e); } }
        function step(result) { result.done ? resolve(result.value) : adopt(result.value).then(fulfilled, rejected); }
        step((generator = generator.apply(thisArg, _arguments || [])).next());
    });
};
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.postSignup = exports.getSignupPage = exports.postLogin = exports.getLoginPage = void 0;
const authService_1 = require("../services/authService");
const bcrypt_1 = __importDefault(require("bcrypt"));
const jsonwebtoken_1 = __importDefault(require("jsonwebtoken"));
const getLoginPage = (req, res) => {
    res.render('auth/login');
};
exports.getLoginPage = getLoginPage;
// Handle login form submission
const postLogin = (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    const { username, password } = req.body;
    try {
        // Authenticate user with authService
        const user = yield authService_1.authService.authenticateUser(username, password);
        if (!user) {
            res.status(401).send("Invalid username or password");
            return;
        }
        // Generate a token (use your secret key here)
        const token = jsonwebtoken_1.default.sign({ userId: user.id }, process.env.JWT_SECRET, { expiresIn: '1h' });
        // Send the token as a cookie or in the response
        res.cookie('token', token, { httpOnly: true });
        res.redirect('/dashboard'); // Redirect to dashboard or desired route
    }
    catch (error) {
        res.status(500).send("Error during login");
    }
});
exports.postLogin = postLogin;
// Render the signup page
const getSignupPage = (req, res) => {
    res.render('auth/signup');
};
exports.getSignupPage = getSignupPage;
// Handle signup form submission
const postSignup = (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    const { username, password } = req.body;
    try {
        // Hash the password
        const hashedPassword = yield bcrypt_1.default.hash(password, 10);
        // Register the user with authService
        yield authService_1.authService.registerUser(username, hashedPassword);
        res.redirect('/auth/login'); // Redirect to login after successful signup
    }
    catch (error) {
        res.status(500).send("Error during signup");
    }
});
exports.postSignup = postSignup;
