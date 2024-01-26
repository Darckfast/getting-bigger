import { writable } from 'svelte/store'

export interface Controls {
    isActionPress: boolean
    isLeftPress: boolean
    isReturnPress: boolean
    isRightPress: boolean
    isDownPress: boolean
    isPhonePress: boolean
    isEscapePress: boolean
    isUpPress: boolean
    isMultiKey: boolean
    isKeyBeingPress: boolean
    locked: boolean
    pressingFor: number
    pressingStart: number
    callbacks: any[]
}

export const controls = writable<Controls>({
    isActionPress: false,
    locked: false,
    pressingFor: 0,
    isUpPress: false,
    isDownPress: false,
    isLeftPress: false,
    isRightPress: false,
    isReturnPress: false,
    isPhonePress: false,
    isEscapePress: false,
    isKeyBeingPress: false,
    isMultiKey: false,
    pressingStart: 0,
    callbacks: [],
    on(key: string, callback: () => any) {
        this.callbacks.push({ key, callback })
    },
    off(toRemove: string, toRemoveCallback: () => any) {
        if (toRemove === undefined) {
            this.callbacks = []
            return
        }

        for (let i = 0; i < this.callbacks.length; i++) {
            const { key, callback } = this.callbacks[i]

            if (key === toRemove && callback === toRemoveCallback) {
                this.callbacks.splice(i, 1)
            }

            if (key === toRemove && toRemoveCallback === undefined) {
                this.callbacks.splice(i, 1)
            }

            if (toRemove === undefined) {
                this.callbacks.splice(i, 1)
            }
        }
    }
})
