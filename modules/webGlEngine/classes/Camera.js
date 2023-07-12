import { Frustum } from "../../math/Frustum.js"
import { DEG2RAD } from "../../math/MathUtils.js"
import { Matrix4 } from "../../math/Matrix4.js"
import { Vector3, _up } from "../../math/Vector3.js"

const _vec3 = new Vector3()
export class Camera {
    projectionMatrix = new Matrix4()
    worldCameraMatrix = new Matrix4()
    viewMatrix = new Matrix4()
    projectionViewMatrix = new Matrix4()
    position = new Vector3()

    filmGauge = 35
    filmOffset = 0
    aspect = 1

    frustum = new Frustum()

    constructor({ near = 0.1, far = 500, fov = 50 }) {
        this.near = near
        this.far = far
        this.fov = fov
    }

    updateWorldCameraMatrixPosition() {
        this.worldCameraMatrix.elements[12] = this.position.x
        this.worldCameraMatrix.elements[13] = this.position.y
        this.worldCameraMatrix.elements[14] = this.position.z
    }

    updateViewMatrix() {
        this.viewMatrix
            .copy(this.worldCameraMatrix)
            .invert()
    }

    updateProjectionViewMatrix() {
        this.projectionViewMatrix
            .copy(this.viewMatrix)
            .premultiply(this.projectionMatrix)
    }

    updateFrustum() {
        this.frustum.setFromProjectionMatrix(this.projectionViewMatrix)
    }

    lookAt(x, y, z) {
        if (x.constructor === Vector3) {
            this.worldCameraMatrix.lookAt(this.position, x, _up)
        } else {
            _vec3.set(x, y, z)
            this.worldCameraMatrix.lookAt(this.position, _vec3, _up)
        }
    }

    updateProjectionMatrix() {
        const near = this.near
        const top = near * Math.tan(DEG2RAD * 0.5 * this.fov)
        const height = 2 * top
        const width = this.aspect * height
        const left = - 0.5 * width

        // const skew = this.filmOffset
        // if (skew !== 0) left += near * skew / this.getFilmWidth()
        this.projectionMatrix.makePerspective(left, left + width, top, top - height, near, this.far)
    }
}
