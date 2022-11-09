import { PI2 } from '../../math/MathUtils.js'
import { Vector3 } from '../../math/Vector3.js'
import { EventSet } from '../../models/Events.js'
import { isMobile } from '../../modules/dom/browserInfo.js'

const MinPolarAngle = 0.1
const MaxPolarAngle = 3
const MinDistCam = 1
const MaxDistCam = 10
const MinDistCamToGround = 0

export class ThirdControls{
    #offsetY = 0.1
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
    #sensitivity = 4
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

    target = new Vector3()
    theta = 0

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

    /**
     * 
     * @param {Camera} camera
     * @param {HTMLCanvasElement} domElement 
     * @param {Vector3} target 
     * @param {Set<(dt: number)=>{}>} onBeforeRender 
     */
    constructor(
        camera,
        domElement,
        onBeforeRender,
        target,
    ) {
        super()
        domElement.style.touchAction = 'none'

        const cameraPosition = camera.position

        if (target) this.target = target

        let phi = .8, r = 10,
            phiWanted = phi, rWanted = r

        let isEvent = false

        let dirX = 5, dirY = 5, dirZ = 5

        let minR = MaxDistCam / 2
        let maxR = minR * 5

        const update = (dt) => {
            const targetOffseted = this.target.y + this.offsetY

            if (isEvent === true) {

                phi = phiWanted
                rWanted = minR * 4
                r = rWanted

            } else {

                dirX = cameraPosition.x - this.target.x
                dirY = cameraPosition.y - targetOffseted
                dirZ = cameraPosition.z - this.target.z

                rWanted = (dirX ** 2 + dirY ** 2 + dirZ ** 2) ** .5
                phi = Math.acos(dirY / rWanted)
                if (rWanted < minR) rWanted = minR
                else if (rWanted > maxR) rWanted = maxR

                this.theta = Math.atan2(dirX, dirZ)

                const phiDiff = phiWanted - phi

                if (phiDiff > 0.1) phi = phi + phiDiff * dt * .1
                else if (phiDiff < 0.01) phi = phi + phiDiff * dt * 1

                if (phi < 0.1) phi = 0.1
                if (phi > 1.55) phi = 1.55

                r = r + (rWanted - r) * dt / 2
            }

            const sinPhiRadius = Math.sin(phi) * r
            dirX = sinPhiRadius * Math.sin(this.theta)
            dirY = Math.cos(phi) * r
            dirZ = sinPhiRadius * Math.cos(this.theta)

            cameraPosition.x = this.target.x + dirX
            cameraPosition.y = targetOffseted + dirY
            cameraPosition.z = this.target.z + dirZ

            if (cameraPosition.y < MinDistCamToGround) cameraPosition.y = MinDistCamToGround
            camera.lookAt(this.target.x, targetOffseted, this.target.z)
            camera.needsUpdate = true
        }

        let p1
        let p1X = 0, p1Y = 0
        let p2
        let p2X = 0, p2Y = 0
        let dist = 0

        if (isMobile) {

            const onPointerdown = (e) => {
                if (p1 === undefined) {
                    phiWanted = phi
                    rWanted = r
                    isEvent = true
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
                    isEvent = !!p1
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
                        const delta = newDist - dist
                        dist = newDist

                        minR += -delta * 0.01 * minR
                        if (minR < MinDistCam) minR = MinDistCam
                        else if (minR > MaxDistCam) minR = MaxDistCam
                        maxR = minR * 5

                    } else {
                        const dx = e.clientX - p1X
                        const dy = e.clientY - p1Y
                        p1X = e.clientX; p1Y = e.clientY // save last mouse position
                        const deltaTheta = dx * this.sensitivity / domElement.clientHeight // yes, height
                        const deltaPhi = dy * this.sensitivity / domElement.clientHeight // rotate Up
                        this.theta = (this.theta - deltaTheta) % PI2
                        phiWanted = (phiWanted - deltaPhi) % PI2

                        if (phiWanted < MinPolarAngle) phiWanted = MinPolarAngle; else if (phiWanted > MaxPolarAngle) phiWanted = MaxPolarAngle
                    }
                }
            }

            domElement.addEventListener('pointerdown', onPointerdown)
            domElement.addEventListener('lostpointercapture', onEnd)
            domElement.addEventListener('pointermove', onPointermove)
            this.dispose = () => {
                domElement.removeEventListener('pointerdown', onPointerdown)
                domElement.removeEventListener('lostpointercapture', onEnd)
                domElement.removeEventListener('pointermove', onPointermove)
                onBeforeRender.delete(update)
            }
        } else {
            const onWheel = (e) => {
                if (e.target !== domElement) return
                const delta = (-e.wheelDelta * r) / 5000
                minR += delta
                if (minR < MinDistCam) minR = MinDistCam
                else if (minR > MaxDistCam) minR = MaxDistCam
                maxR = minR * 5

                phiWanted = phi
                rWanted = minR * 4
                r = rWanted
            }

            const onPointermove = (e) => {
                const deltaTheta = e.movementX * this.sensitivity / domElement.clientHeight // yes, height
                const deltaPhi = e.movementY * this.sensitivity / domElement.clientHeight // rotate Up
                this.theta = (this.theta - deltaTheta) % PI2

                phiWanted = (phiWanted - deltaPhi) % PI2

                if (phiWanted < MinPolarAngle) phiWanted = MinPolarAngle
                else if (phiWanted > MaxPolarAngle) phiWanted = MaxPolarAngle
            }

            domElement.addEventListener('pointerdown', (e) => {
                domElement.requestPointerLock()
                p1X = e.clientX; p1Y = e.clientY
            })

            const lockChangeAlert = (e) => {
                document.activeElement.blur()
                if (document.pointerLockElement === null) {
                    domElement.removeEventListener('mousemove', onPointermove)
                    isEvent = false
                } else {
                    domElement.addEventListener('mousemove', onPointermove)
                    phiWanted = phi
                    rWanted = r
                    isEvent = true
                }
            }

            document.addEventListener('pointerlockchange', lockChangeAlert, false)
            document.addEventListener('mozpointerlockchange', lockChangeAlert, false)
            document.addEventListener('webkitpointerlockchange', lockChangeAlert, false)

            document.addEventListener('wheel', onWheel)

            this.dispose = () => {
                onBeforeRender.delete(update)
                document.removeEventListener('wheel', onWheel)
                document.removeEventListener('pointerlockchange', lockChangeAlert, false)
                document.removeEventListener('mozpointerlockchange', lockChangeAlert, false)
                document.removeEventListener('webkitpointerlockchange', lockChangeAlert, false)
            }

        }
        onBeforeRender.add(update)
    }
}
