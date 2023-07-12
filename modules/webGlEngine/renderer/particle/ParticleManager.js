import { isSharedArrayBufferAvailable } from "../../../dom/browserInfo.js"
import { ParticlesObject3D } from "./ParticlesObject3D.js"
import { ParticleSystem } from "./ParticleSystem.js"
import { SharedParticleSystem } from "./SharedParticleSystem.js"

export class ParticleManager {
    #worker
    particleObject3D

    constructor({ count = 10_000, frequency = 20 }, opaqueDepthTexture) {

        this.particleObject3D = new ParticlesObject3D(opaqueDepthTexture ? {
            count,
            opaqueDepthTexture
        } : { count })

        if (isSharedArrayBufferAvailable) {
            this.particleSystem = new SharedParticleSystem({
                deltaTimeSecond: 1 / frequency,
                data: this.particleObject3D.dataBuffer,
                position: this.particleObject3D.positionBuffer,
                velocity: this.particleObject3D.velocityBuffer,
                color: this.particleObject3D.colorBuffer,
            })
        } else {
            this.particleSystem = new ParticleSystem({
                deltaTimeSecond: 1 / frequency,
                data: this.particleObject3D.dataArray,
                position: this.particleObject3D.positionArray,
                velocity: this.particleObject3D.velocityArray,
                color: this.particleObject3D.colorArray,
            })
        }
    }

    get particleCount() { return this.particleObject3D.dataArray[1] }

    update(dt_s) {
        this.particleObject3D.updateUniforms(dt_s)
    }

    /**
     * 
     * @param {Array} array
     * @example
     *  setParticle([
     *      positionX, positionY, positionZ,
     *      accelerationX, accelerationY, accelerationZ,
     *      accelerationFactor, mass, end,
     *      t0, colorR, colorG, colorB, alpha, size,
     *      t1, colorR, colorG, colorB, alpha, size,
     *      ...
     *  ]
     */
    setParticle(array) {
        this.particleSystem.setParticle(array)
    }

    initGl(renderer) {
        this.particleObject3D.createGlContext(renderer)
    }

    disposeGl() {
    }

    dispose() {
        this.#worker.terminate()
    }
}
