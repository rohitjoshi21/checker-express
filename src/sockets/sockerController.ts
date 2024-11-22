import { Socket, Server as SocketIOServer } from 'socket.io';
import { Server as HTTPServer } from 'http';
import { APIService } from '../services/apiService';
import { NextFunction, Request, Response } from 'express';
import { isAuthenticatedSocket } from '../middlewares/authMiddleware';
type Middleware = (req: Request, res: Response, next: (err?: any) => void) => void;

const wrap = (middleware: Middleware) => {
    return (socket: Socket, next: (err?: Error) => void): void => {
        middleware(socket.request as Request, {} as Response, next);
    };
};

// const wrap = (middleware: Middleware) => {
//     return (socket: Socket, next: (err?: Error) => void): void => {
//         const request = socket.request as Request;
//         middleware(request, {} as Response, next);
//     };s
// };

export class SocketController {
    private io: SocketIOServer;
    private apiService: APIService;
    private currgameId?: string;
    private namespace;

    constructor(server: HTTPServer, middlewares: []) {
        this.io = new SocketIOServer(server);

        this.namespace = this.io.of(/^\/game\/join-game\/([a-zA-Z0-9_-]+)$/);
        for (let middleware of middlewares) {
            this.namespace.use(wrap(middleware));
        }

        this.namespace.use(isAuthenticatedSocket);

        this.apiService = new APIService();
        this.initializeSocket();
    }

    private async broadcastboard(socket: Socket, username: string) {
        const boarddata = await this.apiService.getBoardData(this.currgameId!, username);

        //broadcasting to all connections, need to send this to only players of this board
        socket.emit('boardupdate', boarddata);
        boarddata.flipped = !boarddata.flipped;
        socket.broadcast.emit('boardupdate', boarddata);
    }

    private async initializeSocket() {
        this.namespace.on('connection', (socket) => {
            let username: string;
            const namespace = socket.nsp;
            this.currgameId = namespace.name.split('/')[3];

            username = socket.data.username;
            this.broadcastboard(socket, username);

            socket.on('move', async (move) => {
                console.log('move by ', username);
                const { fromX, fromY, toX, toY, capture } = move;
                await this.apiService.makeMove(this.currgameId!, fromX, fromY, toX, toY, capture);
                console.log(move);

                this.broadcastboard(socket, username);
            });

            socket.on('disconnect', () => {
                console.log('user disconnected');
            });
        });
    }
}
