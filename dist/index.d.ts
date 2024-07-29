import { Channel } from 'phoenix';
import { Socket } from 'phoenix';

declare class Connection {
    socket: Socket;
    token: string | undefined;
    channels: Map<string, Channel>;
    constructor(host: string, port: number, protocol: string);
    static connect(connection: Connection): Promise<void>;
    static joinChannel(connection: Connection, topic: string, chanParams?: object): Promise<{
        channel: Channel;
        response: Message;
    }>;
    static send(channel: Channel, event: string, payload: object, withReply?: boolean): Promise<Message | null>;
    static setToken(connection: Connection, token: string): void;
    /**
     * Make sure connection is established, or throw an error
     * @param connection
     */
    static guard(connection: Connection): void;
}

declare class GenGame {
    state: GenGameState;
    static version: string;
    constructor(host: string, port: number, protocol?: string);
    connect(): Promise<void>;
    authenticateDevice(deviceId: string): Promise<any>;
    createMatch(): Promise<Match>;
    joinMatch(matchId: string): Promise<Match>;
    onChangeState(callback: Function): Promise<void>;
    setState(payload: object): Promise<void>;
}
export { GenGame }
export default GenGame;

declare interface GenGameState {
    connection: Connection;
    match?: Match;
}

declare interface Match {
    match_id: string;
    query?: any;
}

declare interface Message {
    [key: string]: string;
}

export { }
