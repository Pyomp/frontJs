import { Matrix3 } from '../../math/Matrix3.js'
import { Matrix4 } from '../../math/Matrix4.js'
import { Vector2 } from '../../math/Vector2.js'
import { Vector3 } from '../../math/Vector3.js'
import { Vector4 } from '../../math/Vector4.js'
import { Color } from '../../math/Color.js'
import { UboCameraName, UboLightsName, UboCameraIndex, UboLightsIndex, UboPointLightsName, UboPointLightsIndex } from './constants.js'

const cacheShaderToShaderIdToProgram = new Map()
const cache = {
    /**
     * @param {Shader} shader 
     * @param {string | number} shaderConfigId 
     */
    get(shader, shaderConfigId) {
        if (cacheShaderToShaderIdToProgram.has(shader)) {
            const instance = cacheShaderToShaderIdToProgram.get(shader)
            if (instance[shaderConfigId]) {
                return instance[shaderConfigId]
            }
        }
        return null
    },

    /**
     * @param {Shader} shader 
     * @param {string | number} shaderConfigId 
     * @param {Program} program
     */
    set(shader, shaderConfigId, program) {
        if (cacheShaderToShaderIdToProgram.has(shader)) {
            cacheShaderToShaderIdToProgram.get(shader)[shaderConfigId] = program
        } else {
            cacheShaderToShaderIdToProgram.set(shader, {
                [shaderConfigId]: program
            })
        }
    },

    /**
     * @param {Shader} shader 
     * @param {string | number} shaderConfigId 
     */
    delete(shader, shaderConfigId) {
        const cacheIdToProgram = cacheShaderToShaderIdToProgram.get(shader)
        if (!cacheIdToProgram) return false
        if (!cacheIdToProgram[shaderConfigId]) return false
        delete cacheIdToProgram[shaderConfigId]
        return true
    }
}

export class Program {
    renderer

    #usedCount = 1
    incrUsedCount() { this.#usedCount++ }
    decrUsedCount() {
        this.#usedCount--
        if (this.#usedCount === 0) {
            this.dispose()
        }
    }

    #glVertexShader
    #glFragmentShader
    #shader
    #shaderConfigId

    #currentUniformsData = {}
    uniformSetters = {}

    /** @type {{[textureName: string]: number}} */
    textureUnits = {}

    /**
     * @param {Renderer} renderer
     * @param {Object3D} object3D
     */
    constructor(renderer, object3D) {
        this.#shader = object3D.shader
        this.#shaderConfigId = object3D.shader.getConfigId(object3D)
        const cacheProgram = cache.get(this.#shader, this.#shaderConfigId)
        if (cacheProgram) {
            cacheProgram.incrUsedCount()
            return cacheProgram
        }
        cache.set(this.#shader, this.#shaderConfigId, this)

        this.incrUsedCount()

        this.renderer = renderer
        this.gl = renderer.gl

        this.#initGlProgram(object3D)

        this.gl.useProgram(this.glProgram)

        this.#initTextures(object3D.textures)
        this.#initUniforms(object3D.uniforms)
        this.#initUbo(object3D.geometry)
    }

    #initUniform(uniformName, type) {
        const location = this.gl.getUniformLocation(this.glProgram, uniformName)
        this.uniformSetters[uniformName] = glUniformType.get(type)(this.gl, location)
        this.#currentUniformsData[uniformName] = null
    }

    /** @param {Object3D} object3D */
    #initGlProgram(object3D) {
        this.#glVertexShader = createShader(this.gl, this.gl.VERTEX_SHADER,
            object3D.shader.getVertexShader(object3D, this.renderer))
        this.#glFragmentShader = createShader(this.gl, this.gl.FRAGMENT_SHADER,
            object3D.shader.getFragmentShader(object3D, this.renderer))
        this.glProgram = createProgram(this.gl, this.#glVertexShader, this.#glFragmentShader)
    }

    #initTexture(uniformName, textureCount) {
        const location = this.gl.getUniformLocation(this.glProgram, uniformName)
        this.textureUnits[uniformName] = this.gl[`TEXTURE${textureCount}`]
        this.gl.uniform1i(location, textureCount)
    }

    /** @param {{[name: string]: Texture}} textures */
    #initTextures(textures) {
        let textureCount = 0
        for (const key in textures) {
            this.#initTexture(key, textureCount++)
            if (textures[key].scale) {
                this.#initUniform(key + 'Scale', Vector2)
            }
        }
    }

    /** @param {{ [name: string]: Uniform }} uniforms */
    #initUniforms(uniforms) {
        for (const key in uniforms) {
            const uniform = uniforms[key]
            this.#initUniform(key, uniform.data.constructor)
        }
    }

    /** @param {Geometry} geometry */
    #initUbo(geometry) {
        this.gl.uniformBlockBinding(this.glProgram, this.gl.getUniformBlockIndex(this.glProgram, UboCameraName), UboCameraIndex)
        if (geometry.attributes.a_normal) {
            this.gl.uniformBlockBinding(this.glProgram, this.gl.getUniformBlockIndex(this.glProgram, UboLightsName), UboLightsIndex)
            this.gl.uniformBlockBinding(this.glProgram, this.gl.getUniformBlockIndex(this.glProgram, UboPointLightsName), UboPointLightsIndex)
        }
    }

    /** @param {{ [uniformName: string]: Uniform }} uniforms */
    uniformsUpdate(uniforms) {
        for (const uniformName in uniforms) {
            const uniform = uniforms[uniformName]
            if (
                uniform.needsUpdate === true
                || this.#currentUniformsData[uniformName] !== uniform.data
            ) {
                this.#currentUniformsData[uniformName] = uniform.data
                this.uniformSetters[uniformName](uniform.data)
                uniform.needsUpdate = false
            }
        }
    }

    disposeGl() {
        this.gl.deleteProgram(this.glProgram)
        this.gl.deleteShader(this.#glVertexShader)
        this.gl.deleteShader(this.#glFragmentShader)
    }

    dispose() {
        this.disposeGl()
        cache.delete(this.#shader, this.#shaderConfigId)
    }
}

const vector2TypedArray = new Float32Array(2)
const vector3TypedArray = new Float32Array(3)
const vector4TypedArray = new Float32Array(4)
const matrix4TypedArray = new Float32Array(16)
const matrix3TypedArray = new Float32Array(9)

const glUniformType = new Map()
glUniformType.set(Number, (gl, location) => (value) => {
    gl.uniform1f(location, value)
})
glUniformType.set(Vector2, (gl, location) => (vector2) => {
    vector2.toArray(vector2TypedArray)
    gl.uniform2fv(location, vector2TypedArray)
})

glUniformType.set(Vector3, (gl, location) => (vector3) => {
    vector3.toArray(vector3TypedArray)
    gl.uniform3fv(location, vector3TypedArray)
})
glUniformType.set(Color, (gl, location) => (color) => {
    color.toArray(vector3TypedArray)
    gl.uniform3fv(location, vector3TypedArray)
})
glUniformType.set(Vector4, (gl, location) => (vector4) => {
    vector4.toArray(vector4TypedArray)
    gl.uniform4fv(location, vector4TypedArray)
})
glUniformType.set(Matrix4, (gl, location) => (matrix4) => {
    matrix4.toArray(matrix4TypedArray)
    gl.uniformMatrix4fv(location, false, matrix4TypedArray)
})
glUniformType.set(Matrix3, (gl, location) => (matrix3) => {
    matrix3.toArray(matrix3TypedArray)
    gl.uniformMatrix3fv(location, false, matrix3TypedArray)
})

/**
 * @param {WebGL2RenderingContext} gl 
 * @param {WebGLShader} vertexShader 
 * @param {WebGLShader} fragmentShader 
 */
export const createProgram = (gl, vertexShader, fragmentShader) => {
    const program = gl.createProgram()
    gl.attachShader(program, vertexShader)
    gl.attachShader(program, fragmentShader)
    gl.linkProgram(program)
    if (gl.getProgramParameter(program, gl.LINK_STATUS)) {
        return program
    } else {
        console.warn(gl.getProgramInfoLog(program))
        gl.deleteProgram(program)
    }
}

/**
 * @param {WebGL2RenderingContext} gl 
 * @param {number} type 
 * @param {string} source 
 */
export const createShader = (gl, type, source) => {
    const shader = gl.createShader(type)
    gl.shaderSource(shader, source)
    gl.compileShader(shader)
    // console.warn(('\n' + source).split('\n').map((a, i) => `${i} ${a}`).join('\n'))    
    if (gl.getShaderParameter(shader, gl.COMPILE_STATUS)) {
        return shader
    } else {
        console.warn(('\n' + source).split('\n').map((a, i) => `${i} ${a}`).join('\n'))
        console.warn(gl.getShaderInfoLog(shader))
        gl.deleteShader(shader)
    }
}
