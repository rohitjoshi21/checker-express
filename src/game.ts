import { io, Socket } from 'socket.io-client';

interface GameState {
    board: number[];
    turn: number;
    flipped: boolean;
    myUsername: string;
    nextUsername: string;
    status: string;
    winner: string;
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

    private readonly DARK_SQUARE = '#769656'; // Forest green for dark squares
    private readonly LIGHT_SQUARE = '#eeeed2'; // Light cream for light squares
    private readonly PIECE_ONE = '#db3e3e'; // Deep red for player 1
    private readonly PIECE_TWO = '#3e5edb'; // Royal blue for player 2
    private readonly VALID_MOVE = '#86af49'; // Soft green for valid moves
    private readonly SELECTED_SQUARE = '#baca44';

    private canvas: HTMLCanvasElement;
    private ctx: CanvasRenderingContext2D;
    private gameId: string;

    // Game state
    private board: number[] = new Array(64).fill(0);
    private turn: number = -1;
    private flipped: boolean = false;
    private myPiece: number = -1;
    private status: string = 'notpaired';

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

        this.canvas.style.boxShadow = '0 4px 8px rgba(0, 0, 0, 0.1)';
        this.canvas.style.borderRadius = '4px';

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
        const player1Card = document.getElementById('player1Card');
        const player2Card = document.getElementById('player2Card');
        const player1name = document.getElementById('player1name');
        const player2name = document.getElementById('player2name');
        const player1color = document.getElementById('player1color');
        const player2color = document.getElementById('player2color');

        if (player1name && player2name) {
            player1name.textContent = player1;
            player2name.textContent = player2;
        }

        if (player1Card && player2Card && player1color && player2color) {
            if (this.flipped) {
                // Player 1 is red (1), Player 2 is blue (-1)
                player1Card.className = `player-card ${this.turn === 1 ? 'active' : 'inactive'}`;
                player2Card.className = `player-card ${this.turn === -1 ? 'active' : 'inactive'}`;
                player1color.className = 'color-indicator red-piece';
                player2color.className = 'color-indicator blue-piece';
            } else {
                // Player 1 is blue (-1), Player 2 is red (1)
                player1Card.className = `player-card ${this.turn === -1 ? 'active' : 'inactive'}`;
                player2Card.className = `player-card ${this.turn === 1 ? 'active' : 'inactive'}`;
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
        this.status = data.status;

        if (this.status == 'completed') {
            const resultModal = document.getElementById('resultModal')!;
            const resultTitle = document.getElementById('resultTitle')!;
            const resultMessage = document.getElementById('resultMessage')!;
            const homeButton = document.getElementById('homeButton')!;

            let title: string;
            let message: string;
            let titleClass: string;

            if (data.winner == data.myUsername) {
                title = 'Congratulations!';
                message = 'You won the game!';
                titleClass = 'winner-text';
            } else {
                title = 'Game Over';
                message = 'You lost the game!';
                titleClass = 'loser-text';
            }

            resultTitle.textContent = title;
            resultTitle.className = `result-title ${titleClass}`;
            resultMessage.textContent = message;

            // Show the modal
            resultModal.classList.add('show');

            // Add event listener to home button
            homeButton.onclick = () => {
                window.location.href = '/';
            };

            const gameStatus = document.getElementById('gameStatus')!;
            gameStatus.style.display = 'none';
        }

        this.updatePlayerStatus(data.myUsername, data.nextUsername);
    }

    private drawBoard(): void {
        const parity = this.flipped ? 1 : 0;

        // Draw board background
        this.ctx.fillStyle = '#2f2f2f';
        this.ctx.fillRect(0, 0, this.BOARD_SIZE, this.BOARD_SIZE);

        // Draw squares with subtle gradient
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

        this.ctx.fillStyle = (i + j) % 2 === parity ? this.DARK_SQUARE : this.LIGHT_SQUARE;
        this.ctx.fillRect(x, y, this.CELL_SIZE, this.CELL_SIZE);

        // Highlight selected square
        if (
            this.selectedPiece.isSelected &&
            this.selectedPiece.x === i &&
            (this.flipped ? 7 - this.selectedPiece.y : this.selectedPiece.y) === j
        ) {
            this.ctx.fillStyle = this.SELECTED_SQUARE;
            this.ctx.globalAlpha = 0.5;
            this.ctx.fillRect(x, y, this.CELL_SIZE, this.CELL_SIZE);
            this.ctx.globalAlpha = 1;
        }
    }

    private drawPiece(i: number, j: number): void {
        const adjustedJ = this.flipped ? 7 - j : j;
        const piece = this.board[i * 8 + adjustedJ];
        if (piece === 0) return;

        const x = i * this.CELL_SIZE + this.CELL_SIZE / 2;
        const y = j * this.CELL_SIZE + this.CELL_SIZE / 2;
        const radius = this.CELL_SIZE * 0.35;

        // Add shadow
        this.ctx.shadowColor = 'rgba(0, 0, 0, 0.3)';
        this.ctx.shadowBlur = 4;
        this.ctx.shadowOffsetX = 2;
        this.ctx.shadowOffsetY = 2;

        // Draw main piece with gradient
        const gradient = this.ctx.createRadialGradient(x - radius / 3, y - radius / 3, radius / 10, x, y, radius);

        if (piece > 0) {
            gradient.addColorStop(0, '#ff6b6b');
            gradient.addColorStop(1, this.PIECE_ONE);
        } else {
            gradient.addColorStop(0, '#6b96ff');
            gradient.addColorStop(1, this.PIECE_TWO);
        }

        this.ctx.fillStyle = gradient;
        this.ctx.beginPath();
        this.ctx.arc(x, y, radius, 0, 2 * Math.PI);
        this.ctx.fill();

        // Reset shadow
        this.ctx.shadowColor = 'transparent';
        this.ctx.shadowBlur = 0;
        this.ctx.shadowOffsetX = 0;
        this.ctx.shadowOffsetY = 0;

        // Draw king marker with metallic effect
        if (Math.abs(piece) === 2) {
            const kingGradient = this.ctx.createRadialGradient(
                x - radius / 4,
                y - radius / 4,
                radius / 8,
                x,
                y,
                radius / 2,
            );
            kingGradient.addColorStop(0, '#fff');
            kingGradient.addColorStop(0.5, '#ffd700');
            kingGradient.addColorStop(1, '#daa520');

            this.ctx.fillStyle = kingGradient;
            this.ctx.beginPath();
            this.ctx.arc(x, y, radius * 0.4, 0, 2 * Math.PI);
            this.ctx.fill();
        }
    }

    private drawValidMove(p: number, q: number): void {
        const adjustedQ = this.flipped ? 7 - q : q;
        const x = p * this.CELL_SIZE + this.CELL_SIZE / 2;
        const y = adjustedQ * this.CELL_SIZE + this.CELL_SIZE / 2;

        // Draw outer circle
        this.ctx.strokeStyle = this.VALID_MOVE;
        this.ctx.lineWidth = 3;
        this.ctx.beginPath();
        this.ctx.arc(x, y, this.CELL_SIZE * 0.35, 0, 2 * Math.PI);
        this.ctx.stroke();

        // Draw inner dot
        this.ctx.fillStyle = this.VALID_MOVE;
        this.ctx.beginPath();
        this.ctx.arc(x, y, this.CELL_SIZE * 0.1, 0, 2 * Math.PI);
        this.ctx.fill();
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
