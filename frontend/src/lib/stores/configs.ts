import { writable } from 'svelte/store'

export const defaultValue = {
    sfx: 10,
    bgm: 10,
    keyUp: 'KeyW',
    keyDown: 'KeyS',
    keyLeft: 'KeyA',
    keyRight: 'KeyD',
    keyEscape: 'Escape',
    keyAction: 'Space',
    keyReturn: 'Enter',
}

export const configs = writable<typeof defaultValue>(defaultValue)

