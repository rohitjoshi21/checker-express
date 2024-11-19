// index.ts

import express, { Request, Application, Response } from 'express';
import dotenv from 'dotenv';
import path from 'path';
import mongoose from 'mongoose';
import cors from 'cors';
import cookieParser from 'cookie-parser';
import { isAuthenticated } from './middlewares/authMiddleware';
import { redirectIfAuthenticated } from './middlewares/redirectIfAuthenticated';
import authRoutes from './routes/authRoutes';
import gameRoutes from './routes/gameRoutes';
import apiRoutes from './routes/apiRoutes';
import { errorHandler } from './middlewares/errorHandler';

dotenv.config();

const app: Application = express();
const port = process.env.PORT || 3000;

app.set('view engine', 'ejs');
app.set('./views', path.join(__dirname, 'views'));

app.use(cors());
app.use(cookieParser());

app.get('/', isAuthenticated, async (req: Request, res: Response) => {
    res.render('index', {
        username: req['username'],
    });
});

app.use(express.static('dist'));
app.use(express.static('public'));
app.use(express.urlencoded({ extended: true }));
app.use(express.json());
app.use('/auth', redirectIfAuthenticated, authRoutes);
app.use('/game', isAuthenticated, gameRoutes);
app.use('/api/games', isAuthenticated, apiRoutes);
app.use(errorHandler);

app.listen(port, async () => {
    console.log(`[server]: Server is running at http://localhost:${port}`);

    try {
        await mongoose.connect(process.env.DATABASE_URL as string);
        console.log('🛢️  Connected To Database');
    } catch (error) {
        console.log('⚠️ Error to connect Database');
    }
});
