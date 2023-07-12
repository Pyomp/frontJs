import { GlbLoader } from '../../gltf/GlbLoader.js'
import { PI025, PI05, PI2 } from '../../../math/MathUtils.js'
import { Vector2 } from '../../../math/Vector2.js'
import { _up } from '../../../math/Vector3.js'
import { SkinnedNode } from '../../nodes/SkinnedNode.js'
import { Texture } from '../../renderer/models/Texture.js'

const assetInit = async () => {
    const glbLoader = new GlbLoader()
    const gltfNodes = await glbLoader.load(new URL('./blader.glb', import.meta.url))

    const node = gltfNodes['blader']

    const bladerTexture = new Texture({})
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

    static assetInit = assetInit
    static gltfNode

    #orbitControls
    #input
    move = new Vector2()

    constructor(orbitControls, input) {
        if (!Blader3D.gltfNode) throw new Error('Blader3D needs to be init "await Blader3D.init()"')

        this.#orbitControls = orbitControls
        this.#input = input

        this.node = new SkinnedNode({ gltfNode: Blader3D.gltfNode })
        this.node.position.set(Math.random() * 10 - 5, 0, Math.random() * 10 - 5)
        this.node.quaternion.setFromAxisAngle(_up, Math.random() * PI2)
        this.node.animation.play('blader_idle_pingpong')
    }

    update = this.#update.bind(this)
    #update(dt) {
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
            this.node.animation.play('blader_walk_pingpong')
            this.node.localMatrixNeedsUpdates = true
        } else {
            this.node.animation.play('blader_idle_pingpong')
        }
    }

    dispose() {
        this.node.dispose()
    }
}
