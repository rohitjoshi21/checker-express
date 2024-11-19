import express from 'express';
import {
    createNewBoard,
    getBoardData,
    makeMove,
} from '../controllers/apiController';

const router = express.Router();

router.post('/new', createNewBoard);
router.get('/:gameId/board', getBoardData);
router.post('/:gameId/move', makeMove);

export default router;
