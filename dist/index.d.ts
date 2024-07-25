declare class Connection {
    host: string;
    port: number;
    constructor(host: string, port: number);
    authenticateDeviceAsync(deviceId: string): void;
}

declare class GenGame {
    connection: Connection;
    static version: string;
    constructor(host: string, port: number);
    createMatch(): Promise<Match>;
}
export { GenGame }
export default GenGame;

declare interface Match {
    id: string;
}

export { }
