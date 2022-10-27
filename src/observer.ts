import { EventEmitter, EventMap, Event } from "./event.js"
import { set_diff } from "./util.js"
import 'https://mcapi.us/scripts/minecraft.min.js'

interface StatusAPIResponse {
    status: string
    online: boolean
    motd: string
    motd_json: {
        extra?: {
            color: string
            text: string
        }[]
        text: string
    }
    favicon?: string
    error?: string
    players: {
        max: number
        now: number
        sample: {
            name: string
            id: string
        }[]
    }
    server: {
        name: string
        protocol: number
    }
    last_online?: string
    last_updated: string
    duration: string
}

declare global {
    var MinecraftAPI: {
        getServerStatus: (ip: string, options: { port: number }, callback: (err: string | undefined, res: StatusAPIResponse) => void) => void
    }
}

interface ServerStatusEvent extends Event {
    online: boolean
}
interface StatusUpdateEvent extends Event {
    last_updated: string
}
interface PlayerEvent extends Event {
    players: Set<string>
}
interface ErrorEvent extends Event {
    error: string
}

interface ObserverEventMap extends EventMap {
    'open': ServerStatusEvent
    'close': ServerStatusEvent
    'update': StatusUpdateEvent
    'players_join': PlayerEvent
    'players_leave': PlayerEvent
    'error': ErrorEvent
}

export class MinecraftServerObserver extends EventEmitter<ObserverEventMap> {
    private intervalID?: number = undefined
    private _online: boolean = false
    private _players_max?: number = undefined
    private _players_now?: number = undefined
    private players: Set<string> = new Set()
    private last_updated: string = ''
    constructor(private host: string, private port: number = 25565) {
        super()
    }

    get online() {
        return this._online
    }

    get players_sample() {
        return this.players
    }

    get players_now() {
        return this._players_now
    }

    get players_max() {
        return this._players_max
    }

    public start() {
        if (this.intervalID) return
        this.status()
        this.intervalID = setInterval(this.status.bind(this), 3 * 60 * 1000)

    }

    public stop() {
        if (!this.intervalID) return
        this.intervalID = undefined
        clearInterval(this.intervalID)
    }

    public status() {
        MinecraftAPI.getServerStatus(this.host, { port: this.port }, (err, res) => {
            const now = new Date()

            if (err) {
                this.emit('error', { error: err })
                console.error(`[${now.toLocaleTimeString()}] ${err}`)
                return
            }

            const updated = this.last_updated !== res.last_updated

            console.info(`[${now.toLocaleTimeString()}] getServerStatus: updated: ${updated}`)

            if (!updated) return

            const was_online = this._online
            const is_online = res.online
            this._online = res.online

            if (!was_online && is_online) {
                this.emit('open', { online: true })
            }

            if (was_online && !is_online) {
                this.emit('close', { online: false })
            }

            this._players_max = res.players.max
            this._players_now = res.players.now

            const players_past = this.players
            const players_now = new Set(res.players.sample.map(p => p.name))

            const players_join = set_diff(players_now, players_past)
            const players_leave = set_diff(players_past, players_now)
            this.players = players_now

            if (players_join.size > 0) {
                this.emit('players_join', { players: players_join })
            }
            if (players_leave.size > 0) {
                this.emit('players_leave', { players: players_leave })
            }

            this.emit('update', { last_updated: res.last_updated })
            this.last_updated = res.last_updated
        })
    }
}
