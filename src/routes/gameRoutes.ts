import express from 'express';
import { getCreateGamePage, getJoinGamePage } from '../controllers/gameController';

const router = express.Router();

router.get('/create-game', getCreateGamePage);

router.get('/join-game', getJoinGamePage);


export default router;
