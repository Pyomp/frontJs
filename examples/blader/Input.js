



export class Input {

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
        if (code === 'ArrowUp') this.arrowUp = true
        if (code === 'ArrowDown') this.arrowDown = true
        if (code === 'ArrowLeft') this.arrowLeft = true
        if (code === 'ArrowRight') this.arrowRight = true
    }

    #onKeyup = (e) => {
        const code = e.code
        if (code === 'ArrowUp') this.arrowUp = false
        if (code === 'ArrowDown') this.arrowDown = false
        if (code === 'ArrowLeft') this.arrowLeft = false
        if (code === 'ArrowRight') this.arrowRight = false
    }
}



