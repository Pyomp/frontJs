import { Matrix4 } from '../../../math/Matrix4.js'
import { Quaternion } from '../../../math/Quaternion.js'
import { Vector3 } from '../../../math/Vector3.js'

const _vector3 = new Vector3()

export class Bone {

    /** @type {Set<Bone>} */ #children = new Set()
    #parent = null

    quaternion = new Quaternion()
    position = new Vector3()
    scale = new Vector3(1, 1, 1)

    #inverseBindMatrix = new Matrix4()
    #localMatrix = new Matrix4()
    worldMatrix = new Matrix4()

    #nodeWorldMatrix

    constructor(gltfBone, jointMatricesF32a, inverseBindMatricesF32a, nodeWorldMatrix, parentBone) {
        this.#nodeWorldMatrix = nodeWorldMatrix

        this.name = gltfBone.name
        this.#parent = parentBone

        this.#inverseBindMatrix.fromArray(inverseBindMatricesF32a.slice(gltfBone.id * 16, gltfBone.id * 16 + 16))

        this.#localMatrix.elements = jointMatricesF32a.subarray(gltfBone.id * 16, gltfBone.id * 16 + 16)

        if (gltfBone.rotation) this.quaternion.fromArray(gltfBone.rotation)
        if (gltfBone.translation) this.position.fromArray(gltfBone.translation)
        if (gltfBone.scale) this.scale.fromArray(gltfBone.scale)

        if (gltfBone.children) {
            for (const childJoint of gltfBone.children) {
                this.#children.add(new Bone(childJoint, jointMatricesF32a, inverseBindMatricesF32a, nodeWorldMatrix, this))
            }
        }
    }

    updateMatrix(parentUpdate = true, childUpdate = true) {
        if (this.#parent && parentUpdate) this.#parent.update(true, false)

        this.worldMatrix.compose(this.position, this.quaternion, this.scale)
        if (this.#parent) this.worldMatrix.premultiply(this.#parent.worldMatrix)
        this.#localMatrix.copy(this.worldMatrix).multiply(this.#inverseBindMatrix)

        if (childUpdate === true) {
            for (const child of this.#children) {
                child.updateMatrix(false, true)
            }
        }
    }

    traverse(callback) {
        callback(this)
        for (const child of this.#children) {
            child.traverse(callback)
        }
    }

    /**
     * 
     * @param {string} boneName 
     * @returns {Bone | undefined}
     */
    findByName(boneName) {
        if (this.name === boneName) return this

        for (const child of this.#children) {
            const result = child.findByName(boneName)
            if (result) return result
        }
    }

    applyTranslationTo(vector3) {
        return vector3
            .applyWorldMatrix4(this.worldMatrix)
            .applyWorldMatrix4(this.#nodeWorldMatrix)
    }

    applyTransformation(matrix4) {
        return matrix4
            .copy(this.worldMatrix)
            .premultiply(this.#nodeWorldMatrix)
    }
}
