window.onload = function() {
    const size = 560;
    const bsize = 560/8;
    const gameId = window.location.href.split('/')[5];
    console.log(gameId);
    
    var c = document.getElementById("myCanvas")! as HTMLCanvasElement;
    c.width = size;
    c.height = size;
    var ctx = c.getContext("2d")!;

    let turn = -1;
    let selP = -1;
    let selQ = -1;
    let possMoves: number[][] = [[]];
    let pieceSelected = false;
    let board: number[] = new Array(64).fill(0);
    let flipped: boolean = false;
    let myPiece = -1;

    // Fetch initial board state from server
    async function fetchBoardState() {
        try {
            const response = await fetch(`/api/games/${gameId}/board`);
            if (!response.ok) throw new Error('Failed to fetch board');
            const data = await response.json();
            
            board = data.board;
            turn = data.turn;
            flipped = data.flipped;
            if (flipped){
                myPiece = 1;
            }
            // if (flipped){
            //     board = board.reverse();
            // }

            drawBoard();
        } catch (error) {
            console.error('Error fetching board:', error);
        }
    }

    // Send move to server
    async function sendMove(fromX: number, fromY: number, toX: number, toY: number, capture: number) {
        try {
            const response = await fetch(`/api/games/${gameId}/move`, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify({
                    fromX,
                    fromY,
                    toX,
                    toY,
                    capture
                })
            });
            
            if (!response.ok) throw new Error('Failed to send move');
            // const data = await response.json();
            fetchBoardState();
            // board = data.board;
            // turn = data.turn;
            // drawBoard();
        } catch (error) {
            console.error('Error sending move:', error);
        }
    }

    // Poll for updates
    function startPolling() {
        setInterval(async () => {
            try {
                const response = await fetch(`/api/games/${gameId}/board`);
                if (!response.ok) throw new Error('Failed to get game status');
                const data = await response.json();
                 
                if (data.turn !== turn) {
                    board = data.board;
                    turn = data.turn;

                    // if (flipped){
                    //     board = board.reverse();
                    // }
                    drawBoard();
                }
            } catch (error) {
                console.error('Error polling game status:', error);
            }
        }, 2000); // Poll every 2 seconds
    }

    let drawBoard = function(): void {
 
        let parity = 0;
        if (flipped) parity = 1;
        for(let i=0;i<8;i++){
            for(let j=0;j<8;j++){
                let topx = i*bsize;
                let topy = j*bsize;
                

                if ((i+j) % 2 == parity){
                    ctx.fillStyle = "black";  
                }
                else{
                    ctx.fillStyle = "white";
                }
                ctx.fillRect(topx,topy,topx+bsize,topy+bsize);
                
                //putting pieces
                
                let newj = j;
                if (flipped){
                    newj = 7-j;
                }
                if (board[i*8+newj] > 0 ){
                    ctx.fillStyle = "red";
                }
                else if (board[i*8+newj] < 0 ){
                    ctx.fillStyle = "blue";
                }
                
                ctx.beginPath();
                ctx.arc(topx+bsize/2,topy+bsize/2,bsize*0.4,0,2*Math.PI);
                ctx.fill();
                ctx.closePath(); 

                if (Math.abs(board[i*8+newj]) == 2){
                    ctx.beginPath();
                    ctx.fillStyle = "black";
                    ctx.arc(topx+bsize/2,topy+bsize/2,bsize*0.2,0,2*Math.PI);
                    ctx.fill();
                    ctx.closePath();
                }
            }
        }
    }

    let drawValidMove = function(p: number, q: number, color: string = "black"): void {
        if (flipped) q = 7-q;
        const topx = p*bsize;
        const topy = q*bsize;
        ctx.fillStyle = color;
        ctx.beginPath();
        ctx.arc(topx+bsize/2,topy+bsize/2,bsize*0.4,0,2*Math.PI);
        ctx.stroke();
        ctx.closePath(); 
    }

    let updateMoves = function(i: number, j: number): void {
        const piece = board[i*8+j];
        if (Math.abs(piece) == 1){
            possMoves = [[i+1,j+turn,0],[i-1,j+turn,0]];
        }
        else{
            possMoves = [[i+1,j+1,0],[i-1,j+1,0],[i+1,j-1,0],[i-1,j-1,0]];
        }

        for(let move of possMoves){
            const p = move[0];
            const q = move[1];
            if (board[p*8+q] == 0){
                drawValidMove(p,q);
            }
            else{
                possMoves = possMoves.filter(item => item !== move);
                if (board[p*8+q] != turn){
                    const newP = p+(p-i);
                    const newQ = q+(q-j);
                    if (board[newP*8+newQ] == 0){
                        possMoves.push([newP,newQ,1]);
                        drawValidMove(newP,newQ)
                    }
                }
            }
        }
    }

    let onClick = async function(event: any): Promise<void> {
        const rect = c.getBoundingClientRect();
        const x = event.clientX - rect.left;
        const y = event.clientY - rect.top;   

        let i = Math.floor(x / bsize);
        let j = Math.floor(y / bsize);
        if (flipped) j = 7 - j;
        if (myPiece == turn && (board[i*8+j] == myPiece || board[8*i+j] == myPiece*2)){
            drawBoard();

            if (selP == i && selQ == j){
                selP = -1;
                selQ = -1;
                possMoves = [[]];
                pieceSelected = false;
                return;
            }
            else{
                pieceSelected = true;
                selP = i;
                selQ = j;
            }

            drawValidMove(selP,selQ);
            updateMoves(i,j);
        }
        else if (pieceSelected == true){
            for (let move of possMoves){
                if (move[0] === i && move[1] === j){
                    const capture = move[2];
                    await sendMove(selP, selQ, i, j, capture);
                    pieceSelected = false;
                    return;
                }
            }
        }
    };

    // Initialize the game
    fetchBoardState();
    startPolling();
    c.addEventListener('click', onClick, false);
}