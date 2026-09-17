import { webSocket } from 'rxjs/webSocket';

export interface ServerMessage {
    time: string;
}

// vytvoríme subject pre websocket  == takto je to ked sa pouziva libka ws
export const timeSocket$ = webSocket<ServerMessage>('ws://localhost:4000');