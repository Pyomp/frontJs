
import { Node3D } from '../../renderer/models/Node3D.js'
import { GltfMesh } from '../../nodes/objects/GltfMesh.js'
import { helperModels } from './helpersInit.js'


/**
 * Tips: To prevent scale on z, in vertex shader set gl_Position.z to -10 in view space.
*/
export class MoveHelper extends Node3D {

    /**
     * @param {Node3D} parent 
     * @param {Vector3} vector3 
     */
    constructor(parent, vector3) {
        const mesh = new GltfMesh(helperModels.movePrimitive, 'move helper')
        super({
            objects: [mesh],
            parent: parent,
            position: vector3,
        })
    }
}
