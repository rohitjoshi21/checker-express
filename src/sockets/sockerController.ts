import { Socket, Server as SocketIOServer } from 'socket.io';
import { Server as HTTPServer } from 'http';
import { APIService } from '../services/apiService';
import { isAuthenticatedSocket, MiddlewareFunction } from '../middlewares/authMiddleware';

const a = /^\/game\/join-game\/([a-zA-Z0-9_-]+)$/;

export class SocketController {
    private io: SocketIOServer;
    private apiService: APIService;
    private currgameId?: string;
    private namespace;

    constructor(server: HTTPServer, socketurl: RegExp) {
        this.io = new SocketIOServer(server);

        this.namespace = this.io.of(socketurl);

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

    public use(middleware: MiddlewareFunction) {
        this.namespace.use(middleware);
    }

    private async initializeSocket() {
        this.namespace.on('connection', (socket) => {
            let username: string;
            this.currgameId = socket.nsp.name.split('/')[3];

            username = socket.data.username;

            console.log('User Connected: ', username);
            this.broadcastboard(socket, username);

            socket.on('move', async (move) => {
                console.log('move by ', username);
                const { fromX, fromY, toX, toY, capture } = move;
                await this.apiService.makeMove(this.currgameId!, fromX, fromY, toX, toY, capture);

                this.broadcastboard(socket, username);
            });

            socket.on('disconnect', () => {
                console.log('User Disconnected: ', username);
            });
        });
    }
}
