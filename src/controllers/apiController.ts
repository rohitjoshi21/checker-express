import { Request, Response, NextFunction } from 'express';
import { Game } from '../models/gameModel';
import { APIService } from '../services/apiService';

export class APIController {
    private readonly apiService: APIService;
    constructor() {
        this.apiService = new APIService();
    }

    async getBoardData(req: Request, res: Response, next: NextFunction): Promise<void> {
        try {
            const boarddata = await this.apiService.getBoardData(req.params.gameId, req['username']!);
            res.json(boarddata);
        } catch (error) {
            next(new Error('Failed to fetch game'));
            // res.status(500).json({ error: 'Failed to fetch game' });
        }
    }

    async makeMove(req: Request, res: Response, next: NextFunction): Promise<void> {
        try {
            const { fromX, fromY, toX, toY, capture } = req.body;
            const boardData = await this.apiService.makeMove(req.params.gameId, fromX, fromY, toX, toY, capture);
            res.json(boardData);
        } catch (error) {
            next(error);
            // res.status(500).json({ error: 'Failed to make move' });
        }
    }
}
