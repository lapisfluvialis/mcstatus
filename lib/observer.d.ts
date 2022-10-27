import { EventEmitter, EventMap, Event } from "./event.js";
import 'https://mcapi.us/scripts/minecraft.min.js';
interface StatusAPIResponse {
    status: string;
    online: boolean;
    motd: string;
    motd_json: {
        extra?: {
            color: string;
            text: string;
        }[];
        text: string;
    };
    favicon?: string;
    error?: string;
    players: {
        max: number;
        now: number;
        sample: {
            name: string;
            id: string;
        }[];
    };
    server: {
        name: string;
        protocol: number;
    };
    last_online?: string;
    last_updated: string;
    duration: string;
}
declare global {
    var MinecraftAPI: {
        getServerStatus: (ip: string, options: {
            port: number;
        }, callback: (err: string | undefined, res: StatusAPIResponse) => void) => void;
    };
}
interface ServerStatusEvent extends Event {
    online: boolean;
}
interface StatusUpdateEvent extends Event {
    last_updated: string;
}
interface PlayerEvent extends Event {
    players: Set<string>;
}
interface ErrorEvent extends Event {
    error: string;
}
interface ObserverEventMap extends EventMap {
    'open': ServerStatusEvent;
    'close': ServerStatusEvent;
    'update': StatusUpdateEvent;
    'players_join': PlayerEvent;
    'players_leave': PlayerEvent;
    'error': ErrorEvent;
}
export declare class MinecraftServerObserver extends EventEmitter<ObserverEventMap> {
    private host;
    private port;
    private intervalID?;
    private _online;
    private _players_max?;
    private _players_now?;
    private players;
    private last_updated;
    constructor(host: string, port?: number);
    get online(): boolean;
    get players_sample(): Set<string>;
    get players_now(): number | undefined;
    get players_max(): number | undefined;
    start(): void;
    stop(): void;
    status(): void;
}
export {};
