
import { Vector3, _up } from '../../../math/Vector3.js'
import { Node3D } from '../../renderer/models/Node3D.js'
import { GltfMesh } from '../../nodes/objects/GltfMesh.js'
import { helperModels } from './helpersInit.js'


const _vector3 = new Vector3()
export class Vector3Helper extends Node3D {

    /**
     * @param {{
     *      parent?: Node3D
     *      vector3?: Vector3
     * }} params 
     */
    constructor({
        parent,
        vector3
    }) {
        const mesh = new GltfMesh(helperModels.vectorPrimitive, 'vector helper')
        super({
            objects: [mesh],
            parent: parent,
            position: vector3,
        })
    }

    setOrigin(v) {
        this.position.copy(v)
        this.localMatrixNeedsUpdates = true
    }

    setDirection(v) {
        _vector3.copy(v)
        this.scale.y = _vector3.length()
        this.quaternion.setFromUnitVectors(_up, _vector3.normalize())
        this.localMatrixNeedsUpdates = true
    }
}




