import { createProgram, createShader, webGlUtils } from '../../renderer/webGlUtils.js'
import { Vector3 } from "../../../math/Vector3.js"

const ParticleCount = 100
const ParticleFrequency = 10
const NormalizeFactor = ParticleFrequency / ParticleCount
const ParticleDelta = 1 / ParticleFrequency

export class FireflyParticles {
    canvas = document.createElement('canvas')
    #gl = this.canvas.getContext('webgl2')

    #position = new Float32Array(ParticleCount * 3)
    #velocity = new Float32Array(ParticleCount * 3)
    #age = new Float32Array(ParticleCount).fill(-1)
    #color = new Float32Array(ParticleCount * 3)
    #alpha = new Float32Array(ParticleCount).fill(0)
    #uv = new Float32Array(ParticleCount * 2)
    #texture = new Image(128, 128)

    constructor({ parent = document.body }) {
        this.#resizeObserver.observe(this.canvas)

        this.canvas.style.position = 'fixed'
        this.canvas.style.top = '0'
        this.canvas.style.left = '0'
        this.canvas.style.width = '100%'
        this.canvas.style.height = '100%'

        this.#initObject3D(this.#gl)

        parent.prepend(this.canvas)

        this.#onResize()
    }

    #drawBound = this.#draw.bind(this)
    #time = performance.now() / 1000
    #lastTime = performance.now() / 1000
    #draw(now) {
        this.#time = now / 1000
        const deltaTime = this.#time - this.#lastTime
        this.#lastTime = this.#time

        this.#updateParticles(deltaTime)

        this.#gl.clear(this.#gl.COLOR_BUFFER_BIT | this.#gl.DEPTH_BUFFER_BIT)
        this.#gl.drawArrays(this.#gl.POINTS, 0, ParticleCount)

        requestAnimationFrame(this.#drawBound)
    }

    #vector3 = new Vector3()

    #particleToLaunchIndex = 0
    #particleToLaunchTime = 0
    #updateParticles(deltaTime) {
        while (this.#particleToLaunchTime < this.#time) {
            this.#particleToLaunchTime += ParticleDelta

            this.#age[this.#particleToLaunchIndex] = 0

            const size = 2
            this.#position[this.#particleToLaunchIndex * 3] = (Math.random() - 0.5) * 2
            this.#position[this.#particleToLaunchIndex * 3 + 1] = (Math.random() - 0.5) * 2
            this.#position[this.#particleToLaunchIndex * 3 + 2] = 1 + Math.random() * 10

            const force = 0.05 * Math.random()
            this.#velocity[this.#particleToLaunchIndex * 3] = force * (Math.random() - 0.5)
            this.#velocity[this.#particleToLaunchIndex * 3 + 1] = force * (Math.random() - 0.5)

            this.#alpha[this.#particleToLaunchIndex] = 0

            this.#particleToLaunchIndex++
            if (this.#particleToLaunchIndex > ParticleCount) this.#particleToLaunchIndex = 0
        }

        for (let particleIndex = 0; particleIndex < ParticleCount; particleIndex++) {
            if (this.#age[particleIndex] < 0) continue
            this.#age[particleIndex] += deltaTime * NormalizeFactor

            this.#position[particleIndex * 3] += this.#velocity[particleIndex * 3] * deltaTime
            this.#position[particleIndex * 3 + 1] += this.#velocity[particleIndex * 3 + 1] * deltaTime
            this.#position[particleIndex * 3 + 2] += this.#velocity[particleIndex * 3 + 2] * deltaTime

            this.#alpha[particleIndex] = this.#age[particleIndex] < 0.5 ?
                this.#age[particleIndex] : 1 - this.#age[particleIndex] * 1
        }

        webGlUtils.attribute.update(this.#gl, this.#glBufferPosition, this.#position)
        webGlUtils.attribute.update(this.#gl, this.#glBufferAlpha, this.#alpha)
    }

    #glBufferPosition
    #glBufferUv
    #glBufferColor
    #glBufferAlpha
    #glProgram
    #initObject3D(/** @type {WebGL2RenderingContext} */ gl) {
        webGlUtils.blending.normal(gl)

        const vertexShader = createShader(gl, gl.VERTEX_SHADER, vs())
        const fragmentShader = createShader(gl, gl.FRAGMENT_SHADER, fs())
        const glProgram = createProgram(gl, vertexShader, fragmentShader)
        this.#glProgram = glProgram
        const glVao = gl.createVertexArray()
        {
            const { glBuffer } = webGlUtils.vao.createVaoAttribute({ gl, glProgram, glVao, name: 'a_position', typedArray: this.#position, size: 3, usage: 'DYNAMIC_DRAW' })
            this.#glBufferPosition = glBuffer
            webGlUtils.attribute.update(gl, glBuffer, this.#position)
        }
        {
            const { glBuffer } = webGlUtils.vao.createVaoAttribute({ gl, glProgram, glVao, name: 'a_color', typedArray: this.#color, size: 3 })
            this.#glBufferColor = glBuffer
            webGlUtils.attribute.update(gl, glBuffer, this.#color)
        }
        {
            const { glBuffer } = webGlUtils.vao.createVaoAttribute({ gl, glProgram, glVao, name: 'a_alpha', typedArray: this.#alpha, size: 1, usage: 'DYNAMIC_DRAW' })
            this.#glBufferAlpha = glBuffer
            webGlUtils.attribute.update(gl, glBuffer, this.#alpha)
        }
        {
            const { glBuffer } = webGlUtils.vao.createVaoAttribute({ gl, glProgram, glVao, name: 'a_uv', typedArray: this.#uv, size: 2 })
            this.#glBufferUv = glBuffer
            webGlUtils.attribute.update(gl, glBuffer, this.#uv)
        }

        const vector3 = new Vector3()

        for (let particleIndex = 0; particleIndex < ParticleCount; particleIndex++) {
            vector3.randomDirection().multiplyScalar(0.2).addScalar(0.7)
            vector3.toArray(this.#color, particleIndex * 3)

            this.#uv[particleIndex * 2] = Math.random() < 0.5 ? 0 : 0.5
            this.#uv[particleIndex * 2 + 1] = Math.random() < 0.5 ? 0 : 0.5

            webGlUtils.attribute.update(this.#gl, this.#glBufferUv, this.#uv)
            webGlUtils.attribute.update(this.#gl, this.#glBufferColor, this.#color)
        }

        // texture
        const glTexture = gl.createTexture()
        this.#texture.addEventListener('load',
            () => {
                webGlUtils.texture.updateData({ gl, glTexture, data: this.#texture })
            }, { once: true }
        )
        this.#texture.src = new URL('./texture.svg', import.meta.url).href
        webGlUtils.texture.updateParameters({ gl, glTexture })
        const unit = webGlUtils.texture.bindUnit({ gl, glProgram, uniformName: 'map', textureCount: 0 })
        webGlUtils.texture.bindTexture({ gl, glTexture, unit })

        requestAnimationFrame(this.#drawBound)
    }

    #resizeObserver = new ResizeObserver(this.#onResize.bind(this))
    #onResize() {
        const width = Math.floor(this.canvas.clientWidth) || 1
        const height = Math.floor(this.canvas.clientHeight) || 1
        this.canvas.width = width
        this.canvas.height = height
        this.#gl.viewport(0, 0, width, height)
    }
}

const vs = () => `#version 300 es
in vec3 a_position;
in vec2 a_uv;
in vec3 a_color;
in float a_alpha;

flat out vec4 v_color;
flat out vec2 v_uv;

void main(){
    v_uv = a_uv;
    gl_Position = vec4(a_position.xy, 1., 1);
    gl_PointSize = 50. / a_position.z;
    v_color = vec4(a_color, a_alpha);
}`

const fs = () => `#version 300 es
precision lowp float;
precision lowp int;

uniform sampler2D u_map;

flat in vec4 v_color;
flat in vec2 v_uv;

out vec4 color;

void main(){
    color = texture(u_map, gl_PointCoord.xy * 0.5 + v_uv) * v_color;
}`
