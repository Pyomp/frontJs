import { EventChange } from '../../../modules/common/Events.js'

const TUTO_POINTER_LOCK = 1

export class Progress extends EventTarget {
    #binary = 0

    get tutoPointerLock() { return (this.#binary & TUTO_POINTER_LOCK) !== 0 }
    set tutoPointerLock(a) {
        if (a === this.tutoPointerLock) return
        if (a) { this.#binary |= TUTO_POINTER_LOCK }
        else { this.#binary &= ~TUTO_POINTER_LOCK }
        this.dispatchEvent(EventChange)
    }

    toArray() {
        return [
            this.#binary,
        ]
    }

    fromArray(a) {
        if (a?.constructor !== Array) return
        this.#binary = a[0]
    }
}






