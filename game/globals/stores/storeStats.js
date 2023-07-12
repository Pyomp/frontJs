import { EventSet } from "../../../modules/utils/EventSet.js"

let hp = 100
const onHp = new EventSet()
let maxHp = 100
const onMaxHp = new EventSet()

export const storeStats = {
    onHp,
    get hp() { return hp },
    set hp(a) { if (a !== hp && Number.isFinite(a) && a >= 0 && a <= maxHp) { hp = a; onHp.emit() } },

    onMaxHp,
    get maxHp() { return maxHp },
    set maxHp(a) { if (a !== maxHp && Number.isFinite(a) && a > 0) { maxHp = a; onMaxHp.emit() } },

    toArray() {
        return [
            this.#hp,
            this.#max_hp,
        ]
    },

    fromArray(array) {
        if (array?.constructor !== Array) return
        this.hp = array[0]
        this.maxHp = array[1]
    }
}








