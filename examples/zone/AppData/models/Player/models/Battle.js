import { EventDispatcher } from '../../../../../../modules/common/EventDispatcher.js'

export class Battle extends EventDispatcher {

    #hp = 100
    #max_hp = 100

    get hp() { return this.#hp }
    set hp(a) {
        if (
            a !== this.#hp
            && Number.isFinite(a)
            && a >= 0 && a <= this.#max_hp
        ) {
            this.#hp = a
            this.emit('hp')
        }
    }

    get max_hp() { return this.#max_hp }
    set max_hp(a) {
        if (
            a !== this.#max_hp
            && Number.isFinite(a)
            && a >= 100
        ) {
            this.#max_hp = a
            this.emit('max_hp')
        }
    }
    toArray = () => [
        this.#hp,
        this.#max_hp,
    ]

    fromArray = (a) => {
        if (a?.constructor !== Array) return
        this.hp = a[0]
        this.max_hp = a[1]
    }
}








