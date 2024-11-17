import { Response, RequestHandler } from 'express';
// import { gameService } from '../services/gameService'; 
import { CustomRequest} from '../types/custom'
import Game from '../models/gameModel';

export const createNewBoard:RequestHandler = async (req: CustomRequest, res: Response) => {
    try {
        const initialBoard = new Array(64).fill(0);
        for(let i=0; i<8; i++){
            for(let j=0; j<8; j++){
                if ((i+j)%2 === 1){
                    if (j<=2){
                        initialBoard[i*8+j] = 1;
                    }
                    else if(j>=5){
                        initialBoard[i*8+j] = -1;
                    }
                }
            }
        }

        const game = new Game({
            players: [req.username],
            board: initialBoard,
            turn: -1,
            status: 'waiting'
        });

        await game.save();
        res.json({ gameId: game._id });
    } catch (error) {
        res.status(500).json({ error: 'Failed to create game' });
    }
};

export const getBoardData:RequestHandler = async (req: CustomRequest, res: Response):Promise<void> => {
    try {
        const game = await Game.findById(req.params.gameId);
        if (!game) {
            res.status(404).json({ error: 'Game not found' });
            return;
        }

        let isFlipped = false;
        if(game.players.indexOf(req.username!) == 1){
            isFlipped = true;
        }

        res.json({
            board: game.board,
            turn: game.turn,
            flipped: isFlipped,
            status: game.status
        });
    } catch (error) {
        res.status(500).json({ error: 'Failed to fetch game' });
    }
};

export const makeMove:RequestHandler = async (req: CustomRequest, res: Response):Promise<void> => {
    try {
        const game = await Game.findById(req.params.gameId);
        if (!game) {
            res.status(404).json({ error: 'Game not found' });
            return;
        }

        const { fromX, fromY, toX, toY, capture } = req.body;
        
        // Validate move
        if (!isValidMove(game.board, fromX, fromY, toX, toY, capture, game.turn)) {
            res.status(400).json({ error: 'Invalid move' });
            return;
        }

        // Update board
        const newBoard = [...game.board];
        newBoard[toX*8 + toY] = newBoard[fromX*8 + fromY];
        newBoard[fromX*8 + fromY] = 0;

        if (capture) {
            const captureX = (fromX + toX) / 2;
            const captureY = (fromY + toY) / 2;
            newBoard[captureX*8 + captureY] = 0;
        }

        // Check for promotion
        if (toY === 0 || toY === 7) {
            const piece = newBoard[toX*8 + toY];
            if (Math.abs(piece) === 1) {
                newBoard[toX*8 + toY] = piece * 2;
            }
        }

        game.board = newBoard;
        game.turn = -game.turn; // Switch turns
        game.updatedAt = new Date();

        // Check for winner
        const winner = checkWinner(newBoard);
        if (winner) {
            game.status = 'completed';
            game.winner = game.players[winner === 1 ? 0 : 1];
        }

        await game.save();

        // res.json({
        //     board: game.board,
        //     turn: game.turn,
        //     status: game.status,
        //     winner: game.winner
        // });
        res.json({msg:"Move recorded"});
    } catch (error) {
        res.status(500).json({ error: 'Failed to make move' });
    }
};

function isValidMove(board: number[], fromX: number, fromY: number, toX: number, toY: number, capture: number, turn: number): boolean {
    // Implement move validation logic
    // This should match your client-side validation
    return true; // Placeholder - implement actual validation
}

function checkWinner(board: number[]): number | null {
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
