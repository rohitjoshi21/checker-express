import express from 'express';
import { GameController } from '../controllers/gameController';

const gameController = new GameController();

const router = express.Router();

router.get('/create-game', gameController.getCreateGamePage.bind(gameController));

router.get('/join-game/:gameId', gameController.getJoinGamePage.bind(gameController));

router.get('/logout', gameController.logout.bind(gameController));

export default router;
