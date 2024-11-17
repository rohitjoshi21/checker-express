import express, { Response, Request, NextFunction, RequestHandler } from 'express';
import { isAuthenticated } from '../middlewares/authMiddleware';
import Game from '../models/gameModel';
import { CustomRequest } from '../types/custom';
import { createNewBoard, getBoardData, makeMove} from '../controllers/apiController';
const router = express.Router();

// Initialize a new game
router.post('/new',  createNewBoard);

router.get('/:gameId/board', getBoardData); 

// Make a move
router.post('/:gameId/move', makeMove);

// router.get('/:gameId/status', getStatus);



export default router;
// Helper functions remain the same