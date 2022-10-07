import {
    NoBlending,
    NormalBlending,
    AdditiveBlending,
    MultiplyBlending,
    FrontSide,
    DoubleSide,
    BackSide,
} from '../constants.js'

/** @type {{ [blendingEnum: number]: (gl: WebGL2RenderingContext) => void }} */
const blendingFunctions = {
    [NormalBlending](gl) {
        gl.blendFuncSeparate(gl.SRC_ALPHA, gl.ONE_MINUS_SRC_ALPHA, gl.ONE, gl.ONE_MINUS_SRC_ALPHA)
    },
    [AdditiveBlending](gl) {
        gl.blendFunc(gl.SRC_ALPHA, gl.ONE)
    },
    [MultiplyBlending](gl) {
        gl.blendFunc(gl.ZERO, gl.SRC_COLOR)
    },
}

export class State {
    #gl

    /** @param {WebGL2RenderingContext} gl */
    constructor(gl) {
        this.#gl = gl
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

    #blending = -1
    #blendingFunction = -1
    #blendingUpdate(blending) {
        if (this.#blending !== blending) {
            if (blending === NoBlending) {
                this.#blending = NoBlending
                this.#gl.disable(this.#gl.BLEND)
            } else {
                this.#blending = blending
                this.#gl.enable(this.#gl.BLEND)
                if (this.#blendingFunction !== blending) {
                    this.#blendingFunction = blending
                    blendingFunctions[this.#blendingFunction](this.#gl)
                }
            }
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

    #depthWrite = false
    #depthWriteUpdate(depthWrite) {
        if (this.#depthWrite !== depthWrite) {
            this.#depthWrite = depthWrite
            this.#gl.depthMask(depthWrite)
        }
    }

    /** @param {Material} material */
    glParamsUpdate(material) {
        this.#updateSide(material.side)
        this.#blendingUpdate(material.blending)
        this.#depthTestUpdate(material.depthTest)
        this.#depthWriteUpdate(material.depthWrite)
    }
}









