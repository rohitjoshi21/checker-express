import { Request, Response, RequestHandler } from 'express';
import { gameService } from '../services/gameService'; 
import { CustomRequest} from '../types/custom'
import Game from '../models/gameModel';


export const getCreateGamePage:RequestHandler = async (req: CustomRequest, res: Response) => {
    
    const gameId:string = await gameService.createnewgame(req.username!);
    res.render('game/creategame',{
        'gameID':gameId
    });

};


//this function need to shifted to gameService 
export const getJoinGamePage:RequestHandler = async (req: CustomRequest, res: Response):Promise<void> => {
    try {
        const game = await Game.findById(req.params.gameId);
        if (!game) {
            res.status(404).json({ error: 'Game not found' });
            return;
        }


        if (!game.players.includes(req.username!)){
            if (game.players.length >= 2)  {
                res.status(400).json({ error: 'Game is full' });
            }
            game.players.push(req.username!); 
            game.status = 'active';
            await game.save();
        }

        res.render('gamewindow',{
            'username':req.username
        });

        // res.json({ message: 'Joined game successfully' });
    } catch (error) {
        res.status(500).json({ error: 'Failed to join game' });
    }
};
