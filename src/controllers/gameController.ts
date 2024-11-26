import { Request, Response, NextFunction } from 'express';
import { GameService } from '../services/gameService';
import { RedirectPaths } from '../config/redirects';

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
            });
        } catch (err) {
            next(err);
        }
    }

    async logout(req: Request, res: Response, next: NextFunction): Promise<void> {
        try {
            const cookieName = 'token';

            res.clearCookie(cookieName, {
                httpOnly: true, // Ensures cookie is only accessible over HTTP(S), not JavaScript
                secure: true, // Ensures cookie is only sent over HTTPS (set to true in production)
                sameSite: 'strict', // Ensures cookie is sent only to same-site requests (for CSRF protection)
            });
            res.redirect(RedirectPaths.authLogin);
        } catch (err) {
            next(err);
        }
    }
}
