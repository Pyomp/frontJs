import { EventDispatcher } from '../../../../modules/common/EventDispatcher.js'

const TUTO_POINTER_LOCK = 1

export class Progress extends EventDispatcher {
    #binary = 0

    get tuto_pointer_lock() { return (this.#binary & TUTO_POINTER_LOCK) !== 0 }
    set tuto_pointer_lock(a) {
        if (a === this.tuto_pointer_lock) return
        if (a) { this.#binary |= TUTO_POINTER_LOCK }
        else { this.#binary &= ~TUTO_POINTER_LOCK }
        this.emit('change')
    }

    toArray = () => [
        this.#binary,
    ]

    fromArray = (a) => {
        if (a?.constructor !== Array) return
        this.#binary = a[0]
    }
}






