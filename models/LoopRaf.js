
export class LoopRaf {
    updatesPhysics = new Set()
    updatesParticles = new Set()
    updatesFrame = new Set()

    dtPhysicsRaf = 0
    dtParticlesRaf = 0
    dateNow = Date.now()
    dateNowSecond = this.dateNow / 1000
    perfNow = 0
    perfNowSecond = 0

    #maxDt
    #rendererDraw
    #dtPhysics
    #dtParticles
    /**
     * if dtInterval === 0 => requestAnimationFrame
    */
    constructor(
        rendererDraw,
        dtPhysics = 0.05,
        dtParticles = 0.05,
        maxDt = 0.1
    ) {
        this.#rendererDraw = rendererDraw
        this.#dtPhysics = dtPhysics
        this.#dtParticles = dtParticles
        this.#maxDt = maxDt

        requestAnimationFrame(this.#updateBound)
    }

    #last = 0
    #updateBound = this.#update.bind(this)
    #update(now) {
        this.dateNow = Date.now()
        this.dateNowSecond = this.dateNow / 1000
        this.perfNow = now
        this.perfNowSecond = now / 1000

        const dt = Math.min(this.perfNowSecond - this.#last, this.#maxDt)
        this.#last = this.perfNowSecond

        this.dtPhysicsRaf += dt
        while (this.dtPhysicsRaf > this.#dtPhysics) {
            this.dtPhysicsRaf -= this.#dtPhysics
            for (const f of this.updatesPhysics) f(this.#dtPhysics)
        }

        this.dtParticlesRaf += dt
        while (this.dtParticlesRaf > this.#dtParticles) {
            this.dtParticlesRaf -= this.#dtParticles
            for (const f of this.updatesParticles) f(this.#dtParticles)
        }

        for (const f of this.updatesFrame) f(dt)

        this.#rendererDraw(dt)

        requestAnimationFrame(this.#updateBound)
    }

    dispose = () => {
        cancelAnimationFrame(this.#updateBound)
    }
}





