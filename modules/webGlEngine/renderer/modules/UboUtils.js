import { UboUtilsIndex, UboUtilsName } from "../constants.js"

export class UboUtils {
    static uboGlsl = `
        uniform ${UboUtilsName} {
            vec2 u_resolution;
            float u_near;
            float u_far;
        };
    `

    #renderer
    #gl
    #UboBuffer

    #UboData = new Float32Array(4)

    initGl(renderer) {
        this.#gl = renderer.gl
        this.#renderer = renderer
        this.#UboBuffer = this.#gl.createBuffer()
        this.#updateUBOBuffer()
    }

    disposeGl() {
        this.#gl.deleteBuffer(this.#UboBuffer)
    }

    update() {
        this.#UboData[0] = this.#renderer.resolution.x
        this.#UboData[1] = this.#renderer.resolution.y
        this.#UboData[2] = this.#renderer.camera.near
        this.#UboData[3] = this.#renderer.camera.far
        this.#updateUBOBuffer()
    }

    #updateUBOBuffer() {
        this.#gl.bindBuffer(this.#gl.UNIFORM_BUFFER, this.#UboBuffer)
        this.#gl.bufferData(this.#gl.UNIFORM_BUFFER, this.#UboData, this.#gl.DYNAMIC_DRAW)
        this.#gl.bindBufferBase(this.#gl.UNIFORM_BUFFER, UboUtilsIndex, this.#UboBuffer)
    }
}