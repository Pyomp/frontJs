
import { Box3 } from '../../../math/Box3.js'
import { Matrix3 } from '../../../math/Matrix3.js'
import { Matrix4 } from '../../../math/Matrix4.js'
import { Quaternion } from '../../../math/Quaternion.js'
import { Vector3 } from '../../../math/Vector3.js'
import { EventSet } from '../../../utils/EventSet.js'

let id = 0

export class Node3D {
    static defaultScene

    id = id++

    /** @type {Set<Node3D>} */
    #children = new Set()

    localMatrix = new Matrix4()
    localMatrixNeedsUpdates = true
    worldMatrix = new Matrix4()
    #normalMatrix

    /** @type {Set<Object3D>} */
    objects = new Set()

    onDispose = new EventSet()

    /**
     * @param {{
     *      name?: string,
     *      position?: Vector3,
     *      quaternion?: Quaternion,
     *      scale?: Vector3,
     *      objects?: Object3D[],
     *      parent?: Node3D,
     * }} params
     */
    constructor({
        name = '',
        position = new Vector3(),
        quaternion = new Quaternion(),
        scale = new Vector3(1, 1, 1),
        objects = [],
        parent,
    } = {}) {
        this.name = name
        this.parent = parent === undefined ? Node3D.defaultScene : parent

        this.position = position
        this.quaternion = quaternion
        this.scale = scale

        for (const object of objects) {
            this.addObject(object)
        }

        this.parent?.addNode(this)
    }

    updateMatrix(worldMatrixNeedsUpdate = false) {
        if (worldMatrixNeedsUpdate || this.localMatrixNeedsUpdates) {

            if (this.localMatrixNeedsUpdates) this.localMatrix.compose(this.position, this.quaternion, this.scale)

            this.worldMatrix.copy(this.localMatrix).premultiply(this.parent.worldMatrix)

            for (const child of this.#children) { child.updateMatrix(true) }

            for (const object of this.objects) {
                if (object.uniforms['u_worldMatrix']) {
                    object.uniforms['u_worldMatrix'].needsUpdate = true
                }
            }

            if (this.#normalMatrix) this.#updateNormalMatrix()

            this.localMatrixNeedsUpdates = false
        } else {
            for (const child of this.#children) { child.updateMatrix() }
        }
    }

    #updateNormalMatrix() {
        this.#normalMatrix.getNormalMatrix(this.worldMatrix)
        for (const object of this.objects) {
            if (object.uniforms['u_normalMatrix']) {
                object.uniforms['u_normalMatrix'].needsUpdate = true
            }
        }
    }

    createGlContext(renderer) {
        this.traverseObjects((object) => {
            object.createGlContext(renderer)
        })
    }

    dispose() {
        if (this.parent !== undefined) {
            this.parent.deleteNode(this)
        }

        for (const object of this.objects) {
            object.dispose()
        }

        for (const child of this.#children) {
            child.dispose()
        }

        this.onDispose.emit()
    }

    /**
     * This will climb the scene graph then "ask" to the renderer to compile the objects.
     * Why: It's to get the renderer reference (and avoid to pass it on every nodes).
    */
    onAdd(node) {
        this.parent?.onAdd(node)
    }

    addNode(childNode) {
        this.#children.add(childNode)
        childNode.parent = this
        this.onAdd(childNode)
    }

    deleteNode(childNode) {
        this.#children.delete(childNode)
        childNode.parent = undefined
    }

    /** @param {Object3D} object */
    addObject(object) {
        const uniforms = object.uniforms

        if (uniforms.u_worldMatrix) uniforms.u_worldMatrix.data = this.worldMatrix

        if (uniforms.u_normalMatrix) {
            if (!this.#normalMatrix) this.#normalMatrix = new Matrix3()
            uniforms.u_normalMatrix.data = this.#normalMatrix
        }

        if (object.geometry.boundingBox) {
            if (!this.boundingBox) this.boundingBox = new Box3()
            this.boundingBox.union(object.geometry.boundingBox)
        }

        this.objects.add(object)
    }

    /** @param {(object: Object3D, node: Node3D) => void} callback*/
    traverseObjects(callback) {
        this.traverse((node) => {
            for (const object of node.objects) {
                callback(object, node)
            }
        })
    }

    /** @param {(node: Node3D | SkinnedNode) => void} callback*/
    traverse(callback) {
        callback(this)
        for (const child of this.#children) {
            child.traverse(callback)
        }
    }
}
