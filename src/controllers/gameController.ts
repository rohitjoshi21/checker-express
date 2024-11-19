import { Request, Response, NextFunction } from 'express';
import { GameService } from '../services/gameService';
import { Game } from '../models/gameModel';

export class GameController {
    private gameService: GameService;

    constructor() {
        this.gameService = new GameService();
    }

    async getCreateGamePage(req: Request, res: Response, next: NextFunction): Promise<void> {
        try {
            const gameId = await this.gameService.createNewGame(req['username']!);
            res.render('game/creategame', {
                gameID: gameId,
            });
        } catch (err) {
            next(err);
        }
    }

    async getJoinGamePage(req: Request, res: Response, next: NextFunction): Promise<void> {
        try {
            const players: string[] = await this.gameService.joinGame(req['username']!, req.params.gameId);
            res.render('game/gamewindow', {
                username: req['username'],
                player1: players[0],
                player2: players[1],
            });
        } catch (err) {
            next(err);
            // res.status(500).json({ error: 'Failed to join game' });
        }
    }
}
