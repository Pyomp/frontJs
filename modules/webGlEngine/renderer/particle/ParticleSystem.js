import { Particle } from "./Particle.js"

export class ParticleSystem {
    /** @type {Particle[]} */
    #particles = []
    #data
    #count

    #interval

    constructor({
        deltaTimeSecond,
        data,
        position,
        velocity,
        color,
    }) {
        this.#data = data

        this.#count = position.length / 4

        for (let i = 0; i < this.#count; i++) {
            const nextI = i + 1
            this.#particles.push(
                new Particle({
                    deltaTimeSecond,
                    position: position.subarray(i * 4, nextI * 4),
                    velocity: velocity.subarray(i * 3, nextI * 3),
                    color: color.subarray(i * 4, nextI * 4),
                })
            )
        }


        this.#interval = setInterval(this.#update.bind(this), deltaTimeSecond * 1000)
    }

    #update() {
        let particleCount = 0
        for (let i = 0; i < this.#count; i++) {
            this.#particles[i].update()
            if (!this.#particles[i].isFree) particleCount++
        }

        this.#data[1] = particleCount

        this.#data[0] += 1
    }

    setParticle(params) {
        for (const particle of this.#particles) {
            if (particle.isFree) {
                particle.set(params)
                return
            }
        }
    }

    dispose() {
        this.#particles.length = 0
        clearInterval(this.#interval)
    }
}

