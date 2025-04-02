import Store from 'electron-store';
import { EventEmitter } from 'events';

export const store:any = new Store();

export const storeEvents = new EventEmitter();

export function setStoreValue(key: string, value: any) {
    store.set(key, value);
    storeEvents.emit('update', key, value);
}

export function getStoreValue(key: string) {
    return store.get(key);
}
