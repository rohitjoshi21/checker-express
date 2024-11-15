window.onload= function (){
    console.log("hgell");
const size = 560;
const bsize = 560/8;
var c = document.getElementById("myCanvas")! as HTMLCanvasElement;
c.width = size;
c.height = size

var ctx = c.getContext("2d")!;

let turn = -1;

let selP = -1;
let selQ = -1;

let possMoves:number[][] = [[]];
let pieceSelected = false;

//intial board setup
let board: number[] = [];
for (let i = 0; i<64; ++i) {
    board.push(0);
}
for(let i=0;i<8;i++){
    for(let j=0;j<8;j++){
        if ((i+j)%2 ===1){
            if (j<=2){
                board[i*8+j] = 1;
            }
            else if(j>=5){
                board[i*8+j] = -1;
            }
        }
    }
}

let drawBoard = function():void{
    for(let i=0;i<8;i++){
        for(let j=0;j<8;j++){
            let topx = i*bsize;
            let topy = j*bsize;
            
            if ((i+j) % 2 == 0){
                ctx.fillStyle = "black";  
            }
            else{
                ctx.fillStyle = "white";
            }
            ctx.fillRect(topx,topy,topx+bsize,topy+bsize);
            // console.log(board);
            
            // putting pieces
            if (board[i*8+j] > 0 ){
                ctx.fillStyle = "red";
            }
            else if (board[i*8+j] < 0 ){
                ctx.fillStyle = "blue";
            }
            
            ctx.beginPath();

            ctx.arc(topx+bsize/2,topy+bsize/2,bsize*0.4,0,2*Math.PI);
            ctx.fill();
            ctx.closePath(); 

            if (Math.abs(board[i*8+j]) == 2){
                ctx.beginPath();
                ctx.fillStyle = "black";
                ctx.arc(topx+bsize/2,topy+bsize/2,bsize*0.2,0,2*Math.PI);
                ctx.fill();
                ctx.closePath();
            }
        }
    }
}

let drawValidMove = function(p:number,q:number,color:string="black"):void{

    const topx = p*bsize;
    const topy = q*bsize;
    ctx.fillStyle = color;
    ctx.beginPath();
    ctx.arc(topx+bsize/2,topy+bsize/2,bsize*0.4,0,2*Math.PI);
    ctx.stroke();
    ctx.closePath(); 
}

let switchTurn = function():void{
    turn = (turn == 1) ? -1 : 1;
}
let movePiece = function(a:number,b:number,p:number,q:number,capture:number){
    board[p*8+q] = board[a*8+b];
    board[a*8+b] = 0;
    ;
    if (capture){
        const cX = (a+p)/2;
        const cY = (b+q)/2;
        board[cX*8+cY] = 0;
    }

    //promotion
    if (q==0 || q==7){
        const currPiece = board[p*8+q];
        //check if it is already promoted piece
        if (Math.abs(currPiece) == 1){
            board[p*8+q] = currPiece * 2;
            console.log("Piece Promoted", turn);
        }
    }
    switchTurn();
    
}

let updateMoves = function(i:number,j:number):void{
    const piece = board[i*8+j];
    if (Math.abs(piece) == 1){
        console.log("Selected a non-promoted piece");
        possMoves = [[i+1,j+turn,0],[i-1,j+turn,0]]; //not-promoted piece
    }
    else{
        console.log("Selected a promoted piece");
        possMoves = [[i+1,j+1,0],[i-1,j+1,0],[i+1,j-1,0],[i-1,j-1,0]]; //promoted piece
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
                    //checking if this piece can be captured
                if (board[newP*8+newQ] == 0){
                    possMoves.push([newP,newQ,1]);
                    drawValidMove(newP,newQ)
                }
            }
        }
        
    }
}
let onClick = function(event:any):void{
    const rect = c.getBoundingClientRect();
    const x = event.clientX - rect.left;
    const y = event.clientY - rect.top;   

    const i = Math.floor(x / bsize);
    const j = Math.floor(y / bsize);
    
    
    if (board[i*8+j] == turn || board[8*i+j] == turn*2){
        drawBoard();

        //reclicking on a piece deactivates that piece
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
        const attack = 0
        for (let move of possMoves){
            if (move[0] === i && move[1] === j){
                // valid = true;
                const capture = move[2];
                movePiece(selP,selQ,i,j,capture);//from (selP,selQ) to (i,j)
                drawBoard();
                pieceSelected = false;
                
                return;
            }
        }
     

        
    }
 };

drawBoard();
c.addEventListener('click',onClick , false);


}
