"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = __importDefault(require("express"));
const authController_1 = require("../controllers/authController");
const router = express_1.default.Router();
router.get('/login', authController_1.getLoginPage);
router.post('/login', authController_1.postLogin);
router.get('/signup', authController_1.getSignupPage);
router.post('/signup', authController_1.postSignup);
exports.default = router;
