import { Shortcut } from '../../models/Shortcut.js'
import {
    ACTION_UP,
    ACTION_DOWN,
    ACTION_LEFT,
    ACTION_RIGHT,

    ACTION_MENU,

    ACTION_0,
    ACTION_1,
    ACTION_2,
    ACTION_3,
    ACTION_4,
    ACTION_5,
    ACTION_6,
    ACTION_7,
    ACTION_8,
    ACTION_9,
    ACTION_10,
    ACTION_11,
} from '../../constants/constantsActions.js'

export const storeShortcuts = {
    [ACTION_UP]: new Shortcut({ action: ACTION_UP, code: 'KeyW' }),
    [ACTION_DOWN]: new Shortcut({ action: ACTION_DOWN, code: 'KeyS' }),
    [ACTION_LEFT]: new Shortcut({ action: ACTION_LEFT, code: 'KeyA' }),
    [ACTION_RIGHT]: new Shortcut({ action: ACTION_RIGHT, code: 'KeyD' }),

    [ACTION_MENU]: new Shortcut({ action: ACTION_MENU, code: 'Tab' }),

    [ACTION_0]: new Shortcut({ action: ACTION_0, code: 'Space' }),
    [ACTION_1]: new Shortcut({ action: ACTION_1, button: 2 }),
    [ACTION_2]: new Shortcut({ action: ACTION_2, button: 0 }),
    [ACTION_3]: new Shortcut({ action: ACTION_3, code: 'KeyR' }),
    [ACTION_4]: new Shortcut({ action: ACTION_4, code: 'KeyG' }),
    [ACTION_5]: new Shortcut({ action: ACTION_5, button: 1 }),
    [ACTION_6]: new Shortcut({ action: ACTION_6, code: 'KeyQ' }),
    [ACTION_7]: new Shortcut({ action: ACTION_7, code: 'KeyT' }),
    [ACTION_8]: new Shortcut({ action: ACTION_8, code: 'KeyE' }),
    [ACTION_9]: new Shortcut({ action: ACTION_9, code: 'KeyV' }),
    [ACTION_10]: new Shortcut({ action: ACTION_10, code: 'KeyC' }),
    [ACTION_11]: new Shortcut({ action: ACTION_11, code: 'KeyX' }),

    toArray() {
        return [
            this[ACTION_UP].toString(),
            this[ACTION_DOWN].toString(),
            this[ACTION_LEFT].toString(),
            this[ACTION_RIGHT].toString(),

            this[ACTION_MENU].toString(),

            this[ACTION_0].toString(),
            this[ACTION_1].toString(),
            this[ACTION_2].toString(),
            this[ACTION_3].toString(),
            this[ACTION_4].toString(),
            this[ACTION_5].toString(),
            this[ACTION_6].toString(),
            this[ACTION_7].toString(),
            this[ACTION_8].toString(),
            this[ACTION_9].toString(),
            this[ACTION_10].toString(),
            this[ACTION_11].toString(),
        ]
    },

    fromArray(array) {
        if (array?.constructor !== Array) return
        let i = 0
        this[ACTION_UP].fromString(array[i++])
        this[ACTION_DOWN].fromString(array[i++])
        this[ACTION_LEFT].fromString(array[i++])
        this[ACTION_RIGHT].fromString(array[i++])

        this[ACTION_MENU].fromString(array[i++])

        this[ACTION_0].fromString(array[i++])
        this[ACTION_1].fromString(array[i++])
        this[ACTION_2].fromString(array[i++])
        this[ACTION_3].fromString(array[i++])
        this[ACTION_4].fromString(array[i++])
        this[ACTION_5].fromString(array[i++])
        this[ACTION_6].fromString(array[i++])
        this[ACTION_7].fromString(array[i++])
        this[ACTION_8].fromString(array[i++])
        this[ACTION_9].fromString(array[i++])
        this[ACTION_10].fromString(array[i++])
        this[ACTION_11].fromString(array[i++])
    },

    *[Symbol.iterator]() {
        yield this[ACTION_UP]
        yield this[ACTION_DOWN]
        yield this[ACTION_LEFT]
        yield this[ACTION_RIGHT]

        yield this[ACTION_MENU]

        yield this[ACTION_0]
        yield this[ACTION_1]
        yield this[ACTION_2]
        yield this[ACTION_3]
        yield this[ACTION_4]
        yield this[ACTION_5]
        yield this[ACTION_6]
        yield this[ACTION_7]
        yield this[ACTION_8]
        yield this[ACTION_9]
        yield this[ACTION_10]
        yield this[ACTION_11]
    }
}
