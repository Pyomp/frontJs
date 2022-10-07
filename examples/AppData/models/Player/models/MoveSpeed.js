export class MoveSpeed {
    value = 1

    #base = 1
    get base() { return this.#base }
    set base(value) { this.#base = value; this.#updateValue() }

    #updateValue() {
        this.value = this.#base
    }

    constructor() {
        this.#updateValue()
    }
}