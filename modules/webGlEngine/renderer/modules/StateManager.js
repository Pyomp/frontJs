import {
    NoBlending,
    NormalBlending,
    AdditiveBlending,
    MultiplyBlending,
    FrontSide,
    DoubleSide,
} from '../constants.js'

/** @type {{ [blendingEnum: number]: (gl: WebGL2RenderingContext) => void }} */
const blendingFunctions = {
    [NormalBlending](gl) {
        gl.blendFuncSeparate(gl.SRC_ALPHA, gl.ONE_MINUS_SRC_ALPHA, gl.ONE, gl.ONE_MINUS_SRC_ALPHA)
    },
    [AdditiveBlending](gl) {
        // gl.enable(gl.BLEND)
        // gl.blendFunc(gl.SRC_ALPHA, gl.ONE_MINUS_SRC_ALPHA)

        gl.blendFunc(gl.SRC_ALPHA, gl.ONE)
    },
    [MultiplyBlending](gl) {
        gl.blendFunc(gl.ZERO, gl.SRC_COLOR)
    },
}

export class StateManager {
    /** @type {WebGL2RenderingContext} */ #gl

    initGl(gl) {
        this.#gl = gl
        this.resetState()
    }

    resetState() {
        this.#side = FrontSide
        this.#currentSide = FrontSide
        this.#gl.enable(this.#gl.CULL_FACE)
        this.#gl.frontFace(this.#gl.CCW)
        this.#gl.disable(this.#gl.BLEND)
        this.#blendingFunction = -1
        this.#depthTest = true
        this.#gl.enable(this.#gl.DEPTH_TEST)
        this.#depthWrite = true
        this.#gl.depthMask(true)
        this.#materialConfigId = -1
    }

    disposeGl() { }
    dispose() {
        this.disposeGl()
    }

    #side = -1
    #currentSide = -1
    #updateSide(side) {
        if (this.#side !== side) {
            if (side === DoubleSide) {
                this.#gl.disable(this.#gl.CULL_FACE)
            } else {
                if (this.#side === DoubleSide) this.#gl.enable(this.#gl.CULL_FACE)
                if (this.#currentSide !== side) {
                    if (side === FrontSide) {
                        this.#gl.frontFace(this.#gl.CCW)
                    } else {
                        this.#gl.frontFace(this.#gl.CW)
                    }
                    this.#currentSide = side
                }
            }
            this.#side = side
        }

    }

    #blendingFunction = -1
    #blendingUpdate(blending) {
        if (blending === NoBlending) return
        if (this.#blendingFunction !== blending) {
            this.#blendingFunction = blending
            blendingFunctions[this.#blendingFunction](this.#gl)
        }
    }

    #depthTest = false
    #depthTestUpdate(depthTest) {
        if (this.#depthTest !== depthTest) {
            if (depthTest) {
                this.#depthTest = true
                this.#gl.enable(this.#gl.DEPTH_TEST)
            } else {
                this.#depthTest = false
                this.#gl.disable(this.#gl.DEPTH_TEST)
            }
        }
    }

    #depthWrite = true
    #depthWriteUpdate(depthWrite) {
        if (this.#depthWrite !== depthWrite) {
            this.#depthWrite = depthWrite
            this.#gl.depthMask(depthWrite)
        }
    }

    #materialConfigId = -1
    /** @param {Material} material */
    glParamsUpdate(material) {
        if (this.#materialConfigId !== material.configId) {
            this.#materialConfigId = material.configId
            this.#updateSide(material.side)
            this.#blendingUpdate(material.blending)
            this.#depthTestUpdate(material.depthTest)
            this.#depthWriteUpdate(material.depthWrite)
        }
    }
}









