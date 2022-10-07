import { EventDispatcher } from '../../../../../../modules/common/EventDispatcher.js'

const ON_GROUND = 1
const MOVED = 1 << 1
const RUNNING = 1 << 2
const ANIM_IDLE = 53465
export class State extends EventDispatcher {

    properties = 0

    get is_on_ground() { return (this.properties & ON_GROUND) !== 0 }
    set is_on_ground(a) {
        if (a) this.properties |= ON_GROUND
        else this.properties &= ~ON_GROUND
    }

    get is_moved() { return (this.properties & MOVED) !== 0 }
    set is_moved(a) {
        if (a) this.properties |= MOVED
        else this.properties &= ~MOVED
    }

    get is_running() { return (this.properties & RUNNING) !== 0 }
    set is_running(a) {
        if (a) this.properties |= RUNNING
        else this.properties &= ~RUNNING
    }


    #animation = ANIM_IDLE

    get animation() { return this.#animation }
    set animation(a) {
        if (a !== this.#animation) {
            this.#animation = a
            this.emit('animation')
        }
    }

}











