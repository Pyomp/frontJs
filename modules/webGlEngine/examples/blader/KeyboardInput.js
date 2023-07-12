export class KeyboardInput {

    constructor() {
        addEventListener('keydown', this.#onKeydown)
        addEventListener('keyup', this.#onKeyup)
    }

    dispose() {
        removeEventListener('keydown', this.#onKeydown)
        removeEventListener('keyup', this.#onKeyup)
    }

    arrowUp = false
    arrowDown = false
    arrowLeft = false
    arrowRight = false
    #onKeydown = (e) => {
        const code = e.code
        if (code === 'KeyW') this.arrowUp = true
        if (code === 'KeyS') this.arrowDown = true
        if (code === 'KeyA') this.arrowLeft = true
        if (code === 'KeyD') this.arrowRight = true
    }

    #onKeyup = (e) => {
        const code = e.code
        if (code === 'KeyW') this.arrowUp = false
        if (code === 'KeyS') this.arrowDown = false
        if (code === 'KeyA') this.arrowLeft = false
        if (code === 'KeyD') this.arrowRight = false
    }
}
