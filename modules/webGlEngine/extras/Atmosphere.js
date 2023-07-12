import { PI025 } from "../../math/MathUtils.js"
import { Vector3 } from "../../math/Vector3.js"
import { Vector3Helper } from "./helpers/Vector3Helper.js" 

const _vector3 = new Vector3()

export class Atmosphere {
    #center = new Vector3()
    #sampleLength

    #pointSizeX
    #pointSizeY

    #halfSize

    #elementSizeX
    #elementSizeY

    #f32aCopy

    #elementLength
    #pointLength

    constructor(size = 20, sampleLength = 1, sab = new SharedArrayBuffer(4 * 3 * ((size) ** 3))) {
        this.sab = sab
        this.f32a = new Float32Array(sab)

        this.#elementLength = this.f32a.length
        this.#pointLength = this.f32a.length / 3

        this.#pointSizeX = size
        this.#pointSizeY = size * size

        this.#halfSize = size / 2

        this.#elementSizeX = size * 3
        this.#elementSizeY = this.#pointSizeY * 3

        this.#sampleLength = sampleLength
        this.setCenter(0, 0, 0)

        this.#f32aCopy = new Float32Array(this.f32a.length)
    }

    setCenter(x, y, z) {
        this.#center.set(x + this.#halfSize, y + this.#halfSize, z + this.#halfSize)
    }

    #getElementIndex(x, y, z) {
        const xU = (this.#center.x - x / this.#sampleLength)
        const indexX = Math.floor(xU) * 3
        if (indexX > this.#elementSizeX || indexX < 0) return -1


        const yU = (this.#center.y - y / this.#sampleLength)
        const indexY = Math.floor(yU) * this.#elementSizeX
        if (indexY > this.#elementSizeY || indexY < 0) return -1

        const zU = (this.#center.z - z / this.#sampleLength)
        const indexZ = Math.floor(zU) * this.#elementSizeY
        if (zU > this.#elementLength || indexZ < 0) return -1

        const index = indexX + indexY + indexZ
        return index
    }

    getAcceleration(position) {
        const index = this.#getElementIndex(position.x, position.y, position.z)
        if (index < 0) return
        return _vector3.fromArray(this.f32a, index)
    }

    #bodies = new Set()
    addBody(sphere, velocity) {
        const body = { sphere, velocity }
        this.#bodies.add(body)
        return () => { this.#bodies.delete(body) }
    }

    update() {
        this.#applyBodies()
        this.#applyPhysics()

        this.#applySpread()
    }

    #applyBodies() {
        for (const { sphere, velocity } of this.#bodies) {
            const index = this.#getElementIndex(sphere.center.x, sphere.center.y, sphere.center.z)
            if (index < 0) return
            this.f32a[index] = velocity.x
            this.f32a[index + 1] = velocity.y
            this.f32a[index + 2] = velocity.z
        }
    }

    #applyPhysics() {
        for (let i = 0; i < this.#pointLength; i++) {
            this.f32a[i * 3] /= 1.05
            this.f32a[i * 3 + 1] /= 1.05
            this.f32a[i * 3 + 2] /= 1.05
        }
    }

    #addVelocity(pointIndex, x, y, z) {
        if (pointIndex < 0) console.log('meh')
        this.f32a[pointIndex * 3] += x
        this.f32a[pointIndex * 3 + 1] += y
        this.f32a[pointIndex * 3 + 2] += z
    }

    #applySpread() {
        this.#f32aCopy.set(this.f32a)

        for (let i = 0; i < this.#elementLength; i++) this.f32a[i] /= 20

        for (let i = 0; i < this.#pointLength; i++) {
            if (i % this.#pointSizeX === 0) continue
            if (i % this.#pointSizeX === (this.#pointSizeX - 1)) continue


            const vX = this.#f32aCopy[i * 3] / 6
            const vY = this.#f32aCopy[i * 3 + 1] / 6
            const vZ = this.#f32aCopy[i * 3 + 2] / 6

            const c = Math.cos(PI025)
            const s = Math.sin(PI025)
            const a = vX
            // const b = vY * 
            // left
            if ((i % this.#pointSizeX) !== 0) this.#addVelocity(i - 1, vX, vY, vZ)

            const right = i + 1
            if ((right % this.#pointSizeX) !== 0) this.#addVelocity(right, vX, vY, vZ)

            // up
            if ((i % this.#pointSizeY) > this.#pointSizeX) this.#addVelocity(i - this.#pointSizeX, vX, vY, vZ)

            const down = i + this.#pointSizeX
            if ((down % this.#pointSizeX) !== 0) this.#addVelocity(down, vX, vY, vZ)

            // rear
            const rear = i - this.#pointSizeY
            if (rear >= 0) this.#addVelocity(rear, vX, vY, vZ)

            const front = i + this.#pointSizeY
            if (front < this.#pointLength) this.#addVelocity(front, vX, vY, vZ)
        }
    }

    #helpers = []
    initHelpers(scene) {
        if (this.#helpers.length) return
        for (let z = 0; z < this.#pointSizeX; z++) {
            for (let y = 0; y < this.#pointSizeX; y++) {
                for (let x = 0; x < this.#pointSizeX; x++) {
                    const helper = new Vector3Helper(scene)

                    helper.position.x = (this.#center.x - x) * this.#sampleLength
                    helper.position.y = (this.#center.y - y) * this.#sampleLength
                    helper.position.z = (this.#center.z - z) * this.#sampleLength
                    helper.scale.multiplyScalar(0.3)
                    this.#helpers.push(helper)
                }
            }
        }
    }

    updateHelper() {
        for (let i = 0; i < this.#pointLength; i++) {
            _vector3.fromArray(this.f32a, i * 3)
            this.#helpers[i].setDirection(_vector3)
        }
    }

}