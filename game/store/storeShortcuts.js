import { Shortcut } from '../../models/Shortcut.js'

export const ACTION_UP = 0
export const ACTION_DOWN = 1
export const ACTION_LEFT = 2
export const ACTION_RIGHT = 3
export const ACTION_INTERACT = 4
export const ACTION_JUMP = 5
export const ACTION_0 = 6
export const ACTION_1 = 7
export const ACTION_2 = 8
export const ACTION_3 = 9
export const ACTION_4 = 10
export const ACTION_5 = 11
export const ACTION_6 = 12
export const ACTION_MENU = 13

export const storeShortcuts = {
    [ACTION_UP]: new Shortcut({ action: ACTION_UP, code: 'KeyW' }),
    [ACTION_DOWN]: new Shortcut({ action: ACTION_DOWN, code: 'KeyS' }),
    [ACTION_LEFT]: new Shortcut({ action: ACTION_LEFT, code: 'KeyA' }),
    [ACTION_RIGHT]: new Shortcut({ action: ACTION_RIGHT, code: 'KeyD' }),
    [ACTION_INTERACT]: new Shortcut({ action: ACTION_INTERACT, code: 'KeyF' }),
    [ACTION_JUMP]: new Shortcut({ action: ACTION_JUMP, code: 'Space' }),
    [ACTION_0]: new Shortcut({ action: ACTION_0, code: 'Digit1' }),
    [ACTION_1]: new Shortcut({ action: ACTION_1, code: 'Digit2' }),
    [ACTION_2]: new Shortcut({ action: ACTION_2, code: 'Digit3' }),
    [ACTION_3]: new Shortcut({ action: ACTION_3, code: 'Digit4' }),
    [ACTION_4]: new Shortcut({ action: ACTION_4, code: 'Digit5' }),
    [ACTION_5]: new Shortcut({ action: ACTION_5, code: 'Digit6' }),
    [ACTION_6]: new Shortcut({ action: ACTION_6, code: 'Digit7' }),
    [ACTION_MENU]: new Shortcut({ action: ACTION_MENU, code: 'Tab' }),

    toArray() {
        return [
            this[ACTION_UP].toString(),
            this[ACTION_DOWN].toString(),
            this[ACTION_LEFT].toString(),
            this[ACTION_RIGHT].toString(),
            this[ACTION_INTERACT].toString(),
            this[ACTION_JUMP].toString(),
            this[ACTION_0].toString(),
            this[ACTION_1].toString(),
            this[ACTION_2].toString(),
            this[ACTION_3].toString(),
            this[ACTION_4].toString(),
            this[ACTION_5].toString(),
            this[ACTION_6].toString(),
            this[ACTION_MENU].toString()
        ]
    },

    fromArray(array) {
        if (array?.constructor !== Array) return
        let i = 0
        this[ACTION_UP].fromString(array[i++])
        this[ACTION_DOWN].fromString(array[i++])
        this[ACTION_LEFT].fromString(array[i++])
        this[ACTION_RIGHT].fromString(array[i++])
        this[ACTION_INTERACT].fromString(array[i++])
        this[ACTION_JUMP].fromString(array[i++])
        this[ACTION_0].fromString(array[i++])
        this[ACTION_1].fromString(array[i++])
        this[ACTION_2].fromString(array[i++])
        this[ACTION_3].fromString(array[i++])
        this[ACTION_4].fromString(array[i++])
        this[ACTION_5].fromString(array[i++])
        this[ACTION_6].fromString(array[i++])
        this[ACTION_MENU].fromString(array[i++])
    },

    *[Symbol.iterator]() {
        yield this[ACTION_UP]
        yield this[ACTION_DOWN]
        yield this[ACTION_LEFT]
        yield this[ACTION_RIGHT]
        yield this[ACTION_INTERACT]
        yield this[ACTION_JUMP]
        yield this[ACTION_0]
        yield this[ACTION_1]
        yield this[ACTION_2]
        yield this[ACTION_3]
        yield this[ACTION_4]
        yield this[ACTION_5]
        yield this[ACTION_6]
        yield this[ACTION_MENU]
    }
}
