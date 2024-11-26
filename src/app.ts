// index.ts

import express from 'express';
import dotenv from 'dotenv';
import path from 'path';
import mongoose from 'mongoose';
import cors from 'cors';
import cookieParser from 'cookie-parser';
import { isAuthenticated } from './middlewares/authMiddleware';
import { redirectIfAuthenticated } from './middlewares/redirectIfAuthenticated';
import { errorHandler } from './middlewares/errorHandler';
import { createServer } from 'http';
import { SocketController } from './sockets/socketController';
import authRoutes from './routes/authRoutes';
import gameRoutes from './routes/gameRoutes';
import apiRoutes from './routes/apiRoutes';
import homeRoute from './routes/homeRoute';

dotenv.config();

const app = express();
const port = process.env.PORT || 3000;

app.set('view engine', 'ejs');
// console.log(__dirname, path.join(__dirname, 'views'));
// app.set('./views', path.join(__dirname, 'views'));

app.use(cors());
app.use(cookieParser());

app.use(express.static('dist'));
app.use(express.static('public'));
app.use(express.urlencoded({ extended: true }));
app.use(express.json());

app.get('/', isAuthenticated, homeRoute);
app.use('/auth', redirectIfAuthenticated, authRoutes);
app.use('/game', isAuthenticated, gameRoutes);
app.use('/api/games', isAuthenticated, apiRoutes);
app.use(errorHandler);

const httpServer = createServer(app);

const socketapp = new SocketController(httpServer);
socketapp.use(isAuthenticated);

httpServer.listen(port, async () => {
    console.log(`Server is running at http://localhost:${port}`);

    try {
        await mongoose.connect(process.env.DATABASE_URL as string);
        console.log('Connected To Database!!');
    } catch (error) {
        console.log('Error while connecting Database');
    }
});
