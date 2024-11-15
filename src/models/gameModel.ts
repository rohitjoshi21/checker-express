import mongoose from "mongoose";

const GameSchema = new mongoose.Schema(
    {
        gameid: {
            type: Number,
            unique: true,
            required: true,
        },
        boardState: {
            type: [[Number]],
            required: true,
            default: Array(8).fill(Array(8).fill(0))
        },
        turn: {
            type: Number,
            required: true,
            default: -1, //-1 and 1
        }
    }
)

export const Game = mongoose.model("Games",GameSchema);
