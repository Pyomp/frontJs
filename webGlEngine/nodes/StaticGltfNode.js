import { Quaternion } from '../../math/Quaternion.js'
import { Vector3 } from '../../math/Vector3.js'
import { Node3D } from '../core/Node3D.js'
import { GltfMesh } from './objects/GltfMesh.js'

export class StaticGltfNode extends Node3D {
    /**
    * 
    * @param {GltfNode} gltfNode 
    * @param {Node3D} parent 
    */
    constructor(gltfNode, parent) {
        const t = gltfNode.translation || [0, 0, 0]
        const q = gltfNode.rotation || [0, 0, 0, 1]
        const s = gltfNode.scale || [1, 1, 1]

        const meshes = gltfNode.mesh.primitives.map(primitive => new GltfMesh(primitive))

        super({
            position: new Vector3(t[0], t[1], t[2]),
            quaternion: new Quaternion(q[0], q[1], q[2], q[3]),
            scale: new Vector3(s[0], s[1], s[2]),
            objects: meshes,
            parent: parent
        })
    }
}