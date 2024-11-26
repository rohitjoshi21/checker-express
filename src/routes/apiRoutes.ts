import express from 'express';
import { APIController } from '../controllers/apiController';

const router = express.Router();
const apiController = new APIController();

router.get('/:gameId/board', apiController.getBoardData.bind(apiController));
router.post('/:gameId/move', apiController.makeMove.bind(apiController));

export default router;
