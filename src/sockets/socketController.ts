import { Socket, Server as SocketIOServer } from 'socket.io';
import { Server as HTTPServer } from 'http';
import { APIService } from '../services/apiService';
import { Request, Response } from 'express';

const gameWindowRegex = /^\/game\/join-game\/([a-zA-Z0-9_-]+)$/;

export class SocketController {
    private io: SocketIOServer;
    private apiService: APIService;
    private namespace;

    constructor(server: HTTPServer) {
        this.io = new SocketIOServer(server, {
            cors: {
                origin: '*',
                methods: ['GET', 'POST'],
            },
        });

        this.namespace = this.io.of(gameWindowRegex);

        this.apiService = new APIService();
        this.initializeSocket();
    }

    public use(middleware: (req: Request, res: Response, next: any) => void) {
        //this wrapper uses middleware only for handshake requests
        const newmiddleware = (req: Request & { _query: Record<string, string> }, res: Response, next: any) => {
            const isHandshake = req._query.sid === undefined;
            if (isHandshake) {
                middleware(req, res, next);
            } else {
                next();
            }
        };
        this.io.engine.use(newmiddleware);
    }

    private async broadcastboard(socket: Socket, gameid: string, username: string) {
        const boarddata = await this.apiService.getBoardData(gameid, username);

        let nextPlayer = boarddata.nextUsername;
        // let observers = boarddata.observers;
        // observers.forEach((observer: string) => {
        //     this.namespace.to(observer).emit('boardupdate', boarddata);
        // });
        this.namespace.to(username).emit('boardupdate', boarddata);
        if (nextPlayer) {
            boarddata.nextUsername = boarddata.myUsername;
            boarddata.myUsername = nextPlayer;

            boarddata.flipped = !boarddata.flipped;
            this.namespace.to(nextPlayer).emit('boardupdate', boarddata);
        }
    }

    private async initializeSocket() {
        this.namespace.on('connection', (socket) => {
            let username: string, currgameId: string;
            currgameId = socket.nsp.name.split('/')[3];

            // username = socket.data.username;
            let req = socket.request as Request;
            username = req['username']!;

            console.log('User Connected: ', username);

            socket.join(username);

            this.broadcastboard(socket, currgameId, username);

            socket.on('move', async (move) => {
                console.log('move by ', username);
                const { fromX, fromY, toX, toY, capture } = move;
                await this.apiService.makeMove(currgameId, fromX, fromY, toX, toY, capture);

                this.broadcastboard(socket, currgameId, username);
            });

            socket.on('resign', async () => {
                console.log('resigned');
                await this.apiService.resign(currgameId, username);
                this.broadcastboard(socket, currgameId, username);
            });

            socket.on('disconnect', () => {
                console.log('User Disconnected: ', username);
            });
        });
    }
}
