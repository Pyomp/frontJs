import { styles } from "../../../modules/dom/styles/styles.js"
import { PI05, PI2 } from "../../../modules/math/MathUtils.js"
import { createSvg } from "../../../modules/utils/svg.js"

export class Slot {
    action = 0
    element = document.createElement('div')
    #cdImageElement = document.createElementNS("http://www.w3.org/2000/svg", 'path')
    #cdTextElement = document.createElement('span')

    #size05

    constructor(size) {
        this.#size05 = size * 0.5
        this.#initContainer(size)
        this.#initCdImageElement(size)
        this.#initEventListeners()
    }

    update(dt_s) {
        this.#updateCooldown(dt_s)
    }

    setAction(actionId, imageUrl) {
        this.action = actionId
        this.setImage(imageUrl)
    }

    #initContainer(size) {
        this.element.style.width = `${size}px`
        this.element.style.height = `${size}px`

        this.element.style.position = 'relative'

        this.element.style.background = styles.vars["--background-transparent03"]
        this.element.style.backgroundSize = '90%'
        this.element.style.backgroundRepeat = 'no-repeat'
        this.element.style.backgroundPosition = 'center'

        this.element.style.display = 'flex'
        this.element.style.justifyContent = 'center'
        this.element.style.alignItems = 'center'


        this.element.appendChild(this.#cdTextElement)
    }

    #initCdImageElement(size) {
        this.#cdImageElement.setAttributeNS(null, 'fill', '#00000088')
        // this.#cdImageElement.setAttributeNS(null, 'd', `M ${SIZE05} ${SIZE05} L ${SIZE05} 0 A ${SIZE05} ${SIZE05} 0 1 0 0 0`)

        const svg = createSvg({ width: size, height: size })
        svg.style.position = 'absolute'
        svg.appendChild(this.#cdImageElement)
        this.element.appendChild(svg)
    }


    // EVENT
    onChange = () => { }
    pressed = false

    #initEventListeners() {
        this.element.onpointerdown = this.#onPointerDownBound
        this.element.onlostpointercapture = this.#onLostPointerCaptureBound
    }

    #onPointerDownBound = this.#onPointerDown.bind(this)
    #onPointerDown(event) {
        this.element.setPointerCapture(event.pointerId)
        this.pressed = true
        this.onChange()
    }


    #onLostPointerCaptureBound = this.#onLostPointerCapture.bind(this)
    #onLostPointerCapture() {
        this.pressed = false
        this.onChange()
    }

    // COOLDOWN
    setCooldown(current, max) {
        this.#cooldown = current
        this.#maxCooldown = max
    }

    setImage(url) {
        this.element.style.backgroundImage = `url(${url})`
    }

    #cooldown = 0.1
    #maxCooldown = 10

    #updateCooldown(dt_s) {
        if (this.#cooldown > 0) {
            this.#cooldown -= dt_s
            const cdNormalized = Math.max(this.#cooldown / this.#maxCooldown, 0)
            const angleCd = (1 - cdNormalized) * PI2 - PI05
            const s = Math.sin(angleCd)
            const c = Math.cos(angleCd)
            const m = (c < 0 ? 0 : 1) ^ (s < 1 ? 0 : 0)
            const l = this.#size05
            this.#cdImageElement.setAttributeNS(null, 'd', `M ${l} ${l} L ${l} 0 A ${l} ${l} 0 ${m} 0 ${l + l * c} ${l + l * s}`)

            if (cdNormalized > 0) this.#cdTextElement.innerHTML = this.#cooldown.toFixed(1)
            else this.#cdTextElement.innerHTML = ''
        }
    }
}
