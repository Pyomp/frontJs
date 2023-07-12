import { Attribute } from "../models/Attribute.js"
import { Geometry } from "../models/Geometry.js"
import { Object3D } from "../models/Object3D.js"
import { Shader } from "../models/Shader.js"
import { Texture } from "../models/Texture.js"
import { checkFrameBufferStatus } from "../webGlUtils.js"
import { UboUtils } from "./UboUtils.js"

function createColorTexture() {
    return new Texture({
        data: null,

        wrapS: 'CLAMP_TO_EDGE',
        wrapT: 'CLAMP_TO_EDGE',

        minFilter: 'LINEAR',
        magFilter: 'LINEAR',

        target: 'TEXTURE_2D',
        level: 0,
        internalformat: 'RGBA',
        width: 256,
        height: 256,
        border: 0,
        format: 'RGBA',
        type: 'UNSIGNED_BYTE',

        autoDataUpdate: false,
    })
}

function createDepthTexture() {
    return new Texture({
        data: null,

        wrapS: 'CLAMP_TO_EDGE',
        wrapT: 'CLAMP_TO_EDGE',

        minFilter: 'NEAREST',
        magFilter: 'NEAREST',

        target: 'TEXTURE_2D',
        level: 0,
        internalformat: 'DEPTH_COMPONENT24',
        width: 256,
        height: 256,
        border: 0,
        format: 'DEPTH_COMPONENT',
        type: 'UNSIGNED_INT',

        autoDataUpdate: false,
    })
}

export class DepthFrameBuffer {
    /** @type {WebGL2RenderingContext} */ #gl

    #glOpaqueFrameBuffer
    #glOpaqueColorRenderbuffer
    #glOpaqueDepthRenderBuffer

    #glDrawFrameBuffer
    #glDrawColorRenderBuffer
    depthTexture = createDepthTexture()

    initGL(/** @type {Renderer} */ renderer) {
        this.#gl = renderer.gl

        this.#glOpaqueFrameBuffer = this.#gl.createFramebuffer()
        this.#glOpaqueColorRenderbuffer = this.#gl.createRenderbuffer()
        this.#glOpaqueDepthRenderBuffer = this.#gl.createRenderbuffer()

        this.#glDrawFrameBuffer = this.#gl.createFramebuffer()
        this.#glDrawColorRenderBuffer = this.#gl.createRenderbuffer()

        this.setSize(renderer)
        this.#initOpaqueFrameBuffer(renderer)
        this.#initTransparentFrameBuffer(renderer)
    }

    disposeGl() {
        this.#gl.deleteFramebuffer(this.#glOpaqueFrameBuffer)
        this.#gl.deleteRenderbuffer(this.#glOpaqueColorRenderbuffer)
        this.#gl.deleteRenderbuffer(this.#glOpaqueDepthRenderBuffer)

        this.#gl.deleteFramebuffer(this.#glDrawFrameBuffer)
        this.#gl.deleteRenderbuffer(this.#glDrawColorRenderBuffer)
    }

    #width = 1
    #height = 1
    setSize(renderer) {
        this.#width = renderer.resolution.x
        this.#height = renderer.resolution.y
        this.#updateOpaqueSize(renderer)
        this.#updateTransparentSize(renderer)
    }

    bind() {
        this.#gl.bindFramebuffer(this.#gl.FRAMEBUFFER, this.#glOpaqueFrameBuffer)
        this.#gl.clear(this.#gl.COLOR_BUFFER_BIT | this.#gl.DEPTH_BUFFER_BIT)
    }

    blit() {
        this.#gl.bindFramebuffer(this.#gl.READ_FRAMEBUFFER, this.#glOpaqueFrameBuffer)
        this.#gl.bindFramebuffer(this.#gl.DRAW_FRAMEBUFFER, this.#glDrawFrameBuffer)

        this.#gl.blitFramebuffer(
            0, 0, this.#width, this.#height,
            0, 0, this.#width, this.#height,
            this.#gl.COLOR_BUFFER_BIT | this.#gl.DEPTH_BUFFER_BIT, this.#gl.NEAREST)

        this.#gl.bindFramebuffer(this.#gl.READ_FRAMEBUFFER, this.#glDrawFrameBuffer)
        this.#gl.bindFramebuffer(this.#gl.DRAW_FRAMEBUFFER, null)

        this.#gl.blitFramebuffer(
            0, 0, this.#width, this.#height,
            0, 0, this.#width, this.#height,
            this.#gl.COLOR_BUFFER_BIT, this.#gl.NEAREST)

        this.#gl.bindFramebuffer(this.#gl.FRAMEBUFFER, null)
    }

    #initOpaqueFrameBuffer(renderer) {
        this.#gl.bindFramebuffer(this.#gl.FRAMEBUFFER, this.#glOpaqueFrameBuffer)
        bindRenderBufferToFrameBuffer(renderer, this.#glOpaqueColorRenderbuffer, this.#gl.COLOR_ATTACHMENT0)
        bindRenderBufferToFrameBuffer(renderer, this.#glOpaqueDepthRenderBuffer, this.#gl.DEPTH_ATTACHMENT)

        checkFrameBufferStatus(this.#gl)
        this.#gl.bindFramebuffer(this.#gl.FRAMEBUFFER, null)
    }

    #updateOpaqueSize(renderer) {
        this.#gl.bindFramebuffer(this.#gl.FRAMEBUFFER, this.#glOpaqueFrameBuffer)
        updateBufferSizeMultisample(renderer, this.#glOpaqueColorRenderbuffer, this.#gl.RGBA8)
        updateBufferSizeMultisample(renderer, this.#glOpaqueDepthRenderBuffer, this.#gl.DEPTH_COMPONENT24)
        this.#gl.bindFramebuffer(this.#gl.FRAMEBUFFER, null)
    }

    #initTransparentFrameBuffer(renderer) {
        this.#gl.bindFramebuffer(this.#gl.FRAMEBUFFER, this.#glDrawFrameBuffer)
        bindRenderBufferToFrameBuffer(renderer, this.#glDrawColorRenderBuffer, this.#gl.COLOR_ATTACHMENT0)
        bindTextureToFrameBuffer(renderer, this.depthTexture, this.#gl.DEPTH_ATTACHMENT)

        checkFrameBufferStatus(this.#gl)
        this.#gl.bindFramebuffer(this.#gl.FRAMEBUFFER, null)
    }


    #updateTransparentSize(renderer) {
        this.#gl.bindFramebuffer(this.#gl.FRAMEBUFFER, this.#glDrawFrameBuffer)
        updateBufferSize(renderer, this.#glDrawColorRenderBuffer, this.#gl.RGBA8)
        updateTextureSize(renderer, this.depthTexture)
        this.#gl.bindFramebuffer(this.#gl.FRAMEBUFFER, null)
    }

    static glslLinearizeDepth = `
    float linearizeDepth(float depth) {
        float z = depth * 2.0 - 1.0;
        return (2.0 * u_near * u_far) / (u_far + u_near - z * (u_far - u_near));
    }
    `
}

function bindTextureToFrameBuffer(renderer, texture, attachment) {
    const gl = renderer.gl
    const glTexture = renderer.texturesManager.getGlTexture(texture)
    gl.bindTexture(gl[texture.target], glTexture)
    gl.framebufferTexture2D(gl.FRAMEBUFFER, attachment, gl.TEXTURE_2D, glTexture, 0)
}


function bindRenderBufferToFrameBuffer(renderer, glBuffer, attachment) {
    const gl = renderer.gl
    gl.bindRenderbuffer(gl.RENDERBUFFER, glBuffer)
    gl.framebufferRenderbuffer(
        gl.FRAMEBUFFER,
        attachment,
        gl.RENDERBUFFER,
        glBuffer
    )
}

function updateTextureSize(renderer, texture) {
    const gl = renderer.gl
    texture.width = renderer.resolution.x
    texture.height = renderer.resolution.y
    const glTexture = renderer.texturesManager.getGlTexture(texture)
    gl.bindTexture(gl[texture.target], glTexture)
    texture.updateTextureParameters(gl)
    texture.updateTextureData(gl)
}

function updateBufferSizeMultisample(renderer, glBuffer, internalformat) {
    const gl = renderer.gl
    gl.bindRenderbuffer(gl.RENDERBUFFER, glBuffer)
    gl.renderbufferStorageMultisample(
        gl.RENDERBUFFER,
        gl.getParameter(gl.MAX_SAMPLES),
        internalformat,
        renderer.resolution.x, renderer.resolution.y)
}

function updateBufferSize(renderer, glBuffer, internalformat) {
    const gl = renderer.gl
    gl.bindRenderbuffer(gl.RENDERBUFFER, glBuffer)
    gl.renderbufferStorage(
        gl.RENDERBUFFER,
        internalformat,
        renderer.resolution.x, renderer.resolution.y)
}

class DepthObject3D extends Object3D {
    constructor(
       /** @type {Renderer} */ renderer) {

        const shader = new Shader({
            getVertexShader: () => `#version 300 es
            in vec3 a_position;

            void main(){
                gl_Position = vec4(a_position, 1.);
            }
        `,
            getFragmentShader: () => `#version 300 es
            precision highp float;
            precision highp int;

            ${UboUtils.uboGlsl}

            uniform sampler2D u_depthMap;

            ${DepthFrameBuffer.glslLinearizeDepth}

            out vec4 color;
            
            void main() {                
                float depth = texture(u_depthMap, gl_FragCoord.xy / u_resolution).x;
                float linearDepth = (linearizeDepth(depth) - u_near) / (u_far - u_near);
                color = vec4(vec3(linearDepth), 1.);
            }
        `,
            getConfigId: () => 0,
            useUboUtils: true
        })

        super({
            geometry: new Geometry([
                new Attribute('a_position', new Float32Array([
                    1, 1, -1,
                    -1, 1, -1,
                    1, -1, -1,

                    -1, 1, -1,
                    -1, -1, -1,
                    1, -1, -1,
                ]), "VEC3")
            ]),
            shader,
            textures: {
                u_depthMap: renderer.depthFrameBuffer.depthTexture
            },
            count: 6,
        })
    }

    draw(gl) {
        gl.drawArrays(gl.TRIANGLES, 0, 6)
    }
}
