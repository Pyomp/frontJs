import { Matrix4 } from '../../math/Matrix4.js'
import { Ray } from '../../math/Ray.js'
import { Triangle } from '../../math/Triangle.js'
import { Vector3 } from '../../math/Vector3.js'
import { BackSide, DoubleSide } from '../renderer/constants.js'


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
