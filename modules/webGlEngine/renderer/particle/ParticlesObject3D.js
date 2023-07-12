import { CameraRenderer } from '../modules/Camera.js'
import { Attribute } from './../models/Attribute.js'
import { Material } from './../models/Material.js'
import { Object3D } from './../models/Object3D.js'
import { Uniform } from './../models/Uniform.js'
import { Texture } from './../models/Texture.js'
import { Shader } from './../models/Shader.js'
import { Geometry } from './../models/Geometry.js'
import { AdditiveBlending } from '../constants.js'
import { UboUtils } from '../modules/UboUtils.js'
import { DepthFrameBuffer } from '../modules/DepthFrameBuffer.js'

const vs = () => `#version 300 es
${CameraRenderer.vs_pars()}

in vec4 a_position;
in vec3 a_velocity;
in vec4 a_color;

uniform float u_deltaParticleUpdateTime;

out vec4 v_color;
out float v_z;
void main(){
    v_color = a_color;

    vec3 position = a_position.xyz + (a_velocity * u_deltaParticleUpdateTime);

    vec4 viewPosition = u_viewMatrix * vec4(position, 1.0);

    v_z = viewPosition.z;

    gl_Position = u_projectionMatrix * viewPosition;

    gl_PointSize = a_position.w * 300. / gl_Position.z;
}
`

const fs = (object) => {
    const isSoftParticle = object.textures.u_depthMap
    return `#version 300 es
    precision highp float;
    precision highp int;

    uniform sampler2D u_map;

    in vec4 v_color;
    in float v_z;

    out vec4 color;

    ${isSoftParticle ? `
    ${UboUtils.uboGlsl}

    uniform sampler2D u_depthMap;

    float geDepth(){
        vec2 uv = gl_FragCoord.xy / u_resolution;
        float zFinal = texture(u_depthMap, uv).x;
        return (u_near * u_far) / ((u_far - u_near) * zFinal - u_far);
    }

    ${DepthFrameBuffer.glslLinearizeDepth}
    ` : ''}

    void main(){
        color = texture(u_map, gl_PointCoord.xy) * v_color;
        
        ${isSoftParticle ? `
            color.a *= clamp((v_z - geDepth()), 0., 1.);
        ` : ''}
    }
`}
const map = new Texture({})
map.data.src = new URL('./spark.svg', import.meta.url).href

const shader = new Shader({ getVertexShader: vs, getFragmentShader: fs, useUboUtils: true })
const material = new Material({
    blending: AdditiveBlending,
    depthTest: true,
    depthWrite: false,
})

export const isSabAvailable = !!window.SharedArrayBuffer

export class ParticlesObject3D extends Object3D {
    constructor({ count, opaqueDepthTexture = null }) {
        if (!map) throw new Error('Points is not initialized "await Points.init()"')

        const dataBuffer = isSabAvailable ? new SharedArrayBuffer(4 * 2) : new ArrayBuffer(4 * 2)
        const positionBuffer = isSabAvailable ? new SharedArrayBuffer(4 * 4 * count) : new ArrayBuffer(4 * 4 * count)
        const velocityBuffer = isSabAvailable ? new SharedArrayBuffer(4 * 3 * count) : new ArrayBuffer(4 * 3 * count)
        const colorsBuffer = isSabAvailable ? new SharedArrayBuffer(4 * 4 * count) : new ArrayBuffer(4 * 4 * count)

        const dataArray = new Float32Array(dataBuffer)
        const positionArray = new Float32Array(positionBuffer)
        const velocityArray = new Float32Array(velocityBuffer)
        const colorArray = new Float32Array(colorsBuffer)

        const isSoftParticle = !!opaqueDepthTexture

        const uniforms = { u_deltaParticleUpdateTime: new Uniform(0) }
        const textures = { u_map: map }

        if (isSoftParticle) {
            textures.u_depthMap = opaqueDepthTexture
        }

        super({
            shader: shader,
            material: material,
            geometry: new Geometry([
                new Attribute('a_position', positionArray, "VEC4", 'DYNAMIC_DRAW'),
                new Attribute('a_velocity', velocityArray, "VEC3", 'DYNAMIC_DRAW'),
                new Attribute('a_color', colorArray, "VEC4", 'DYNAMIC_DRAW'),
            ]),
            uniforms,
            textures,
            count,
        })

        this.dataBuffer = dataBuffer
        this.positionBuffer = positionBuffer
        this.velocityBuffer = velocityBuffer
        this.colorBuffer = colorsBuffer

        this.dataArray = dataArray
        this.positionArray = positionArray
        this.velocityArray = velocityArray
        this.colorArray = colorArray
    }

    #lastParticleUpdateTime = 0
    updateUniforms(dt_s) {
        if (this.#lastParticleUpdateTime !== this.dataArray[0]) {
            this.#lastParticleUpdateTime = this.dataArray[0]
            this.uniforms.u_deltaParticleUpdateTime.data = 0
            this.vao.attributesUpdate('a_position')
            this.vao.attributesUpdate('a_velocity')
            this.vao.attributesUpdate('a_color')
        }

        this.uniforms.u_deltaParticleUpdateTime.data += dt_s
        this.uniforms.u_deltaParticleUpdateTime.needsUpdate = true
    }

    /** @param {WebGLRenderingContext} gl */
    draw(gl) {
        gl.drawArrays(gl.POINTS, 0, this.count)
    }
}
