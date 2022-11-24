import { GlbLoader } from '../../webGlEngine/gltfLoader/GlbLoader.js.js'
import { PI025, PI05, PI2 } from '../../math/MathUtils.js.js'
import { Vector2 } from '../../math/Vector2.js.js'
import { _up } from '../../math/Vector3.js.js'
import { SkinnedNode } from '../../../webGlEngine/nodes/SkinnedNode.js'
import { Texture } from '../../webGlEngine/core/Texture.js.js'
import { serviceLoop } from '../../../services/serviceLoop.js'
import { Vector3 } from '../../../math/Vector3.js'

let gltfNode

async function init() {
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

    gltfNode = node
}

export class Blader3D {
    static init = init
    
    #skinnedNode = new SkinnedNode(gltfNode)

    constructor() {
        if (!gltfNode) throw new Error('Blader3D needs to be init "await Blader3D.init()"')
        serviceLoop.addUpdate(this.#update3DBound)
    }

    position = new Vector3()
    velocity = new Vector3()
    rotation = 0
    animation = 0
    animationTime = 0

    lastUpdateSecond = serviceLoop.dateNowSecond
    newUpdate = false

    #updateNewUpdate() {
        if (this.newUpdate === false) return
        this.#skinnedNode.quaternion.setFromAxisAngle(_up, this.rotation)
        this.#skinnedNode.animations.play(this.animation)
        this.#skinnedNode.animations.setTimeUpdate(this.animationTime)
        this.#skinnedNode.worldMatrixNeedsUpdates = true
        this.newUpdate = false
    }

    #update3DBound = this.#update3D.bind(this)
    #update3D() {
        this.#updateNewUpdate()
        if (this.velocity.x === 0 && this.velocity.y === 0 && this.velocity.z === 0) return
        const deltaTimeSecond = serviceLoop.dateNowSecond - this.lastUpdateSecond
        this.#skinnedNode.position = this.position + deltaTimeSecond * this.velocity
        this.worldMatrixNeedsUpdates = true
    }

    dispose() {
        serviceLoop.deleteUpdate(this.#update3DBound)
        this.#skinnedNode.dispose()
    }
}