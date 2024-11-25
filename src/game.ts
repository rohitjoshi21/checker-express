import { io, Socket } from 'socket.io-client';

interface GameState {
    board: number[];
    turn: number;
    flipped: boolean;
    myUsername: string;
    nextUsername: string;
    status: string;
}

interface Move {
    fromX: number;
    fromY: number;
    toX: number;
    toY: number;
    capture: number;
}

class CheckersGame {
    private readonly BOARD_SIZE = 560;
    private readonly CELL_SIZE = this.BOARD_SIZE / 8;

    private canvas: HTMLCanvasElement;
    private ctx: CanvasRenderingContext2D;
    private gameId: string;

    // Game state
    private board: number[] = new Array(64).fill(0);
    private turn: number = -1;
    private flipped: boolean = false;
    private myPiece: number = -1;

    // Selection state
    private selectedPiece = {
        x: -1,
        y: -1,
        isSelected: false,
    };
    private possibleMoves: Array<[number, number, number]> = [];

    private socket!: Socket;

    constructor() {
        this.canvas = document.createElement('canvas');
        this.ctx = this.canvas.getContext('2d')!;
        this.gameId = '';

        // Initialize game when DOM is loaded
        window.addEventListener('DOMContentLoaded', () => this.initialize());
    }

    get gameid() {
        return this.gameId;
    }

    private async initialize(): Promise<void> {
        this.canvas = document.getElementById('myCanvas') as HTMLCanvasElement;
        this.canvas.width = this.BOARD_SIZE;
        this.canvas.height = this.BOARD_SIZE;

        const context = this.canvas.getContext('2d')!;
        this.ctx = context;

        // Get game ID from URL
        const gameId = window.location.href.split('/')[5];
        this.gameId = gameId;

        this.setupSocketConnection();

        // Set up event listeners
        const resignButton = document.getElementById('resign')!;
        resignButton.addEventListener('click', (e) => this.handleResign(e));
        this.canvas.addEventListener('click', (e) => this.handleClick(e));
    }

    private handleResign(e: Event) {
        console.log('clicked');
        this.socket.emit('resign');
        document.getElementById('gameStatus')!.textContent = 'You have resigned. Game Over!';
    }

    private updatePlayerStatus(player1: string, player2: string): void {
        const player1Status = document.getElementById('player1Status');
        const player2Status = document.getElementById('player2Status');
        const gameStatus = document.getElementById('gameStatus');
        const player1color = document.getElementById('player1color');
        const player2color = document.getElementById('player2color');
        const player1name = document.getElementById('player1name');
        const player2name = document.getElementById('player2name');

        if (player1name && player2name) {
            player1name.textContent = player1;
            player2name.textContent = player2;
            console.log(player1, player2);
            // player1name.textContent = 'abc';
            // player2name.textContent = 'efg';
        }
        // console.log(this.turn);
        if (player1Status && player2Status && player1color && player2color && gameStatus) {
            if (this.flipped) {
                // Player 1 is red (1), Player 2 is blue (-1)
                player1Status.className = `player-status ${this.turn === 1 ? 'active-turn' : 'waiting-turn'}`;
                player2Status.className = `player-status ${this.turn === -1 ? 'active-turn' : 'waiting-turn'}`;
                player1Status.textContent = this.turn === 1 ? 'Your Turn' : 'Waiting...';
                player2Status.textContent = this.turn === -1 ? 'Your Turn' : 'Waiting...';
                player1color.className = 'color-indicator red-piece';
                player2color.className = 'color-indicator blue-piece';
            } else {
                // Player 1 is blue (-1), Player 2 is red (1)
                player1Status.className = `player-status ${this.turn === -1 ? 'active-turn' : 'waiting-turn'}`;
                player2Status.className = `player-status ${this.turn === 1 ? 'active-turn' : 'waiting-turn'}`;
                player1Status.textContent = this.turn === -1 ? 'Your Turn' : 'Waiting...';
                player2Status.textContent = this.turn === 1 ? 'Your Turn' : 'Waiting...';
                player1color.className = 'color-indicator blue-piece';
                player2color.className = 'color-indicator red-piece';
            }
        }
    }

    private updateGameState(data: GameState): void {
        this.board = data.board;
        this.turn = data.turn;
        this.flipped = data.flipped;
        this.myPiece = this.flipped ? 1 : -1;
        this.updatePlayerStatus(data.myUsername, data.nextUsername);
    }

    private drawBoard(): void {
        const parity = this.flipped ? 1 : 0;

        // Draw board squares
        for (let i = 0; i < 8; i++) {
            for (let j = 0; j < 8; j++) {
                this.drawSquare(i, j, parity);
                this.drawPiece(i, j);
            }
        }
    }

    private drawSquare(i: number, j: number, parity: number): void {
        const x = i * this.CELL_SIZE;
        const y = j * this.CELL_SIZE;

        this.ctx.fillStyle = (i + j) % 2 === parity ? 'black' : 'white';
        this.ctx.fillRect(x, y, this.CELL_SIZE, this.CELL_SIZE);
    }

    private drawPiece(i: number, j: number): void {
        const adjustedJ = this.flipped ? 7 - j : j;
        const piece = this.board[i * 8 + adjustedJ];
        if (piece === 0) return;

        const x = i * this.CELL_SIZE + this.CELL_SIZE / 2;
        const y = j * this.CELL_SIZE + this.CELL_SIZE / 2;
        const radius = this.CELL_SIZE * 0.4;

        // Draw main piece
        this.ctx.fillStyle = piece > 0 ? 'red' : 'blue';
        this.ctx.beginPath();
        this.ctx.arc(x, y, radius, 0, 2 * Math.PI);
        this.ctx.fill();

        // Draw king marker
        if (Math.abs(piece) === 2) {
            this.ctx.fillStyle = 'black';
            this.ctx.beginPath();
            this.ctx.arc(x, y, radius * 0.5, 0, 2 * Math.PI);
            this.ctx.fill();
        }
    }

    private drawValidMove(p: number, q: number): void {
        const adjustedQ = this.flipped ? 7 - q : q;
        const x = p * this.CELL_SIZE + this.CELL_SIZE / 2;
        const y = adjustedQ * this.CELL_SIZE + this.CELL_SIZE / 2;

        this.ctx.strokeStyle = 'green';
        this.ctx.lineWidth = 2;
        this.ctx.beginPath();
        this.ctx.arc(x, y, this.CELL_SIZE * 0.4, 0, 2 * Math.PI);
        this.ctx.stroke();
    }

    private calculateValidMoves(i: number, j: number): Array<[number, number, number]> {
        const piece = this.board[i * 8 + j];
        let moves: Array<[number, number, number]> = [];

        // Define possible move directions based on piece type
        let directions: Array<[number, number]> = [];
        if (Math.abs(piece) === 1) {
            // normal move
            const forward = this.turn;
            directions = [
                [1, forward],
                [-1, forward],
            ];
        } else {
            // King move
            directions = [
                [1, 1],
                [-1, 1],
                [1, -1],
                [-1, -1],
            ];
        }

        // Check each direction for moves and captures
        for (const [dx, dy] of directions) {
            const newX = i + dx;
            const newY = j + dy;

            // Check if position is within board
            if (newX >= 0 && newX <= 7 && newY >= 0 && newY <= 7) {
                const targetPiece = this.board[newX * 8 + newY];
                if (targetPiece === 0) {
                    moves.push([newX, newY, 0]); // Regular move
                } else if (targetPiece * this.turn < 0) {
                    // Enemy piece

                    const jumpX = newX + dx;
                    const jumpY = newY + dy;

                    if (jumpX >= 0 && jumpX <= 7 && jumpY >= 0 && jumpY <= 7) {
                        if (this.board[jumpX * 8 + jumpY] === 0) {
                            moves.push([jumpX, jumpY, 1]); // Valid capture move
                        }
                    }
                }
            }
        }

        return moves;
    }

    private async handleClick(event: MouseEvent): Promise<void> {
        const rect = this.canvas.getBoundingClientRect();
        const x = Math.floor((event.clientX - rect.left) / this.CELL_SIZE);
        const y = Math.floor((event.clientY - rect.top) / this.CELL_SIZE);
        const adjustedY = this.flipped ? 7 - y : y;

        if (this.myPiece === this.turn) {
            if (this.board[x * 8 + adjustedY] === this.myPiece || this.board[x * 8 + adjustedY] === this.myPiece * 2) {
                this.handlePieceSelection(x, adjustedY);
            } else if (this.selectedPiece.isSelected) {
                this.handleMoveAttempt(x, adjustedY);
            }
        }
    }

    private handlePieceSelection(x: number, y: number): void {
        this.drawBoard();

        if (this.selectedPiece.x === x && this.selectedPiece.y === y) {
            this.resetSelection();
        } else {
            this.selectedPiece = { x, y, isSelected: true };
            this.drawValidMove(x, y);
            this.possibleMoves = this.calculateValidMoves(x, y);
            this.possibleMoves.forEach(([p, q]) => this.drawValidMove(p, q));
        }
    }

    private checkWin(): boolean {
        return false;
    }

    private handleMoveAttempt(x: number, y: number): void {
        const move = this.possibleMoves.find(([p, q]) => p === x && q === y);
        if (move) {
            this.socket.emit('move', {
                fromX: this.selectedPiece.x,
                fromY: this.selectedPiece.y,
                toX: x,
                toY: y,
                capture: move[2],
            });
            this.checkWin();
            this.resetSelection();
        }
    }

    private resetSelection(): void {
        this.selectedPiece = { x: -1, y: -1, isSelected: false };
        this.possibleMoves = [];
    }

    private showError(message: string): void {
        alert(message);
    }

    private setupSocketConnection(): void {
        console.log('socket starting', game.gameid);

        const url = window.location.href;
        console.log(url);
        this.socket = io(url, {
            extraHeaders: {
                Authorization: document.cookie,
            },
        });

        this.socket.on('boardupdate', (boarddata) => {
            this.updateGameState(boarddata);
            this.drawBoard();
        });
    }
}

// Initialize the game
const game = new CheckersGame();
