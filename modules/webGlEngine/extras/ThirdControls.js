import { clamp, PI2 } from '../../math/MathUtils.js'
import { Vector3 } from '../../math/Vector3.js'
import { EventSet } from '../../utils/EventSet.js'
import { isMobile } from '../../dom/browserInfo.js'
import { getGeometries3DHeight, getNode3DHeight } from './raycasterUtils.js'
import { Spherical } from '../../math/Spherical.js'
import { Sphere } from '../../math/Sphere.js'

const MinPolarAngle = 0.1
const MaxPolarAngle = 3.05
const MinDistCam = 1
const MaxDistCam = 60
const MinDistCamToGround = 1

export class ThirdControls {
    #offsetY = 1
    onOffsetY = new EventSet()
    get offsetY() { return this.#offsetY }
    set offsetY(a) {
        if (this.#offsetY !== a
            && Number.isFinite(a)
        ) {
            this.#offsetY = a
            this.onOffsetY.emit()
        }
    }

    onSensitivity = new EventSet()
    #sensitivity = 8
    get sensitivity() { return this.#sensitivity }
    set sensitivity(a) {
        if (this.#sensitivity !== a
            && Number.isFinite(a)
            && a >= 1
        ) {
            this.#sensitivity = a
            this.onSensitivity.emit()
        }
    }

    toArray() {
        return [
            this.#offsetY,
            this.#sensitivity
        ]
    }

    fromArray(array) {
        if (array?.constructor !== Array) return
        this.offset_y = array[0]
        this.sensitivity = array[1]
    }

    #targetOffset = new Vector3()
    target = new Vector3()
    /** @type {Geometry[]} */ groundGeometries
    enabled = false

    #isModeFollow = true

    spherical = new Spherical(40, 0.8, 0)
    #wantedSpherical = new Spherical().copy(this.spherical)

    #direction = new Vector3(5, 5, 5)

    #cameraPosition
    #camera

    #boundingSphere = new Sphere(undefined, 2)
    /**
     * 
     * @param {Camera} camera
     * @param {HTMLCanvasElement} domElement
     */
    constructor(
        camera,
        domElement
    ) {
        domElement.style.touchAction = 'none'
        domElement.oncontextmenu = (event) => { event.stopPropagation(); event.preventDefault(); return }

        this.dispose = isMobile ? this.#initMobileEvent(domElement) : this.#initComputerEvent(domElement)

        this.#camera = camera
        this.#cameraPosition = camera.position
        this.#boundingSphere.center = camera.position
    }

    update = this.#update.bind(this)
    #update() {
        if (!this.enabled) return
        this.#targetOffset.copy(this.target)
        this.#targetOffset.y += this.offsetY

        this.spherical.copy(this.#wantedSpherical)

        if (this.#isModeFollow === true) {
            this.#direction.subVectors(this.#cameraPosition, this.#targetOffset)
            this.spherical.theta = Math.atan2(this.#direction.x, this.#direction.z)
        }

        this.#direction.setFromSpherical(this.spherical)

        this.#cameraPosition.addVectors(this.#targetOffset, this.#direction)

        if (this.groundGeometries) {
            const groundHeight = getGeometries3DHeight(this.groundGeometries, this.#cameraPosition.x, this.#cameraPosition.z)
            if (this.#cameraPosition.y < groundHeight + MinDistCamToGround) {
                this.#cameraPosition.y = groundHeight + MinDistCamToGround
            }
        }

        this.#camera.lookAt(this.#targetOffset)
        this.#camera.needsUpdate = true
    }

    #initMobileEvent(domElement) {
        let p1
        let p1X = 0, p1Y = 0
        let p2
        let p2X = 0, p2Y = 0
        let dist = 0

        const onPointerdown = (e) => {
            if (p1 === undefined) {
                this.#wantedSpherical.copy(this.spherical)
                this.#isModeFollow = false
                domElement.setPointerCapture(e.pointerId)
                p1 = e.pointerId; p1X = e.clientX; p1Y = e.clientY
            } else if (p2 === undefined) {
                domElement.setPointerCapture(e.pointerId)
                p2 = e.pointerId; p2X = e.clientX; p2Y = e.clientY
                dist = ((p1X - p2X) ** 2 + (p1Y - p2Y) ** 2) ** .5
            }
        }

        const onEnd = (e) => {
            const id = e.pointerId
            domElement.releasePointerCapture(id)
            if (p1 === id) {
                p1 = p2
                p1X = p2X
                p1Y = p2Y
                p2 = undefined
                this.#isModeFollow = !p1
            } else if (p2 === id) {
                p2 = undefined
            }
        }

        const onPointermove = (e) => {
            const id = e.pointerId
            if (p1 === id || p2 === id) {
                if (p2) { // zoom
                    if (p1 === id) { p1X = e.clientX; p1Y = e.clientY }
                    else if (p2 === id) { p2X = e.clientX; p2Y = e.clientY }

                    const newDist = ((p1X - p2X) ** 2 + (p1Y - p2Y) ** 2) ** .5
                    const delta = dist - newDist
                    dist = newDist

                    this.#wantedSpherical.phi = this.spherical.phi
                    this.#wantedSpherical.theta = this.spherical.theta
                    this.#wantedSpherical.radius = clamp(this.#wantedSpherical.radius + delta * 0.05, MinDistCam, MaxDistCam)

                    this.spherical.radius = this.#wantedSpherical.radius
                } else {
                    const dx = e.clientX - p1X
                    const dy = e.clientY - p1Y
                    p1X = e.clientX; p1Y = e.clientY // save last mouse position
                    const deltaTheta = dx * this.sensitivity / domElement.clientHeight // yes, height
                    const deltaPhi = dy * this.sensitivity / domElement.clientHeight // rotate Up
                    this.#wantedSpherical.theta = (this.#wantedSpherical.theta - deltaTheta) % PI2
                    this.#wantedSpherical.phi = (this.#wantedSpherical.phi - deltaPhi) % PI2

                    if (this.#wantedSpherical.phi < MinPolarAngle) this.#wantedSpherical.phi = MinPolarAngle; else if (this.#wantedSpherical.phi > MaxPolarAngle) this.#wantedSpherical.phi = MaxPolarAngle
                }
            }
        }

        domElement.addEventListener('pointerdown', onPointerdown)
        domElement.addEventListener('lostpointercapture', onEnd)
        domElement.addEventListener('pointermove', onPointermove)

        return () => {
            domElement.removeEventListener('pointerdown', onPointerdown)
            domElement.removeEventListener('lostpointercapture', onEnd)
            domElement.removeEventListener('pointermove', onPointermove)
        }
    }

    #initComputerEvent(domElement) {
        const onWheel = (e) => {
            if (e.target !== domElement) return

            const delta = (-e.wheelDelta * this.spherical.radius) / 1000

            this.#wantedSpherical.phi = this.spherical.phi
            this.#wantedSpherical.theta = this.spherical.theta
            this.#wantedSpherical.radius = clamp(this.#wantedSpherical.radius + delta, MinDistCam, MaxDistCam)

            this.spherical.radius = this.#wantedSpherical.radius
        }

        const onPointermove = (e) => {
            const deltaTheta = e.movementX * this.sensitivity / domElement.clientHeight // yes, height
            const deltaPhi = e.movementY * this.sensitivity / domElement.clientHeight // rotate Up

            this.#wantedSpherical.theta = (this.#wantedSpherical.theta - deltaTheta) % PI2
            this.#wantedSpherical.phi = clamp((this.#wantedSpherical.phi - deltaPhi) % PI2, MinPolarAngle, MaxPolarAngle)
        }

        domElement.addEventListener('pointerdown', (e) => {
            domElement.requestPointerLock()
        })

        const lockChangeAlert = (e) => {
            // @ts-ignore vscode ts is so bad
            document.activeElement.blur()
            if (document.pointerLockElement === null) {
                domElement.removeEventListener('mousemove', onPointermove)
                this.#isModeFollow = true
            } else {
                if (!this.enabled) return
                domElement.addEventListener('mousemove', onPointermove)
                this.#wantedSpherical.copy(this.spherical)
                this.#isModeFollow = false
            }
        }

        document.addEventListener('pointerlockchange', lockChangeAlert, false)
        document.addEventListener('mozpointerlockchange', lockChangeAlert, false)
        document.addEventListener('webkitpointerlockchange', lockChangeAlert, false)
        document.addEventListener('wheel', onWheel)

        return () => {
            document.removeEventListener('wheel', onWheel)
            document.removeEventListener('pointerlockchange', lockChangeAlert, false)
            document.removeEventListener('mozpointerlockchange', lockChangeAlert, false)
            document.removeEventListener('webkitpointerlockchange', lockChangeAlert, false)
        }
    }
}
