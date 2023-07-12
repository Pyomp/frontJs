function glUniformNumber(gl, location, number) {
    gl.uniform1f(location, number)
}

function glUniformVector2(gl, location, vector2) {
    gl.uniform2f(location, vector2.x, vector2.y)
}

function glUniformVector3(gl, location, vector3) {
    gl.uniform3f(location, vector3.x, vector3.y, vector3.z)
}

function glUniformColor(gl, location, color) {
    gl.uniform3f(location, color.r, color.g, color.b)
}

function glUniformVector4(gl, location, vector4) {
    gl.uniform4f(location, vector4.x, vector4.y, vector4.z, vector4.w)
}

function glUniformMatrix4(gl, location, matrix4) {
    gl.uniformMatrix4fv(location, false, matrix4.elements)
}

function glUniformMatrix3(gl, location, matrix3) {
    gl.uniformMatrix3fv(location, false, matrix3.elements)
}

export const UNIFORM_TYPE_NUMBER = 0
export const UNIFORM_TYPE_VECTOR2 = 1
export const UNIFORM_TYPE_VECTOR3 = 2
export const UNIFORM_TYPE_VECTOR4 = 3
export const UNIFORM_TYPE_COLOR = 4
export const UNIFORM_TYPE_MATRIX3 = 5
export const UNIFORM_TYPE_MATRIX4 = 6

export const UniformUpdates = [
    glUniformNumber,
    glUniformVector2,
    glUniformVector3,
    glUniformVector4,
    glUniformColor,
    glUniformMatrix3,
    glUniformMatrix4,
]

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

export function checkFrameBufferStatus(/** @type {WebGL2RenderingContext} */ gl) {
    const result = gl.checkFramebufferStatus(gl.FRAMEBUFFER)
    if (result === gl.FRAMEBUFFER_COMPLETE) {
        console.info(`The framebuffer is ready to display.`)
    } else if (result === gl.FRAMEBUFFER_INCOMPLETE_ATTACHMENT) {
        console.warn('The attachment types are mismatched or not all framebuffer attachment points are framebuffer attachment complete.')
    } else if (result === gl.FRAMEBUFFER_INCOMPLETE_MISSING_ATTACHMENT) {
        console.warn('There is no attachment.')
    } else if (result === gl.FRAMEBUFFER_INCOMPLETE_DIMENSIONS) {
        console.warn('Height and width of the attachment are not the same.')
    } else if (result === gl.FRAMEBUFFER_UNSUPPORTED) {
        console.warn('The format of the attachment is not supported or if depth and stencil attachments are not the same renderbuffer.')
    } else if (result === gl.FRAMEBUFFER_INCOMPLETE_MULTISAMPLE) {
        console.warn('The values of gl.RENDERBUFFER_SAMPLES are different among attached renderbuffers, or are non-zero if the attached images are a mix of renderbuffers and textures.')
    }
}
const classToType = new Map()
classToType.set(Uint8Array, 'UNSIGNED_BYTE')
classToType.set(Float32Array, 'FLOAT')
classToType.set(Uint16Array, 'UNSIGNED_SHORT')

export const webGlUtils = {
    vao: {
        /**
         * 
         * @param {{
         *      gl: WebGL2RenderingContext
         *      glProgram: WebGLProgram
         *      glVao: WebGLVertexArrayObject
         *      name: string
         *      typedArray: Uint8Array | Float32Array
         *      size: number
         *      usage?: WebGlAttributeUsage
         *      normalize?: boolean
         * }} param0 
         */
        createVaoAttribute({ gl, glProgram, glVao, name, typedArray, size, usage = 'STATIC_DRAW', normalize = false }) {
            gl.useProgram(glProgram)
            gl.bindVertexArray(glVao)

            const type = classToType.get(typedArray.constructor)

            const location = gl.getAttribLocation(glProgram, name)

            if (location === -1) {
                console.log(`getAttribLocation: ${name} location not found (optimized)`)
                return null
            }

            const glBuffer = gl.createBuffer()

            gl.enableVertexAttribArray(location)
            gl.bindBuffer(gl.ARRAY_BUFFER, glBuffer)
            gl.bufferData(gl.ARRAY_BUFFER, typedArray, gl[usage])

            if (type !== 'FLOAT' && !normalize) {
                gl.vertexAttribIPointer(location, size, gl[type], 0, 0)
            } else {
                gl.vertexAttribPointer(location, size, gl[type], normalize, 0, 0)
            }

            return { location, glBuffer }
        }
    },
    ubo: {
        /**
         * 
         * @param {WebGL2RenderingContext} gl 
         * @param {number} uboIndex 
         * @param {WebGLBuffer} uboBuffer 
         * @param {BufferSource} uboData 
         */
        updateBuffer(gl, uboIndex, uboBuffer, uboData) {
            gl.bindBuffer(gl.UNIFORM_BUFFER, uboBuffer)
            gl.bufferData(gl.UNIFORM_BUFFER, uboData, gl.DYNAMIC_DRAW)
            gl.bindBufferBase(gl.UNIFORM_BUFFER, uboIndex, uboBuffer)
        }
    },
    uniform: {
        /**
         * @param {WebGL2RenderingContext} gl 
         * @param {WebGLProgram} glProgram
         * @param {string} uniformName
         */
        getLocation(gl, glProgram, uniformName) {
            return gl.getUniformLocation(glProgram, uniformName)
        },
        /**
         * @param {WebGL2RenderingContext} gl 
         * @param {WebGLUniformLocation} location 
         * @param {number} number 
         */
        updateNumber(gl, location, number) {
            gl.uniform1f(location, number)
        },
        /**
         * @param {WebGL2RenderingContext} gl 
         * @param {WebGLUniformLocation} location 
         * @param {Vector2} vector2
         */
        updateVector2(gl, location, vector2) {
            gl.uniform2f(location, vector2.x, vector2.y)
        },
        /**
         * @param {WebGL2RenderingContext} gl 
         * @param {WebGLUniformLocation} location 
         * @param {Vector3} vector3
         */
        updateVector3(gl, location, vector3) {
            gl.uniform3f(location, vector3.x, vector3.y, vector3.z)
        },
        /**
         * @param {WebGL2RenderingContext} gl 
         * @param {WebGLUniformLocation} location 
         * @param {Color} color
         */
        updateColor(gl, location, color) {
            gl.uniform3f(location, color.r, color.g, color.b)
        },
        /**
         * @param {WebGL2RenderingContext} gl 
         * @param {WebGLUniformLocation} location 
         * @param {Vector4} vector4
         */
        updateVector4(gl, location, vector4) {
            gl.uniform4f(location, vector4.x, vector4.y, vector4.z, vector4.w)
        },
        /**
         * @param {WebGL2RenderingContext} gl 
         * @param {WebGLUniformLocation} location 
         * @param {Matrix4} matrix4
         */
        updateMatrix4(gl, location, matrix4) {
            gl.uniformMatrix4fv(location, false, matrix4.elements)
        },
        /**
         * @param {WebGL2RenderingContext} gl 
         * @param {WebGLUniformLocation} location 
         * @param {Matrix3} matrix3
         */
        updateMatrix3(gl, location, matrix3) {
            gl.uniformMatrix3fv(location, false, matrix3.elements)
        },
    },
    attribute: {
        update(gl, glBuffer, typedArray) {
            gl.bindBuffer(gl.ARRAY_BUFFER, glBuffer)
            gl.bufferSubData(gl.ARRAY_BUFFER, 0, typedArray)
        }
    },
    texture: {
        /**
         * @param {{
         *      gl: WebGL2RenderingContext
         *      glTexture: WebGLTexture
         *      target?: WebGl.Texture.Target
         *      wrapS?: WebGl.Texture.Wrap
         *      wrapT?: WebGl.Texture.Wrap
         *      minFilter?: WebGl.Texture.MinFilter
         *      magFilter?: WebGl.Texture.MagFilter
         * }} param0 
         */
        updateParameters({
            gl,
            glTexture,
            target = 'TEXTURE_2D',
            wrapS = 'CLAMP_TO_EDGE',
            wrapT = 'CLAMP_TO_EDGE',
            minFilter = 'LINEAR',
            magFilter = 'LINEAR',
        }) {
            gl.bindTexture(gl[target], glTexture)
            gl.texParameteri(gl[target], gl.TEXTURE_WRAP_S, gl[wrapS])
            gl.texParameteri(gl[target], gl.TEXTURE_WRAP_T, gl[wrapT])
            gl.texParameteri(gl[target], gl.TEXTURE_MIN_FILTER, gl[minFilter])
            gl.texParameteri(gl[target], gl.TEXTURE_MAG_FILTER, gl[magFilter])
        },

        /**
         * @param {{
         *      gl: WebGL2RenderingContext
         *      glTexture: WebGLTexture
         *      target?: WebGl.Texture.Target
         *      level?: GLint
         *      internalformat?: WebGl.Texture.InternalFormat
         *      width?: GLsizei
         *      height?: GLsizei
         *      border?: GLint
         *      format?: WebGl.Texture.Format
         *      type?: WebGl.Texture.Type
         *      data: any
         *      needsMipmap?: boolean
         * }} param0 
        */
        updateData({
            gl,
            glTexture,
            target = 'TEXTURE_2D',
            level = 0,
            internalformat = 'RGBA',
            width,
            height,
            border = 0,
            format = 'RGBA',
            type = 'UNSIGNED_BYTE',
            data,
            needsMipmap = false }) {
            gl.bindTexture(gl[target], glTexture)

            gl.texImage2D(
                gl[target],
                level,
                gl[internalformat],
                width ?? data.width,
                height ?? data.height,
                border,
                gl[format],
                gl[type],
                data
            )

            if (needsMipmap) gl.generateMipmap(gl[target])
        },

        /**
         * @param {{
         *      gl: WebGL2RenderingContext
         *      glProgram: WebGLProgram
         *      uniformName: string
         *      textureCount: number
         * }} param0 
        */
        bindUnit({ gl, glProgram, uniformName, textureCount }) {
            const location = gl.getUniformLocation(glProgram, uniformName)
            const textureUnit = gl[`TEXTURE${textureCount}`]
            gl.uniform1i(location, textureCount)
            return textureUnit
        },
        /**
        * @param {{
        *      gl: WebGL2RenderingContext
        *      glTexture: WebGLTexture
        *      unit: number
        * }} param0 
       */
        bindTexture({ gl, glTexture, unit }) {
            gl.activeTexture(unit)
            gl.bindTexture(gl.TEXTURE_2D, glTexture)
        }
    },
    blending: {
        disable(/** @type {WebGL2RenderingContext} */ gl) {
            gl.disable(gl.BLEND)
        },
        normal(/** @type {WebGL2RenderingContext} */ gl) {
            gl.enable(gl.BLEND)
            gl.blendFuncSeparate(gl.SRC_ALPHA, gl.ONE_MINUS_SRC_ALPHA, gl.ONE, gl.ONE_MINUS_SRC_ALPHA)
        },
        additive(/** @type {WebGL2RenderingContext} */ gl) {
            gl.enable(gl.BLEND)
            gl.blendFunc(gl.SRC_ALPHA, gl.ONE)
        },
        multiply(/** @type {WebGL2RenderingContext} */ gl) {
            gl.enable(gl.BLEND)
            gl.blendFunc(gl.ZERO, gl.SRC_COLOR)
        },
    }
}
