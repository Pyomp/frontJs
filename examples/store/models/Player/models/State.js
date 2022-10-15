export const STATE_ON_GROUND = 1
export const STATE_MOVED = 1 << 1
export const STATE_RUNNING = 1 << 2

export class State{

    properties = 0

    get isOnGround() { return (this.properties & ON_GROUND) !== 0 }
    set isOnGround(a) {
        if (a) this.properties |= ON_GROUND
        else this.properties &= ~ON_GROUND
    }

    get isMoved() { return (this.properties & MOVED) !== 0 }
    set isMoved(a) {
        if (a) this.properties |= MOVED
        else this.properties &= ~MOVED
    }

    get isRunning() { return (this.properties & RUNNING) !== 0 }
    set isRunning(a) {
        if (a) this.properties |= RUNNING
        else this.properties &= ~RUNNING
    }
}











