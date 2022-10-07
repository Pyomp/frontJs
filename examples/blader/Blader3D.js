import { GlbLoader } from '../../webGlEngine/gltfLoader/GlbLoader.js'
import { PI025, PI05, PI2 } from '../../math/MathUtils.js'
import { Vector2 } from '../../math/Vector2.js'
import { _up } from '../../math/Vector3.js'
import { SkinnedNode } from '../../webGlEngine/nodes/SkinnedNode.js' 
import { Texture } from '../../webGlEngine/core/Texture.js'
import { StaticGltfNode } from '../../webGlEngine/nodes/StaticGltfNode.js'

const init = async () => {
    const glbLoader = new GlbLoader()
    const gltfNodes = await glbLoader.load(new URL('./blader.glb', import.meta.url))

    const node = gltfNodes['blader']

    const bladerTexture = new Texture()
    bladerTexture.data.src = new URL('./blader.svg', import.meta.url).href

    // In gltf mesh has array of primitive
    // Each primitive have a material and a geometry data that can be different.    
    for (const primitive of node.mesh.primitives) {
        primitive.material.textures['u_map'] = bladerTexture
    }

    Blader3D.gltfNode = node
}

const MOVE_SPEED = 2

export class Blader3D {

    static init = init
    static gltfNode

    #orbitControls
    #input
    #view
    #updates
    #id
    move = new Vector2()

    constructor(id, scene, orbitControls, input, view, updates) {
        if (!Blader3D.gltfNode) throw new Error('Blader3D needs to be init "await Blader3D.init()"')

        this.#id = id
        this.#orbitControls = orbitControls
        this.#input = input
        this.#view = view

        // this.node = new StaticGltfNode(Blader3D.gltfNode, scene)
        this.node = new SkinnedNode(Blader3D.gltfNode, scene)
        this.node.position.set(Math.random() * 10 - 5, 0, Math.random() * 10 - 5)
        this.node.quaternion.setFromAxisAngle(_up, Math.random() * PI2)
        this.#updates = updates
        updates.add(this.#updateBound)
        this.node.animations.play('blader_idle_pingpong')
    }
    
    #updateBound = this.#update.bind(this)
    #update(dt) {
        if (this.#view.currentBladerIndex !== this.#id) return

        let angle
        if (this.#input.arrowUp) {
            angle = PI05 * 0
            if (this.#input.arrowLeft) angle += PI025
            else if (this.#input.arrowRight) angle -= PI025
        } else if (this.#input.arrowDown) {
            angle = PI05 * 2
            if (this.#input.arrowLeft) angle -= PI025
            else if (this.#input.arrowRight) angle += PI025
        } else if (this.#input.arrowLeft) {
            angle = PI05 * 1
        } else if (this.#input.arrowRight) {
            angle = PI05 * 3
        }

        if (angle !== undefined) {
            angle += this.#orbitControls.spherical.theta
            this.node.position.x += Math.sin(angle) * dt * MOVE_SPEED
            this.node.position.z += Math.cos(angle) * dt * MOVE_SPEED
            this.node.quaternion.setFromAxisAngle(_up, angle)
            this.node.animations.play('blader_walk_pingpong')
            this.node.worldMatrixNeedsUpdates = true
        } else {
            this.node.animations.play('blader_idle_pingpong')
        }
    }

    dispose() {
        this.#updates.delete(this.#updateBound)
        this.node.dispose()
    }
}