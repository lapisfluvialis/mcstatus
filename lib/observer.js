import { EventEmitter } from "./event.js";
import { set_diff } from "./util.js";
import 'https://mcapi.us/scripts/minecraft.min.js';
export class MinecraftServerObserver extends EventEmitter {
    host;
    port;
    intervalID = undefined;
    _online = false;
    _players_max = undefined;
    _players_now = undefined;
    players = new Set();
    last_updated = '';
    constructor(host, port = 25565) {
        super();
        this.host = host;
        this.port = port;
    }
    get online() {
        return this._online;
    }
    get players_sample() {
        return this.players;
    }
    get players_now() {
        return this._players_now;
    }
    get players_max() {
        return this._players_max;
    }
    start() {
        if (this.intervalID)
            return;
        this.status();
        this.intervalID = setInterval(this.status.bind(this), 3 * 60 * 1000);
    }
    stop() {
        if (!this.intervalID)
            return;
        this.intervalID = undefined;
        clearInterval(this.intervalID);
    }
    status() {
        MinecraftAPI.getServerStatus(this.host, { port: this.port }, (err, res) => {
            const now = new Date();
            if (err) {
                this.emit('error', { error: err });
                console.error(`[${now.toLocaleTimeString()}] ${err}`);
                return;
            }
            console.info(`[${now.toLocaleTimeString()}] getServerStatus: ${res.online ? 'online' : 'offline'}`);
            const was_online = this._online;
            const is_online = res.online;
            this._online = res.online;
            if (!was_online && is_online) {
                this.emit('open', { online: true });
            }
            if (was_online && !is_online) {
                this.emit('close', { online: false });
            }
            this._players_max = res.players.max;
            this._players_now = res.players.now;
            const players_past = this.players;
            const players_now = new Set(res.players.sample.map(p => p.name));
            const players_join = set_diff(players_now, players_past);
            const players_leave = set_diff(players_past, players_now);
            this.players = players_now;
            if (players_join.size > 0) {
                this.emit('players_join', { players: players_join });
            }
            if (players_leave.size > 0) {
                this.emit('players_leave', { players: players_leave });
            }
            if (this.last_updated !== res.last_updated) {
                this.emit('update', { last_updated: res.last_updated });
                this.last_updated = res.last_updated;
            }
        });
    }
}
