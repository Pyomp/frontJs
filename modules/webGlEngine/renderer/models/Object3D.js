import { Material } from './Material.js'
import { Program } from '../Program.js'
import { Vao } from '../Vao.js'
import { Geometry } from './Geometry.js'
import { EventSet } from '../../../utils/EventSet.js'
import { Uniform } from './Uniform.js'
import { Vector2 } from '../../../math/Vector2.js'
import { phongShader } from '../../shaders/phongShader.js'

let id = 0

export class Object3D {
    id = id++

    /** @type {Program | null} */ program = null
    /** @type {Vao | null} */ vao = null

    /**
     * @param {{
     *      name?: string,
     *      geometry: Geometry
     *      shader?: Shader
     *      material?: Material
     *      textures?: {[name: string]: Texture }
     *      uniforms?: {[name: string]: Uniform }
     *      count?: number
     * }} params
     */
    constructor({
        name = '',
        geometry,
        shader = phongShader,
        material = new Material({}),
        textures = {},
        uniforms = {},
        count,
    }) {
        this.name = name
        this.shader = shader
        this.material = material
        this.geometry = geometry
        this.textures = textures
        this.uniforms = uniforms
        this.count = count

        for (const textureName in textures) {
            const texture = textures[textureName]
            if (texture.scale) {
                this.uniforms[textureName + 'Scale'] = new Uniform(new Vector2().copy(texture.scale))
            }
        }
    }

    createGlContext(renderer) {
        if (this.program) return
        this.shaderConfigId = this.shader.getConfigId(this)
        this.program = Program.create(renderer, this)
        this.vao = Vao.create(renderer, this)
    }

    /** @abstract */
    draw(gl) { }

    onDispose = new EventSet()
    dispose() {
        this.program = null
        this.vao = null
        this.onDispose.emit()
    }
}
