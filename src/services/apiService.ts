import { GameRepository } from '../repos/gameRepo';

export class APIService {
    private gameRepository: GameRepository;

    constructor() {
        this.gameRepository = new GameRepository();
    }

    //need  to define interface for gamedata
    async getBoardData(gameId: string, username: string) {
        // console.log(gameId, username);
        const game = await this.gameRepository.findGame(gameId);
        if (!game) {
            throw new Error('Game not found');
        }

        let nextplayer = game.players.find((player) => player != username);
        let isFlipped = false;
        if (game.players.indexOf(username!) === 1) {
            isFlipped = true;
        }

        // console.log(game.board);
        return {
            board: game.board,
            turn: game.turn,
            flipped: isFlipped,
            status: game.status,
            nextPlayer: nextplayer,
        };
    }

    async makeMove(gameId: string, fromX: number, fromY: number, toX: number, toY: number, capture: number) {
        const game = await this.gameRepository.findGame(gameId);
        if (!game) {
            throw new Error('Game not found');
        }

        if (!this.isValidMove(game.board, fromX, fromY, toX, toY, capture, game.turn)) {
            throw new Error('Invalid move');
        }

        // Update board
        const newBoard = [...game.board];
        newBoard[toX * 8 + toY] = newBoard[fromX * 8 + fromY];
        newBoard[fromX * 8 + fromY] = 0;

        if (capture) {
            const captureX = (fromX + toX) / 2;
            const captureY = (fromY + toY) / 2;
            newBoard[captureX * 8 + captureY] = 0;
        }

        // Check for promotion
        if (toY === 0 || toY === 7) {
            const piece = newBoard[toX * 8 + toY];
            if (Math.abs(piece) === 1) {
                newBoard[toX * 8 + toY] = piece * 2;
            }
        }

        game.board = newBoard;
        game.turn = -game.turn;
        game.updatedAt = new Date();

        // Check for winner
        const winner = this.checkWinner(newBoard);
        if (winner) {
            game.status = 'completed';
            game.winner = game.players[winner === 1 ? 0 : 1];
        }

        await game.save();

        return {
            board: game.board,
            turn: game.turn,
            status: game.status,
            winner: game.winner,
        };
    }

    private isValidMove(
        board: number[],
        fromX: number,
        fromY: number,
        toX: number,
        toY: number,
        capture: number,
        turn: number,
    ): boolean {
        // server-side validation logic needs to be put here
        return true;
    }

    private checkWinner(board: number[]): number | null {
        let hasRed = false;
        let hasBlue = false;

        for (const piece of board) {
            if (piece > 0) hasRed = true;
            if (piece < 0) hasBlue = true;
        }

        if (!hasRed) return -1;
        if (!hasBlue) return 1;
        return null;
    }
}
