import { GlbLoader } from '../../../webGlEngine/gltfLoader/GlbLoader.js'
import { _up } from '../../../math/Vector3.js'
import { SkinnedNode } from '../../../webGlEngine/nodes/SkinnedNode.js'
import { Texture } from '../../../webGlEngine/core/Texture.js'
import { serviceLoop } from '../../services/serviceLoop.js'
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

const animationDictionary = {
    'blader_idle_pingpong': 0,
    'blader_walk_pingpong': 1,
}

const instances = {}
export class Blader3D {
    static init = init
    static instances = instances

    #skinnedNode = new SkinnedNode(gltfNode, animationDictionary)
    #id

    constructor(id) {
        if (instances[id]) return instances[id]
        this.#id = id
        if (!gltfNode) throw new Error('Blader3D needs to be init "await Blader3D.init()"')

        this.node3dPosition = this.#skinnedNode.position
        serviceLoop.addUpdate(this.#update3DBound)

        instances[id] = this
    }

    node3dPosition
    position = new Vector3()
    velocity = new Vector3()
    rotation = 0
    animation = 0
    animationTime = 0

    lastFrameUpdate = serviceLoop.perfNowSecond
    newUpdate = false

    #updateNewUpdate() {
        if (this.newUpdate === false) return
        this.#skinnedNode.quaternion.setFromAxisAngle(_up, this.rotation)
        this.#skinnedNode.animations.play(this.animation)
        if (this.animationTime > -0.1) this.#skinnedNode.animations.setTimeUpdate(this.animationTime)
        this.#skinnedNode.worldMatrixNeedsUpdates = true
        this.newUpdate = false
        // this.node3dPosition.copy(this.position)
    }

    #update3DBound = this.#update3D.bind(this)
    #update3D() {
        this.#updateNewUpdate()
        if (this.velocity.x === 0 && this.velocity.y === 0 && this.velocity.z === 0) return

        const elapsedTime = serviceLoop.perfNowSecond - this.lastFrameUpdate
        if (elapsedTime > 5) this.dispose()

        this.node3dPosition.x = (this.velocity.x * elapsedTime) + this.position.x
        this.node3dPosition.y = (this.velocity.y * elapsedTime) + this.position.y
        this.node3dPosition.z = (this.velocity.z * elapsedTime) + this.position.z

        this.#skinnedNode.worldMatrixNeedsUpdates = true
    }

    dispose() {
        serviceLoop.deleteUpdate(this.#update3DBound)
        this.#skinnedNode.dispose()
        delete instances[this.#id]
    }
}