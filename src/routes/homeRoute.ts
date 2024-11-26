import { Request, Response } from 'express';
import { Game } from '../models/gameModel';

interface GameCard {
    id: string;
    createdAt: Date;
    player1: string;
    player2: string;
    status: string;
}

const homeRoute = async (req: Request, res: Response) => {
    let gamesdb = await Game.find({});

    // Sort games by createdAt in descending order
    gamesdb = gamesdb.sort((a, b) => b.createdAt.getTime() - a.createdAt.getTime());

    // Transform the sorted games into the GameCard format
    let games: GameCard[] = gamesdb.map((game) => ({
        id: game.id,
        createdAt: game.createdAt,
        player1: game.players[0],
        player2: game.players[1],
        status: game.status,
    }));

    res.render('index', {
        username: req['username'],
        games: games,
    });
};

export default homeRoute;
