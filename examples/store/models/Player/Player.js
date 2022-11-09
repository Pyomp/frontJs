import { EventSet } from '../../../../models/Events.js'
import { Battle } from './models/Battle.js'
import { Customization } from './models/Customization.js'
import { Motion } from './models/Motion.js'
import { State } from './models/State.js'

export class Player {

    #id = -1
    get id() { return this.#id }
    set id(a) {
        if (
            Number.isInteger(a)
            && a > -1 && a < 2 ** 32
        ) {
            this.#id = a
        }
    }

    battle = new Battle()
    customization = new Customization()
    motion = new Motion()
    state = new State()

    constructor(id = -1) {
        super()
        this.id = id
    }

    onDispose = new EventSet()
    dispose(){
        this.onDispose.emit()
    }

    toArray() {
        return [
            this.#id,
            this.battle.toArray(),
            this.customization.toArray(),
            this.motion.toArray(),
        ]
    }

    fromArray(a) {
        if (a?.constructor !== Array) return
        this.id = a[0]
        this.battle.fromArray(a[1])
        this.customization.fromArray(a[2])
        this.motion.fromArray(a[3])
    }
}




