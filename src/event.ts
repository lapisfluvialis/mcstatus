export type Event = {
    readonly [key: string]: any
}
export type EventMap = {
    readonly [type: string]: Event
}

export class EventEmitter<EventMap> {
    private eventTarget: EventTarget = new EventTarget()
    on<K extends Extract<keyof EventMap, string>>(type: K, callback: (ev: CustomEventInit<EventMap[K]>) => any) {
        this.eventTarget.addEventListener(type, callback as EventListenerOrEventListenerObject)
    }

    emit<K extends Extract<keyof EventMap, string>>(type: K, detail: EventMap[K]) {
        this.eventTarget.dispatchEvent(new CustomEvent(type, { detail }))
    }
}
