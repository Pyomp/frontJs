export class RafLoop {
    performanceNowMs
    performanceNowS
    dtS
    dateNowMs
    dateNowS

    #last = 0
    #isActive = true

    #callback

    constructor(update) {
        this.#callback = update
        requestAnimationFrame(this.#updateBound)
    }

    #updateBound = this.#update.bind(this)
    #update(now) {
        this.dateNowMs = Date.now()
        this.dateNowS = this.dateNowMs / 1000

        this.performanceNowMs = now
        this.performanceNowS = now / 1000

        this.dtS = Math.min(this.performanceNowS - this.#last, 0.1)

        this.#last = this.performanceNowS

        this.#callback()

        if (this.#isActive) requestAnimationFrame(this.#updateBound)
    }

    dispose() {
        this.#isActive = false
    }
}