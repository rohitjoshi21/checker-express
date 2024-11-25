import mongoose from 'mongoose';

const GameSchema = new mongoose.Schema({
    players: [{ type: String, required: true }],
    board: [{ type: Number, required: true }],
    turn: { type: Number, required: true, default: -1 },
    status: {
        type: String,
        required: true,
        enum: ['notpaired', 'active', 'abandoned', 'completed'],
        default: 'notpaired',
    },
    winner: { type: String },
    createdAt: { type: Date, default: Date.now },
    updatedAt: { type: Date, default: Date.now },
});

export const Game = mongoose.model('Game', GameSchema);
