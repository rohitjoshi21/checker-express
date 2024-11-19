import { initializeBoard } from '../utils/gameUtils';
import { GameRepository } from '../repos/gameRepo';

export class GameService {
    private gameRepository: GameRepository;

    constructor() {
        this.gameRepository = new GameRepository();
    }

    async createNewGame(username: string): Promise<string> {
        const initialBoard = initializeBoard();
        const gameId = await this.gameRepository.saveGame(username, initialBoard);
        return gameId;
    }

    async joinGame(username: string, gameId: string): Promise<string[]> {
        const game = await this.gameRepository.findGame(gameId);
        if (!game) {
            throw 'Game not found';
        }

        if (!game.players.includes(username)) {
            if (game.players.length >= 2) {
                throw 'Game is full';
            }

            this.gameRepository.addPlayer(gameId, username);
        }

        let player1 = game.players[0];
        let player2 = 'Not Joined';
        if (game.players.length >= 2) {
            player2 = game.players[1];
        }

        if (game.players.indexOf(username) == 0) {
            return [player1, player2];
        } else if (game.players.indexOf(username) == 1) {
            return [player2, player1];
        }
        return [];
    }
}
