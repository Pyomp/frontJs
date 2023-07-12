import { Quaternion } from '../../math/Quaternion.js'
import { Vector3 } from '../../math/Vector3.js'
import { Node3D } from '../renderer/models/Node3D.js'
import { Texture } from '../renderer/models/Texture.js'
import { AnimationSystem } from '../renderer/animation/AnimationSystem.js'
import { Bone } from '../renderer/animation/Bone.js'
import { GltfMesh } from './objects/GltfMesh.js'

export class SkinnedNode extends Node3D {

    /**
     * @param {{
     *  name?: string,
     *  gltfNode: GltfNode ,
     *  animationDictionary?: {[animationName: string]: number | string },
     *  parent?: Node3D,
     * }} params
     */
    constructor({
        name = '',
        gltfNode,
        animationDictionary = {},
        parent = Node3D.defaultScene,
    }) {
        const t = gltfNode.translation || [0, 0, 0]
        const q = gltfNode.rotation || [0, 0, 0, 1]
        const s = gltfNode.scale || [1, 1, 1]

        const meshes = gltfNode.mesh.primitives.map(primitive => new GltfMesh(primitive, name))

        super({
            position: new Vector3(t[0], t[1], t[2]),
            quaternion: new Quaternion(q[0], q[1], q[2], q[3]),
            scale: new Vector3(s[0], s[1], s[2]),
            objects: meshes,
            parent: null,
        })

        const width = 16
        const height = gltfNode.skin.bonesCount
        const f32a = new Float32Array(width * height)
        const texture = new Texture({
            data: f32a,

            wrapS: 'CLAMP_TO_EDGE',
            wrapT: 'CLAMP_TO_EDGE',
            minFilter: 'NEAREST',
            magFilter: 'NEAREST',

            target: 'TEXTURE_2D',
            level: 0,
            internalformat: 'RGBA32F',
            width: width / 4,
            height: height,
            border: 0,
            format: 'RGBA',
            type: 'FLOAT',

            autoDataUpdate: true,
        })

        this.traverse(node => {
            for (const object of node.objects) {
                object.textures['u_jointTexture'] = texture
            }
        })

        this.rootBone = new Bone(gltfNode.skin.root, f32a, gltfNode.skin.inverseBindMatrices.buffer, this.worldMatrix)
        this.animation = new AnimationSystem(gltfNode.skin.animations, this.rootBone, animationDictionary)

        parent.addNode(this)
    }
}
