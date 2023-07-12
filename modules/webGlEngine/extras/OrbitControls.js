import { Spherical } from '../../math/Spherical.js'
import { Vector2 } from '../../math/Vector2.js'
import { Vector3 } from '../../math/Vector3.js'

const _up = new Vector3(0, 1, 0)

export class OrbitControls {
    sensitivity = 4
    target = new Vector3(0, 0, 0)
    spherical = new Spherical(1, -1, 4)
    #direction = new Vector3()
    #camera

    #pan = new Vector2()

    #verticalScreen = new Vector3()
    #horizontalScreen = new Vector3()

    #lastMousePosition = new Vector2()

    #domElement
    /**
     * 
     * @param {Camera} camera 
     * @param {HTMLCanvasElement} domElement
     */
    constructor(
        camera,
        domElement
    ) {
        domElement.addEventListener('contextmenu', (e) => { e.stopPropagation(); e.preventDefault() })
        domElement.style.touchAction = 'none'

        this.spherical.radius = camera.position.length()
        this.#camera = camera
        this.#domElement = domElement

        this.update = () => {
            if (this.#camera.needsUpdate !== true) return

            if (this.#pan.x !== 0 || this.#pan.y !== 0) {

                this.#direction.subVectors(this.#camera.position, this.target)

                this.#horizontalScreen.crossVectors(this.#direction, _up).normalize()
                this.#verticalScreen.crossVectors(this.#horizontalScreen, this.#direction).normalize()

                this.#pan.multiplyScalar(0.01)

                this.#horizontalScreen.multiplyScalar(this.#pan.x)
                this.#verticalScreen.multiplyScalar(this.#pan.y)

                this.target.add(this.#horizontalScreen)
                    .add(this.#verticalScreen)
            }

            if (this.spherical.radius < 0.1) this.spherical.radius = 0.1
            if (this.spherical.phi > -0.1) this.spherical.phi = -0.1
            else if (this.spherical.phi < -3) this.spherical.phi = -3
            this.#direction.setFromSpherical(this.spherical)

            this.#camera.position.copy(this.target).add(this.#direction)

            this.#camera.lookAt(this.target)
        }

        addEventListener('wheel', this.#onWheelBound)

        domElement.addEventListener('pointerdown', this.#onPointerdownBound)
        domElement.addEventListener('lostpointercapture', this.#onLostpointercaptureBound)
    }

    dispose() {
        this.#domElement.removeEventListener('pointerdown', this.#onPointerdownBound)
        this.#domElement.removeEventListener('lostpointercapture', this.#onLostpointercaptureBound)
        removeEventListener('wheel', this.#onWheelBound)
    }

    #onPointerdownBound = this.#onPointerdown.bind(this)
    #onPointerdown(e) {
        this.#lastMousePosition.set(e.clientX, e.clientY)
        this.#domElement.setPointerCapture(e.pointerId)
        this.#domElement.addEventListener('pointermove', this.#onPointermoveBound)
    }

    #onLostpointercaptureBound = this.#onLostpointercapture.bind(this)
    #onLostpointercapture() {
        this.#domElement.removeEventListener('pointermove', this.#onPointermoveBound)
        this.#camera.needsUpdate = true
    }

    #onWheelBound = this.#onWheel.bind(this)
    #onWheel(e) {
        this.spherical.radius = Math.max(0.1, this.spherical.radius + e.deltaY * (1 + (this.spherical.radius ** 0.6)) / 250)
        this.#camera.needsUpdate = true
    }

    #onPointermoveBound = this.#onPointermove.bind(this)
    #onPointermove(e) {
        if (e.buttons === 1) {
            this.spherical.phi += (e.clientY - this.#lastMousePosition.y) / 100
            this.spherical.theta += (this.#lastMousePosition.x - e.clientX) / 100
        } else {
            this.#pan.x += e.clientX - this.#lastMousePosition.x
            this.#pan.y += e.clientY - this.#lastMousePosition.y
        }
        this.#lastMousePosition.set(e.clientX, e.clientY)
        this.#camera.needsUpdate = true
    }
}
