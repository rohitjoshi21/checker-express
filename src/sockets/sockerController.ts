import { Socket, Server as SocketIOServer } from 'socket.io';
import { Server as HTTPServer } from 'http';
import { APIService } from '../services/apiService';
import { NextFunction, Request, Response } from 'express';
import { isAuthenticated } from '../middlewares/authMiddleware';

type Middleware = (req: Request, res: Response, next: (err?: any) => void) => void;

const wrap = (middleware: Middleware) => {
    return (socket: Socket, next: (err?: Error) => void): void => {
        middleware(socket.request as Request, {} as Response, next);
    };
};

export class SocketController {
    private io: SocketIOServer;
    private apiService: APIService;
    private currgameId?: string;

    constructor(server: HTTPServer, middleware: Middleware) {
        this.io = new SocketIOServer(server);

        this.io.of(/^\/game\/join-game\/([a-zA-Z0-9_-]+)$/).use(wrap(isAuthenticated));
        this.apiService = new APIService();
        this.initializeSocket();
    }

    private initializeSocket() {
        this.io.of(/^\/game\/join-game\/([a-zA-Z0-9_-]+)$/).on('connection', (socket) => {
            // socket.username =
            const namespace = socket.nsp;
            this.currgameId = namespace.name.split('/')[3];
            console.log('connected to dynamic url', this.currgameId);
            console.log('this is request', socket.request);
            socket.on('move', (move) => {
                const { fromX, fromY, toX, toY, capture } = move;
                this.apiService.makeMove(this.currgameId!, fromX, fromY, toX, toY, capture);
                console.log(move);

                // socket.request
                const boarddata = this.apiService.getBoardData(this.currgameId!, 'rohit');
                socket.emit('boardupdate');
            });

            socket.on('disconnect', () => {
                console.log('user disconnected');
            });
        });
    }
}
