export class Capabilities {
    #gl

    initGl(/** @type {WebGL2RenderingContext} */ gl) {
        this.#gl = gl

        this.maxTextureSize = gl.getParameter(gl.MAX_TEXTURE_SIZE) //	max size of a texture
        this.maxVertexAttribs = gl.getParameter(gl.MAX_VERTEX_ATTRIBS) //	num attribs you can have
        this.maxVertexUniformVectors = gl.getParameter(gl.MAX_VERTEX_UNIFORM_VECTORS) //	num vec4 uniforms a vertex shader can have
        this.maxVaryingVectors = gl.getParameter(gl.MAX_VARYING_VECTORS) //	num varyings you have
        this.maxCombinedTextureImageUnits = gl.getParameter(gl.MAX_COMBINED_TEXTURE_IMAGE_UNITS) //	num texture units that exist
        this.maxVertexTextureImageUnits = gl.getParameter(gl.MAX_VERTEX_TEXTURE_IMAGE_UNITS) //	num texture units a vertex shader can reference
        this.maxTextureImageUnits = gl.getParameter(gl.MAX_TEXTURE_IMAGE_UNITS) //	num texture units a fragment shader can reference
        this.maxFragmentUniformVectors = gl.getParameter(gl.MAX_FRAGMENT_UNIFORM_VECTORS) //	num vec4 uniforms a fragment shader can have
        this.maxCubeMapTextureSize = gl.getParameter(gl.MAX_CUBE_MAP_TEXTURE_SIZE) //	max size of a cubemap
        this.maxRenderbufferSize = gl.getParameter(gl.MAX_RENDERBUFFER_SIZE) //	max size of a renderbuffer
        this.maxViewportDims = gl.getParameter(gl.MAX_VIEWPORT_DIMS) //	max size of the viewport

        this.max3dTextureSize = gl.getParameter(gl.MAX_3D_TEXTURE_SIZE) //	max size of a 3D texture
        this.maxDrawBuffers = gl.getParameter(gl.MAX_DRAW_BUFFERS) //	num color attachments you can have
        this.maxArrayTextureLayers = gl.getParameter(gl.MAX_ARRAY_TEXTURE_LAYERS) //	max layers in a 2D texture array
        this.maxTransformFeedbackSeparateAttribs = gl.getParameter(gl.MAX_TRANSFORM_FEEDBACK_SEPARATE_ATTRIBS) //	num varyings you can output to separate buffers when using transform feedback
        this.maxTransformFeedbackInterleavedComponents = gl.getParameter(gl.MAX_TRANSFORM_FEEDBACK_INTERLEAVED_COMPONENTS) //	num varyings you can output when sending them all to a single buffer
        this.maxCombinedUniformBlocks = gl.getParameter(gl.MAX_COMBINED_UNIFORM_BLOCKS) //	num uniform blocks you can use overall
        this.maxVertexUniformBlocks = gl.getParameter(gl.MAX_VERTEX_UNIFORM_BLOCKS) //	num uniform blocks a vertex shader can use
        this.maxFragmentUniformBlocks = gl.getParameter(gl.MAX_FRAGMENT_UNIFORM_BLOCKS) //	num uniform blocks a fragment shader can use

        this.maxSamples = gl.getParameter(gl.MAX_SAMPLES)
        this.redBits = gl.getParameter(gl.RED_BITS)
        this.greenBits = gl.getParameter(gl.GREEN_BITS)
        this.blueBits = gl.getParameter(gl.BLUE_BITS)
        this.depthBits = gl.getParameter(gl.DEPTH_BITS)
        this.stencilBits = gl.getParameter(gl.STENCIL_BITS)
    }

    getError(operation) {
        let error = this.#gl.getError()
        let hasError = error !== this.#gl.NO_ERROR

        while (error !== this.#gl.NO_ERROR) {
            console.error(`${operation}: glError ${error}`)
            error = this.#gl.getError()
        }

        return hasError
    }

    toString() {
        console.info(JSON.stringify(this, null, '  '))
    }
}
