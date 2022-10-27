import { MinecraftServerObserver } from "./observer.js";
const params = new URLSearchParams(window.location.search);
const host = params.get('h');
const port = Number(params.get('p') ?? 25565);
const host_elm = document.getElementById('host');
const status_elm = document.getElementById('status');
const players_elm = document.getElementById('players');
const last_updated_elm = document.getElementById('last_updated');
if (host && host_elm && status_elm && players_elm && last_updated_elm) {
    const observer = new MinecraftServerObserver(host, port);
    observer.start();
    host_elm.innerText = ` - ${host}`;
    observer.on('open', _ => {
        status_elm.innerText = 'Online';
    });
    observer.on('close', _ => {
        status_elm.innerText = 'Offline';
        players_elm.innerText = '';
    });
    observer.on('error', ev => {
        status_elm.innerText = ev.detail.error;
        players_elm.innerText = '';
    });
    observer.on('update', ev => {
        const utime = Number(ev.detail.last_updated);
        const dateTime = new Date(utime * 1000);
        last_updated_elm.innerText = dateTime.toString();
    });
    const player_event_handler = (_) => {
        let text = `${observer.players_now} player(s) online: `;
        text += Array.from(observer.players_sample).join(', ');
        if (observer.players_now > observer.players_sample.size) {
            text += ', ... and more';
        }
        players_elm.innerText = text;
    };
    observer.on('players_join', player_event_handler);
    observer.on('players_leave', player_event_handler);
}
else if (status_elm) {
    status_elm.innerText = `Usage: ?h={host}&p={port}`;
}
