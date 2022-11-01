export class State {
    onState = new Set()

    #state
    get state() { return this.#state }
    set state(newState) {
        this.#state = newState
        for (const callback of this.onState) callback()
    }
}
const { onState, state } = new State()