import { Material } from './Material.js'
import { Program } from '../renderer/Program.js'
import { defaultShader } from './Shader.js'
import { Vao } from '../renderer/Vao.js'
import { Geometry } from './Geometry.js'

export class Object3D {
    program = null
    vao = null

    /**
     * @param {{
     *      geometry: Geometry
     *      shader?: Shader
     *      material?: Material
     *      textures?: {[name: string]: Texture}
     *      uniforms?: {[name: string]: Uniform}
     *      count?: number
     * }} params
     */
    constructor({
        geometry,
        shader = defaultShader,
        material = new Material(),
        textures = {},
        uniforms = {},
        count,
    }) {
        this.shader = shader
        this.material = material
        this.geometry = geometry
        this.textures = textures
        this.uniforms = uniforms
        this.count = count
    }

    createGlContext(renderer) {
        if (this.program) return
        this.gl = renderer.gl
        this.program = new Program(renderer, this)
        this.vao = new Vao(this)
    }

    deleteGlContext() {
        this.vao.deleteObject(this)

        this.gl = null
        this.program = null
        this.vao = null
    }

    /** @abstract */
    draw(gl) { }

    disposeGl() {
        this.program.decrUsedCount()
        this.vao.decrUsedCount()
    }

    onDispose = new Set()
    dispose() {
        this.disposeGl()
        for (const callback of this.onDispose) callback()
    }
}
