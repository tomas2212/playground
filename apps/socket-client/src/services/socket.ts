import { io, Socket } from 'socket.io-client';
import { Observable } from 'rxjs';

export interface ServerMessage {
    time: string;
}

// pripojenie na Socket.IO server
const socket: Socket = io('http://localhost:3000', {
    transports: ['websocket'], // odporúčané
});

// RxJS observable z "time" eventu
export const timeSocket$ = new Observable<ServerMessage>((subscriber) => {
    const handler = (data: ServerMessage) => subscriber.next(data);

    // socket.on('time', handler);
    socket.on('serverTimeInterval', handler);

    // cleanup
    return () => {
        // socket.off('time', handler);
        socket.off('serverTimeInterval', handler);
        // socket.disconnect();
    };
});