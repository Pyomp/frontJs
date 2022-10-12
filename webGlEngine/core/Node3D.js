
import { Box3 } from '../../math/Box3.js'
import { Matrix3 } from '../../math/Matrix3.js'
import { Matrix4 } from '../../math/Matrix4.js'
import { Quaternion } from '../../math/Quaternion.js'
import { Sphere } from '../../math/Sphere.js'
import { Vector3 } from '../../math/Vector3.js'
import { EventDispose } from '../../common/Events.js'

/**
 * A node can have multiple objects (like meshes), the world matrix will be shared.  
 * 
 * Why ? I follow the GLTF logic:
 * When you make a object in Blender, you can assign multiple materials on it.
 * In GLTF data, this object will get __multiple__ "primitives".
 * A primitive have one geometry and one material (that make a mesh).
*/
export class Node3D extends EventTarget {
    static defaultScene
    /** @type {Set<Node3D>} */
    children = new Set()

    worldMatrix = new Matrix4()
    worldMatrixNeedsUpdates = true

    /** @type {Set<Object3D>} */
    objects = new Set()

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
        super()

        this.name = name
        this.parent = parent === undefined ? Node3D.defaultScene : parent

        this.position = position
        this.quaternion = quaternion
        this.scale = scale

        for (const object of objects) {
            this.#addObject(object)
        }

        this.parent?.addNode(this)
    }

    onBeforeRender(dt) {
        if (this.worldMatrixNeedsUpdates === true) {
            this.updateWorldMatrix(true, true)
        }
    }

    updateWorldMatrix(updateParents = true, updateChildren = true) {
        this.worldMatrix.compose(this.position, this.quaternion, this.scale)

        if (this.parent !== undefined) {
            if (updateParents === true) {
                this.parent.updateWorldMatrix(true, false)
            }
            this.worldMatrix.premultiply(this.parent.worldMatrix)
        }

        if (updateChildren === true) {
            for (const child of this.children) {
                child.updateWorldMatrix(false, true)
            }
        }

        if (this.normalMatrix) this.updateNormalMatrix()

        for (const object of this.objects) {
            if (object.uniforms['u_worldMatrix'])
                object.uniforms['u_worldMatrix'].needsUpdate = true
        }

        this.worldMatrixNeedsUpdates = false
    }

    updateNormalMatrix() {
        // this.modelViewMatrix.multiplyMatrices(camera.matrixWorldInverse, object.matrixWorld)
        this.normalMatrix.getNormalMatrix(this.worldMatrix)
        for (const object of this.objects) {
            if (object.uniforms['u_normalMatrix'])
                object.uniforms['u_normalMatrix'].needsUpdate = true
        }
    }

    /**
     * recursive seek of `objects` in the `node.children`
     * @return {Set<Object3D> | undefined}
     */
    getObjects(nodeName) {
        if (this.name === nodeName) {
            return this.objects
        }
        for (const child of this.children) {
            const objects = child.getObjects(nodeName)
            if (objects) return objects
        }
    }

    /**
     * apply the callback on objects in a node
     * @param {( object: Object3D ) => {}} callback
    */
    applyOnObjects(nodeName, callback) {
        const objects = this.getObjects(nodeName)
        if (objects) {
            for (const object of objects) callback(object)
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

        for (const child of this.children) {
            child.dispose()
        }

        this.dispatchEvent(EventDispose)
    }

    /**
     * This will climb the scene graph then "ask" to the renderer to compile the objects.
     * Why: It's to get the renderer reference (and avoid to pass it on every nodes).
    */
    onAdd(node) {
        this.parent?.onAdd(node)
    }

    addNode(childNode) {
        this.children.add(childNode)
        childNode.parent = this
        this.onAdd(childNode)
    }

    deleteNode(childNode) {
        this.children.delete(childNode)
        childNode.parent = undefined
    }

    /** @param {Object3D} object */
    #addObject(object) {
        const uniforms = object.uniforms
        if (uniforms.u_worldMatrix) uniforms.u_worldMatrix.data = this.worldMatrix
        if (uniforms.u_normalMatrix) {
            if (!this.normalMatrix) this.normalMatrix = new Matrix3()
            uniforms.u_normalMatrix.data = this.normalMatrix
        }
        if (object.geometry.boundingBox) {
            if (!this.boundingBox) this.boundingBox = new Box3()
            this.boundingBox.union(object.geometry.boundingBox)
        }
        this.objects.add(object)
    }

    #deleteObject(object) {
        this.objects.delete(object)
    }

    /** @param {(object: Object3D, node: Node3D) => void} callback*/
    traverseObjects(callback) {
        this.traverse((node) => {
            for (const object of node.objects) {
                callback(object, node)
            }
        })
    }

    /** @param {(node: Node3D) => void} callback*/
    traverse(callback) {
        callback(this)
        for (const child of this.children) {
            child.traverse(callback)
        }
    }
}




