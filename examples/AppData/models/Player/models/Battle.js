export const EventHp = new Event('hp')
export const EventMaxHp = new Event('maxHp')

export class Battle extends EventTarget {
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
            this.dispatchEvent(EventHp)
        }
    }

    get maxHp() { return this.#max_hp }
    set maxHp(a) {
        if (
            a !== this.#max_hp
            && Number.isFinite(a)
            && a >= 100
        ) {
            this.#max_hp = a
            this.dispatchEvent(EventMaxHp)
        }
    }
    toArray() {
        return [
            this.#hp,
            this.#max_hp,
        ]
    }

    fromArray(array) {
        if (array?.constructor !== Array) return
        this.hp = array[0]
        this.maxHp = array[1]
    }
}








