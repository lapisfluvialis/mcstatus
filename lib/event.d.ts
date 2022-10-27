export declare type Event = {
    readonly [key: string]: any;
};
export declare type EventMap = {
    readonly [type: string]: Event;
};
export declare class EventEmitter<EventMap> {
    private eventTarget;
    on<K extends Extract<keyof EventMap, string>>(type: K, callback: (ev: CustomEventInit<EventMap[K]>) => any): void;
    emit<K extends Extract<keyof EventMap, string>>(type: K, detail: EventMap[K]): void;
}
