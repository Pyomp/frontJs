import { PARTICLE_GRAVITY, PARTICLE_VELOCITY_DECREASE_FACTOR } from "./ParticleConstant.js"

const FRAME_LENGTH = 6
const DefaultFrame = new Array(FRAME_LENGTH)

export class Particle {
    #time = 0
    #end = 0

    isFree = true

    #acceleration = [0, 0, 0]
    #accelerationFactor = 0.1

    #mass = 0

    #frames = DefaultFrame
    #frameCount = 1
    #lastFrameIndex = 0

    #deltaTimeSecond

    constructor({
        deltaTimeSecond,
        position,
        velocity,
        color,
    }) {
        this.#deltaTimeSecond = deltaTimeSecond
        this.positionBuffer = position
        this.velocityBuffer = velocity
        this.colorBuffer = color
        this.positionBuffer[1] = -1000
        this.positionBuffer[3] = 0
    }

    /**
     * @param {ParticleSetParams} params 
     */
    set([
        positionX, positionY, positionZ,
        accelerationX, accelerationY, accelerationZ,
        accelerationFactor,
        mass,
        end,
        ...frames
    ]) {
        this.#time = 0
        this.#end = end

        this.isFree = false

        this.#mass = mass

        this.#acceleration[0] = accelerationX
        this.#acceleration[1] = accelerationY
        this.#acceleration[2] = accelerationZ

        this.#accelerationFactor = accelerationFactor

        this.velocityBuffer[0] = 0
        this.velocityBuffer[1] = 0
        this.velocityBuffer[2] = 0

        this.positionBuffer[0] = positionX
        this.positionBuffer[1] = positionY
        this.positionBuffer[2] = positionZ

        this.#frames = frames
        this.#frameCount = frames.length / FRAME_LENGTH
        this.#lastFrameIndex = this.#frameCount - 1
    }

    update() {
        if (this.isFree) return

        this.#time += this.#deltaTimeSecond

        if (this.#time > this.#end) {
            this.isFree = true
            this.positionBuffer[1] = -1000
            this.positionBuffer[3] = 0
            this.#time = this.#end
        } else {
            this.positionBuffer[1] += this.velocityBuffer[1] * this.#deltaTimeSecond
        }
        this.positionBuffer[0] += this.velocityBuffer[0] * this.#deltaTimeSecond
        this.positionBuffer[2] += this.velocityBuffer[2] * this.#deltaTimeSecond

        this.#acceleration[0] *= this.#accelerationFactor
        this.#acceleration[1] *= this.#accelerationFactor
        this.#acceleration[2] *= this.#accelerationFactor

        this.velocityBuffer[0] = (this.velocityBuffer[0] + this.#acceleration[0]) * PARTICLE_VELOCITY_DECREASE_FACTOR
        this.velocityBuffer[1] = (this.velocityBuffer[1] - this.#mass * PARTICLE_GRAVITY + this.#acceleration[1]) * PARTICLE_VELOCITY_DECREASE_FACTOR
        this.velocityBuffer[2] = (this.velocityBuffer[2] + this.#acceleration[2]) * PARTICLE_VELOCITY_DECREASE_FACTOR

        this.#lerp()
    }

    #lerp() {
        let i = 0
        while (this.#frames[i * FRAME_LENGTH] < this.#time && i !== this.#lastFrameIndex) {
            i++
        }

        if (i === 0) {
            this.colorBuffer[0] = this.#frames[1]
            this.colorBuffer[1] = this.#frames[2]
            this.colorBuffer[2] = this.#frames[3]
            this.colorBuffer[3] = this.#frames[4]
            this.positionBuffer[3] = this.#frames[5]
        } else {
            const previousIndex = i - 1
            const alpha = (this.#time - this.#frames[previousIndex * FRAME_LENGTH]) / (this.#frames[i * FRAME_LENGTH] - this.#frames[previousIndex * FRAME_LENGTH])

            const v1r = this.#frames[previousIndex * FRAME_LENGTH + 1]
            const v1g = this.#frames[previousIndex * FRAME_LENGTH + 2]
            const v1b = this.#frames[previousIndex * FRAME_LENGTH + 3]
            const v1a = this.#frames[previousIndex * FRAME_LENGTH + 4]
            const v1s = this.#frames[previousIndex * FRAME_LENGTH + 5]

            const v2r = this.#frames[i * FRAME_LENGTH + 1]
            const v2g = this.#frames[i * FRAME_LENGTH + 2]
            const v2b = this.#frames[i * FRAME_LENGTH + 3]
            const v2a = this.#frames[i * FRAME_LENGTH + 4]
            const v2s = this.#frames[i * FRAME_LENGTH + 5]

            this.colorBuffer[0] = v1r + (v2r - v1r) * alpha
            this.colorBuffer[1] = v1g + (v2g - v1g) * alpha
            this.colorBuffer[2] = v1b + (v2b - v1b) * alpha
            this.colorBuffer[3] = v1a + (v2a - v1a) * alpha
            this.positionBuffer[3] = v1s + (v2s - v1s) * alpha
        }
    }
}
