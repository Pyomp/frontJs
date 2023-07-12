import { Box3 } from '../../math/Box3.js'
import { Matrix4 } from '../../math/Matrix4.js'
import { Ray } from '../../math/Ray.js'
import { Triangle } from '../../math/Triangle.js'
import { Vector3 } from '../../math/Vector3.js'
import { BackSide, DoubleSide, FrontSide } from '../renderer/constants.js'

/**
 * 
 * @param {number} side 
 * @param {Ray} ray 
 * @param {Vector3} pA 
 * @param {Vector3} pB 
 * @param {Vector3} pC 
 * @param {Vector3} target 
 * @returns 
 */
function checkIntersection(side, ray, pA, pB, pC, target = new Vector3()) {

    let intersect

    if (side === BackSide) {
        intersect = ray.intersectTriangle(pC, pB, pA, true, target)
    } else {
        intersect = ray.intersectTriangle(pA, pB, pC, side !== DoubleSide, target)
    }

    if (intersect) return target

}

const _inverseMatrix = new Matrix4()
const _ray = new Ray()
const _vA = new Vector3()
const _vB = new Vector3()
const _vC = new Vector3()

export function checkMeshIntersection(
    matrixWorld, side, ray, indices, a_position, pointTarget = new Vector3(), boundingBox, normalTarget) {


    _inverseMatrix.copy(matrixWorld).invert()
    _ray.copy(ray).applyMatrix4(_inverseMatrix)

    if (boundingBox) {
        if (_ray.intersectsBox(boundingBox) === false) return
    }

    const count = indices.length / 3

    for (let i = 0; i < count; i += 3) {

        _vA.fromArray(a_position, indices[i * 3] * 3)
        _vB.fromArray(a_position, indices[i * 3 + 1] * 3)
        _vC.fromArray(a_position, indices[i * 3 + 2] * 3)

        const intersection = checkIntersection(side, ray, _vA, _vB, _vC, pointTarget)

        if (intersection) {
            return intersection.applyMatrix4(matrixWorld)
            if (normalTarget) Triangle.getNormal(_vA, _vB, _vC, normalTarget)
        }
    }

    return null
}

const _rayDown = new Ray(new Vector3(0, 0, 0), new Vector3(0, -1, 0))
export function groundIntersect(position, node3d, pointTarget = new Vector3(), normalTarget) {
    let intersectionResult = false
    node3d.traverseObjects((object3D) => {
        if (intersectionResult) return
        const indices = object3D.geometry.indices
        const a_position = object3D.geometry.attributes.a_position.buffer
        const count = indices.length

        _rayDown.origin.copy(position)

        for (let i = 0; i < count; i += 3) {
            _vA.fromArray(a_position, indices[i] * 3)
            _vB.fromArray(a_position, indices[i + 1] * 3)
            _vC.fromArray(a_position, indices[i + 2] * 3)

            const intersection = checkIntersection(FrontSide, _rayDown, _vA, _vB, _vC, intersectResult)

            if (intersection) {
                pointTarget.copy(intersectResult)
                if (normalTarget) Triangle.getNormal(_vA, _vB, _vC, normalTarget)
                intersectionResult = true
                break
            }
        }
    })
    return intersectionResult
}

const _rayHeight = new Ray(new Vector3(0, 1000, 0), new Vector3(0, -1, 0))
const intersectResult = new Vector3()
/**
 * 
 * @param {Node3D} node 
 * @param {number} x 
 * @param {number} z 
 * @returns 
 */
export function getNode3DHeight(node, x, z) {
    _rayHeight.origin.x = x
    _rayHeight.origin.z = z

    let result = -Infinity

    node.traverseObjects((object3D) => {
        const indices = object3D.geometry.indices
        const a_position = object3D.geometry.attributes.a_position.buffer
        const count = indices.length

        for (let i = 0; i < count; i += 3) {

            _vA.fromArray(a_position, indices[i] * 3)
            _vB.fromArray(a_position, indices[i + 1] * 3)
            _vC.fromArray(a_position, indices[i + 2] * 3)

            const intersection = checkIntersection(FrontSide, _rayHeight, _vA, _vB, _vC, intersectResult)

            if (intersection && intersection.y > result) {
                result = intersectResult.y
            }
        }
    })
    return result
}

/**
 * 
 * @param {Geometry[]} geometries
 * @param {number} x 
 * @param {number} z 
 * @returns 
 */
export function getGeometries3DHeight(geometries, x, z) {
    _rayHeight.origin.x = x
    _rayHeight.origin.z = z

    let result = -Infinity

    for (const geometry of geometries) {
        const indices = geometry.indices
        const a_position = geometry.attributes.a_position.buffer
        const count = indices.length

        for (let i = 0; i < count; i += 3) {
            _vA.fromArray(a_position, indices[i] * 3)
            _vB.fromArray(a_position, indices[i + 1] * 3)
            _vC.fromArray(a_position, indices[i + 2] * 3)

            const intersection = checkIntersection(FrontSide, _rayHeight, _vA, _vB, _vC, intersectResult)

            if (intersection && intersection.y > result) {
                result = intersectResult.y
            }
        }
    }
    return result
}

const _boundingBox = new Box3()
const _triangle = new Triangle()
const _triangle_2 = new Triangle()
const _vector3 = new Vector3()
const _vector3_2 = new Vector3()
const _vector3_3 = new Vector3()
const _direction = new Vector3()
/**
 * 
 * @param {Node3D} node 
 * @param {Sphere} boundingSphere
 */
export function closestPointSphereToNode3D(node, boundingSphere) {
    boundingSphere.getBoundingBox(_boundingBox)

    let closestDistanceSq = boundingSphere.radius ** 2

    node.traverseObjects((object3D) => {
        const indices = object3D.geometry.indices
        const a_position = object3D.geometry.attributes.a_position.buffer
        const count = indices.length

        for (let i = 0; i < count; i += 3) {
            _triangle.a.fromArray(a_position, indices[i] * 3)
            _triangle.b.fromArray(a_position, indices[i + 1] * 3)
            _triangle.c.fromArray(a_position, indices[i + 2] * 3)

            if (_boundingBox.intersectsTriangle(_triangle)) {
                _triangle.closestPointToPoint(boundingSphere.center, _vector3)

                if (_vector3_2.subVectors(boundingSphere.center, _vector3).lengthSq() < closestDistanceSq) {
                    closestDistanceSq = _vector3_2.lengthSq()
                    _direction.copy(_vector3_2)
                    _vector3_3.copy(_vector3)
                    _triangle_2.copy(_triangle)
                    // _vector3_3.add(_vector3_2.multiplyScalar(boundingSphere.radius / (closestDistance ** 0.5)))
                }
            }
        }
    })
    return closestDistanceSq === (boundingSphere.radius ** 2) ? null : {
        point: _vector3_3,
        direction: _direction,
        closestDistanceSq,
        triangle: _triangle_2
    }
}
