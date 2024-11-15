import { Request, Response, RequestHandler } from 'express';
import { gameService } from '../services/gameService'; 

export const getCreateGamePage = (req: Request, res: Response) => {

    const gameId = gameService.createnewgame();
    res.render('game/creategame',{
        'gameId':gameId
    });
};

export const getJoinGamePage = (req: Request, res: Response) => {
    res.render('game');
};