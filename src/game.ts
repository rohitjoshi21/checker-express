// Types for better type safety and documentation
interface GameState {
    board: number[];
    turn: number;
    flipped: boolean;
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
    
    // Initialize with non-null assertion as these will be set in initialize()
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
      isSelected: false
    };
    private possibleMoves: Array<[number, number, number]> = [];
  
    constructor() {
      // Initialize with dummy values that will be replaced in initialize()
      this.canvas = document.createElement('canvas');
      this.ctx = this.canvas.getContext('2d')!;
      this.gameId = '';
      
      // Initialize game when DOM is loaded
      window.addEventListener('DOMContentLoaded', () => this.initialize());
    }
  
    private async initialize(): Promise<void> {
      // Get canvas and context
      const canvasElement = document.getElementById('myCanvas') as HTMLCanvasElement;
      if (!canvasElement) {
        throw new Error('Canvas element not found');
      }
      
      this.canvas = canvasElement;
      this.canvas.width = this.BOARD_SIZE;
      this.canvas.height = this.BOARD_SIZE;
      
      const context = this.canvas.getContext('2d');
      if (!context) {
        throw new Error('Could not get canvas context');
      }
      this.ctx = context;
  
      // Get game ID from URL
      const gameId = window.location.href.split('/')[5];
      if (!gameId) {
        throw new Error('Game ID not found in URL');
      }
      this.gameId = gameId;
  
      // Set up event listeners
      this.canvas.addEventListener('click', (e) => this.handleClick(e));
  
      // Initialize game state
      await this.fetchBoardState();
      this.startPolling();
    }
  
    private async fetchBoardState(): Promise<void> {
      try {
        const response = await fetch(`/api/games/${this.gameId}/board`);
        if (!response.ok) throw new Error('Failed to fetch board');
        
        const data: GameState = await response.json();
        this.updateGameState(data);
        this.drawBoard();
      } catch (error) {
        console.error('Error fetching board:', error);
        this.showError('Failed to load the game. Please try refreshing.');
      }
    }
    
    private updatePlayerStatus(): void {
        const player1Status = document.getElementById('player1Status');
        const player2Status = document.getElementById('player2Status');
        const gameStatus = document.getElementById('gameStatus');
        const player1color = document.getElementById('player1color');
        const player2color = document.getElementById('player2color');
        
        console.log(this.turn);
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
      this.updatePlayerStatus();
    }
  
    private async sendMove(move: Move): Promise<void> {
      try {
        const response = await fetch(`/api/games/${this.gameId}/move`, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify(move)
        });
        
        if (!response.ok) throw new Error('Invalid move');
        await this.fetchBoardState();
      } catch (error) {
        console.error('Error sending move:', error);
        this.showError('Failed to make move. Please try again.');
      }
    }
  
    private startPolling(): void {
      setInterval(async () => {
        try {
          const response = await fetch(`/api/games/${this.gameId}/board`);
          if (!response.ok) throw new Error('Failed to get game status');
          
          const data: GameState = await response.json();
          if (data.turn !== this.turn) {
            this.updateGameState(data);
            this.drawBoard();
          }
        } catch (error) {
          console.error('Error polling game status:', error);
        }
      }, 500);
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
          directions = [[1, forward], [-1, forward]];
        } else {
          // King move
          directions = [[1, 1], [-1, 1], [1, -1], [-1, -1]];
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

            } else if (targetPiece * this.turn < 0) { // Enemy piece
              
              const jumpX = newX + dx;
              const jumpY = newY + dy;
              
              if (jumpX >= 0 && jumpX <= 7 && jumpY >= 0 && jumpY <= 7) {
                if (this.board[jumpX * 8 + jumpY] === 0) {
                  moves.push([jumpX, jumpY, 1]);// Valid capture move
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
        if (this.board[x * 8 + adjustedY] === this.myPiece || 
            this.board[x * 8 + adjustedY] === this.myPiece * 2) {
          this.handlePieceSelection(x, adjustedY);
        } else if (this.selectedPiece.isSelected) {
          await this.handleMoveAttempt(x, adjustedY);
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

    private async handleMoveAttempt(x: number, y: number): Promise<void> {
      const move = this.possibleMoves.find(([p, q]) => p === x && q === y);
      if (move) {
        const response = await this.sendMove({
          fromX: this.selectedPiece.x,
          fromY: this.selectedPiece.y,
          toX: x,
          toY: y,
          capture: move[2]
        });
        // const data = response.json();
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
  }
  
  // Initialize the game
  new CheckersGame();