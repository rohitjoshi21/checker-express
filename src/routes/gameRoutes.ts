import express from 'express';
import { GameController } from '../controllers/gameController';

const gameController = new GameController();

const router = express.Router();

router.get('/create-game', gameController.getCreateGamePage);

router.get('/join-game/:gameId', gameController.getJoinGamePage);

export default router;
