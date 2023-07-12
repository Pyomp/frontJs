import {
    UboCameraName,
    UboLightsName,
    UboCameraIndex,
    UboLightsIndex,
    UboPointLightsName,
    UboPointLightsIndex,
    UboUtilsName,
    UboUtilsIndex
} from './constants.js'
import { createProgram, createShader, UniformUpdates } from './webGlUtils.js'

const DURATION_BEFORE_DISPOSE = 5000

const cacheMap = {}
const cache = {
    get(shaderId, shaderConfigId) {
        return cacheMap[shaderId]?.[shaderConfigId]
    },
    set(shaderId, shaderConfigId, program) {
        if (!cacheMap[shaderId]) cacheMap[shaderId] = {}
        cacheMap[shaderId][shaderConfigId] = program
    },
    delete(shaderId, shaderConfigId) {
        delete cacheMap[shaderId]?.[shaderConfigId]
    }
}

let id = 0

export class Program {
    static create(renderer, object3D) {
        const cacheProgram = cache.get(object3D.shader.id, object3D.shaderConfigId)
        if (cacheProgram) {
            cacheProgram.addObject3D(object3D)
            return cacheProgram
        } else {
            const program = new Program(renderer, object3D)
            cache.set(object3D.shader.id, object3D.shaderConfigId, program)
            return program
        }
    }

    id = id++

    #objects3Ds = new Set()
    addObject3D(object3D) {
        object3D.onDispose.add(() => { this.#deleteObject(object3D) })
        this.#objects3Ds.add(object3D)
    }
    #deleteObject(object) {
        this.#objects3Ds.delete(object)
        if (this.#objects3Ds.size === 0) {
            setTimeout(() => { if (this.#objects3Ds.size === 0) this.dispose() }, DURATION_BEFORE_DISPOSE)
        }
    }

    #gl
    #shaderId
    #shaderConfigId

    /** @type {{[textureName: string]: number}} */
    textureUnits = {}

    /**
     * @param {Renderer} renderer
     * @param {Object3D} object3D
     */
    constructor(renderer, object3D) {
        this.addObject3D(object3D)
        this.#shaderId = object3D.shader.id
        this.#shaderConfigId = object3D.shaderConfigId

        this.#gl = renderer.gl

        this.#initGlProgram(renderer, object3D)

        this.#gl.useProgram(this.glProgram)
        this.#initTextures(object3D.textures)
        this.#initUniforms(object3D.uniforms)
        this.#initUbo(object3D)
    }

    /** @param {{ [name: string]: Uniform }} uniforms */
    #initUniforms(uniforms) {
        for (const key in uniforms) {
            const uniform = uniforms[key]
            this.#initUniform(key)
        }
    }

    #glLocationMap = {}
    #currentUniformsData = {}
    #initUniform(uniformName) {
        if (!this.#glLocationMap[uniformName]) {
            this.#glLocationMap[uniformName] = this.#gl.getUniformLocation(this.glProgram, uniformName)
            this.#currentUniformsData[uniformName] = null
        }
    }

    #glVertexShader
    #glFragmentShader
    #initGlProgram(renderer, object3D) {
        this.#glVertexShader = createShader(this.#gl, this.#gl.VERTEX_SHADER,
            object3D.shader.getVertexShader(object3D, renderer))
        this.#glFragmentShader = createShader(this.#gl, this.#gl.FRAGMENT_SHADER,
            object3D.shader.getFragmentShader(object3D, renderer))
        this.glProgram = createProgram(this.#gl, this.#glVertexShader, this.#glFragmentShader)
    }

    #initTexture(uniformName, textureCount) {
        const location = this.#gl.getUniformLocation(this.glProgram, uniformName)
        this.textureUnits[uniformName] = this.#gl[`TEXTURE${textureCount}`]
        this.#gl.uniform1i(location, textureCount)
    }

    /** @param {{[name: string]: Texture}} textures */
    #initTextures(textures) {
        let textureCount = 0
        for (const key in textures) {
            this.#initTexture(key, textureCount++)

            if (textures[key].scale)
                this.#initUniform(key + 'Scale')
        }
    }

    /** @param {Object3D} object3D */
    #initUbo(object3D) {
        this.#gl.uniformBlockBinding(this.glProgram, this.#gl.getUniformBlockIndex(this.glProgram, UboCameraName), UboCameraIndex)

        if (object3D.shader.useUboUtils) {
            this.#gl.uniformBlockBinding(this.glProgram, this.#gl.getUniformBlockIndex(this.glProgram, UboUtilsName), UboUtilsIndex)
        }
        if (object3D.geometry.attributes.a_normal) {
            this.#gl.uniformBlockBinding(this.glProgram, this.#gl.getUniformBlockIndex(this.glProgram, UboLightsName), UboLightsIndex)
            this.#gl.uniformBlockBinding(this.glProgram, this.#gl.getUniformBlockIndex(this.glProgram, UboPointLightsName), UboPointLightsIndex)
        }
    }

    /** @param {{ [uniformName: string]: Uniform }} uniforms */
    updateUniforms(uniforms) {
        for (const uniformName in uniforms) {
            const uniform = uniforms[uniformName]
            if (
                uniform.needsUpdate === true
                || this.#currentUniformsData[uniformName] !== uniform.data
            ) {
                this.#currentUniformsData[uniformName] = uniform.data
                UniformUpdates[uniform.type](this.#gl, this.#glLocationMap[uniformName], uniform.data)
                uniform.needsUpdate = false
            }
        }
    }

    disposeGl() {
        this.#gl.deleteProgram(this.glProgram)
        this.#gl.deleteShader(this.#glVertexShader)
        this.#gl.deleteShader(this.#glFragmentShader)
    }

    dispose() {
        this.disposeGl()
        cache.delete(this.#shaderId, this.#shaderConfigId)
    }
}
