import { Game } from '../models/gameModel';

export class GameRepository {
    async findGame(gameId: string) {
        const game = await Game.findById(gameId);
        return game;
    }

    async addPlayer(gameId: string, playername: string) {
        const game = await this.findGame(gameId);
        game!.players.push(playername);
        game!.status = 'active';
        await game!.save();
    }
    async saveGame(username: string, initialBoard: number[]): Promise<string> {
        const game = new Game({
            players: [username],
            board: initialBoard,
            turn: -1,
            status: 'notpaired',
        });
        const savedGame = await game.save();
        return savedGame._id.toString();
    }
}
