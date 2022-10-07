import { DEG2RAD } from '../../../math/MathUtils.js'
import { Matrix4 } from '../../../math/Matrix4.js'
import { Vector3, _up } from '../../../math/Vector3.js'
import { UboCameraIndex, UboCameraName } from '../constants.js'

const vs_pars = () => `
uniform ${UboCameraName} {
    mat4 u_projectionViewMatrix;
    mat4 u_viewMatrix;
    mat4 u_projectionMatrix;
    vec3 u_cameraPosition;
};
`

const _vec3 = new Vector3()
export class Camera {

    static vs_pars = vs_pars

    #UboData = new Float32Array(16 * 3 + 4)
    #UboBuffer
    #gl

    projectionMatrix = new Matrix4()
    worldCameraMatrix = new Matrix4()
    viewMatrix = new Matrix4()
    projectionViewMatrix = new Matrix4()
    position = new Vector3()

    filmGauge = 35
    filmOffset = 0

    needsUpdate = true

    aspect = 1

    /**
     * @param {WebGLRenderingContext} gl 
     * @param {Number} near 
     * @param {Number} far 
     * @param {Number} fov 
     */
    constructor(gl, near = 0.1, far = 1000, fov = 50) {
        this.#gl = gl
        this.near = near
        this.far = far
        this.fov = fov

        this.#UboBuffer = gl.createBuffer()

        this.#updateUBOBuffer()
    }

    dispose() {
        this.#gl.deleteBuffer(this.#UboBuffer)
    }

    updateProjectionViewMatrix() {
        if (this.needsUpdate) {
            this.worldCameraMatrix.elements[12] = this.position.x
            this.worldCameraMatrix.elements[13] = this.position.y
            this.worldCameraMatrix.elements[14] = this.position.z

            this.viewMatrix
                .copy(this.worldCameraMatrix)
                .invert()
            this.projectionViewMatrix
                .copy(this.viewMatrix)
                .premultiply(this.projectionMatrix)

            this.projectionViewMatrix.toArray(this.#UboData)
            this.viewMatrix.toArray(this.#UboData, 16)
            this.position.toArray(this.#UboData, 48)

            this.#updateUBOBuffer()
            
            this.needsUpdate = false
        }
    }

    #updateUBOBuffer() {
        this.#gl.bindBuffer(this.#gl['UNIFORM_BUFFER'], this.#UboBuffer)
        this.#gl.bufferData(this.#gl['UNIFORM_BUFFER'], this.#UboData, this.#gl.DYNAMIC_DRAW)
        this.#gl.bindBufferBase(this.#gl['UNIFORM_BUFFER'], UboCameraIndex, this.#UboBuffer)
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

        this.projectionMatrix.toArray(this.#UboData, 32)

        this.needsUpdate = true
    }
}





