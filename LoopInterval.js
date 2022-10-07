export class LoopInterval {
    updatesPhysics = new Set()

    dtPhysicsRaf = 0
    dateNow = Date.now()
    dateNowSecond = this.dateNow / 1000
    perfNow = 0
    perfNowSecond = 0

    #dtPhysics
    #interval
    #maxDt
    constructor(dtInterval = 0.05, dtPhysics = 0.05, maxDt = 0.1) {
        this.#dtPhysics = dtPhysics
        this.#interval = setInterval(this.#update.bind(this), dtInterval)
        this.#maxDt = maxDt
    }

    #last = 0
    #update() {
        this.dateNow = Date.now()
        this.dateNowSecond = this.dateNow / 1000
        this.perfNow = performance.now()
        this.perfNowSecond = this.perfNow / 1000

        const dt = Math.min(this.perfNowSecond - this.#last, this.#maxDt)
        this.#last = this.perfNowSecond

        this.dtPhysicsRaf += dt
        while (this.dtPhysicsRaf > this.#dtPhysics) {
            this.dtPhysicsRaf -= this.#dtPhysics
            for (const f of this.updatesPhysics) f(this.#dtPhysics)
        }
    }

    dispose() {
        clearInterval(this.#interval)
    }
}





