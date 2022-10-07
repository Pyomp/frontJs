import { Matrix4 } from '../../../../math/Matrix4.js'
import { Quaternion } from '../../../../math/Quaternion.js'
import { Vector3 } from '../../../../math/Vector3.js'

export class Bone {

    #children = []
    #parent = null

    quaternion = new Quaternion()
    position = new Vector3()
    scale = new Vector3(1, 1, 1)

    #inverseBindMatrix = new Matrix4()
    #localMatrix = new Matrix4()
    worldMatrix = new Matrix4()

    constructor(joint, jointMatrices, inverseBindMatrices, parent) {

        this.name = joint.name
        this.#parent = parent

        this.#inverseBindMatrix.fromArray(inverseBindMatrices.slice(joint.id * 16, joint.id * 16 + 16))

        this.#localMatrix.elements = jointMatrices.subarray(joint.id * 16, joint.id * 16 + 16)


        if (joint.rotation) this.quaternion.fromArray(joint.rotation)
        if (joint.translation) this.position.fromArray(joint.translation)
        if (joint.scale) this.scale.fromArray(joint.scale)


        if (joint.children) {
            for (const childJoint of joint.children) {
                this.#children.push(new Bone(childJoint, jointMatrices, inverseBindMatrices, this))
            }
        }
    }

    update(parentUpdate = true, childUpdate = true) {
        if (this.#parent && parentUpdate) this.#parent.update(true, false)

        this.worldMatrix.compose(this.position, this.quaternion, this.scale)
        if (this.#parent) this.worldMatrix.premultiply(this.#parent.worldMatrix)
        this.#localMatrix.copy(this.worldMatrix).multiply(this.#inverseBindMatrix)

        if (childUpdate === true) {
            for (const child of this.#children) {
                child.update(false, true)
            }
        }
    }

    traverse(callback) {
        callback(this)
        for (const child of this.#children) {
            child.traverse(callback)
        }
    }
}