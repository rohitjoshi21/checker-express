import Game, {IGame} from '../models/gameModel';

export const gameService = {
    async createnewgame(username: string): Promise<string> {
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
                players: [username],
                board: initialBoard,
                turn: -1,
                status: 'waiting'
            });

            const savedGame = await game.save();
            return savedGame._id.toString();

        } catch (err) {
            console.log(err);
            return '';
        }
    }
};