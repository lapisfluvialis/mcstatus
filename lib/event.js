export class EventEmitter {
    eventTarget = new EventTarget();
    on(type, callback) {
        this.eventTarget.addEventListener(type, callback);
    }
    emit(type, detail) {
        this.eventTarget.dispatchEvent(new CustomEvent(type, { detail }));
    }
}
