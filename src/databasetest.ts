import mongoose from 'mongoose';
import dotenv from 'dotenv';
import { User } from './models/userModel';
import { Game } from './models/gameModel';

dotenv.config();

connect();

async function connect(): Promise<void> {
    try {
        await mongoose.connect(process.env.DATABASE_URL as string);
        console.log('🛢️  Connected To Database!!');
    } catch (error) {
        console.log('⚠️ Error to connect Database');
    }
}

async function queries(): Promise<void> {
    const users = await User.find({});
    const games = await Game.find({});
    console.log('hello', games[0].players);
}

queries();
