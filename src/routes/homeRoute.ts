import { Request, Response } from 'express';
import { Game } from '../models/gameModel';

interface GameCard {
    id: string;
    createdAt: Date;
    player1: string;
    player2: string;
    status: string;
}

export const homeRoute = async (req: Request, res: Response) => {
    let gamesdb = await Game.find({});
    let games: GameCard[] = [];

    for (let game of gamesdb) {
        let currgame: GameCard = {
            id: game.id,
            createdAt: game.createdAt,
            player1: game.players[0],
            player2: game.players[1],
            status: game.status,
        };
        games.push(currgame);
    }

    // console.log(allgames.length);
    // const games = [
    //     {
    //         id: 'game123',
    //         createdAt: new Date('2024-11-24T10:00:00'),
    //         player1: 'John',
    //         player2: null,
    //         status: 'waiting',
    //     },
    //     {
    //         id: 'game456',
    //         createdAt: new Date('2024-11-24T09:30:00'),
    //         player1: 'Alice',
    //         player2: 'Bob',
    //         status: 'in_progress',
    //     },
    //     {
    //         id: 'game789',
    //         createdAt: new Date('2024-11-24T09:00:00'),
    //         player1: 'Eve',
    //         player2: 'Charlie',
    //         status: 'completed',
    //     },
    //     {
    //         id: 'game101',
    //         createdAt: new Date('2024-11-24T08:45:00'),
    //         player1: 'David',
    //         player2: null,
    //         status: 'waiting',
    //     },
    //     {
    //         id: 'game102',
    //         createdAt: new Date('2024-11-24T08:30:00'),
    //         player1: 'Sarah',
    //         player2: 'Mike',
    //         status: 'waiting',
    //     },
    // ];

    res.render('index', {
        username: req['username'],
        games: games,
    });
};
