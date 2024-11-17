import mongoose, { Schema, Document } from 'mongoose';
import { Types } from 'mongoose';

export interface IGame extends Document {
    _id: Types.ObjectId;
    players: string[];
    board: number[];
    turn: number;
    status: 'waiting' | 'active' | 'completed';
    winner?: string;
    createdAt: Date;
    updatedAt: Date;
}

const GameSchema: Schema = new Schema({
    
    players: [{ type: String, required: true }],
    board: [{ type: Number, required: true }],
    turn: { type: Number, required: true, default: -1 },
    status: { type: String, required: true, default: 'waiting' },
    winner: { type: String },
    createdAt: { type: Date, default: Date.now },
    updatedAt: { type: Date, default: Date.now }
});

export default mongoose.model<IGame>('Game', GameSchema);