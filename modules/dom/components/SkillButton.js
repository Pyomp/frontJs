import { PI025, PI05 } from "../../modules/math/MathUtils.js"
import { Vector2 } from "../../modules/math/Vector2.js"
import { doItOnceNextRaf, eventPreventDefaultStopPropagation } from "../../modules/utils/utils.js"
import { stringToSvgElement } from "../../modules/dom/browserUtils.js"
import { EventSet } from "../../modules/utils/EventSet.js"

const SIZE = 130
const SIZE05 = SIZE / 2
const SIZE025 = SIZE05 / 2
const SIZE025_SQ = SIZE025 ** 2
const _vector2 = new Vector2()

export class SkillButton {
    #buttonElement = makeButtonView(SIZE)
    #leftElement = this.#buttonElement.lastElementChild
    #downElement = this.#leftElement.previousElementSibling
    #rightElement = this.#downElement.previousElementSibling
    #upElement = this.#rightElement.previousElementSibling

    onChange = new EventSet()

    get up() { return (this.binary & (1 << 0)) !== 0 }
    get right() { return (this.binary & (1 << 1)) !== 0 }
    get down() { return (this.binary & (1 << 2)) !== 0 }
    get left() { return (this.binary & (1 << 3)) !== 0 }

    binary = 0

    #offHighlight() {
        this.binary = 0
        this.#upElement.setAttribute('fill', 'none')
        this.#rightElement.setAttribute('fill', 'none')
        this.#downElement.setAttribute('fill', 'none')
        this.#leftElement.setAttribute('fill', 'none')
    }

    #onHighlightUp() {
        if (this.binary === 1) return
        this.#offHighlight()
        this.#upElement.setAttribute('fill', 'url(#skillButtonGradient)')
        this.binary = 1
        this.onChange.emit()
    }

    #onHighlightRight() {
        if (this.binary === (1 << 1)) return
        this.#offHighlight()
        this.#rightElement.setAttribute('fill', 'url(#skillButtonGradient)')
        this.binary = 1 << 1
        this.onChange.emit()
    }

    #onHighlightDown() {
        if (this.binary === (1 << 2)) return
        this.#offHighlight()
        this.#downElement.setAttribute('fill', 'url(#skillButtonGradient)')
        this.binary = 1 << 2
        this.onChange.emit()
    }

    #onHighlightLeft() {
        if (this.binary === (1 << 3)) return
        this.#offHighlight()
        this.#leftElement.setAttribute('fill', 'url(#skillButtonGradient)')
        this.binary = 1 << 3
        this.onChange.emit()
    }

    #setPosition(vector2) {
        this.#buttonElement.style.top = `${vector2.y}px`
        this.#buttonElement.style.left = `${vector2.x}px`
    }

    #scale = 1
    #setScale(scale) {
        this.#scale = scale
        this.#buttonElement.style.transform = `translate(-50%, -50%) scale(${scale})`
    }

    #currentUserPosition = new Vector2()

    #skillChosen = false
    #moveEnabled = false
    #updateMoveBound = this.#updateMove.bind(this)
    #updateMove() {
        if (!this.#moveEnabled) return
        _vector2
            .subVectors(this.#pointerDownPosition, this.#currentUserPosition)
            .divideScalar(this.#scale)
        const lengthSq = _vector2.lengthSq()

        if (lengthSq > SIZE025_SQ) {
            const angle = _vector2.angle()
            if (angle < PI025) this.#onHighlightLeft()
            else if (angle < PI025 * 3) this.#onHighlightUp()
            else if (angle < PI025 * 5) this.#onHighlightRight()
            else if (angle < PI025 * 7) this.#onHighlightDown()
            else this.#onHighlightLeft()
            this.#skillChosen = true
        }
    }

    #onMoveBound = this.#onMove.bind(this)
    #onMove(event) {
        if (this.#skillChosen) return
        this.#currentUserPosition.set(event.clientX, event.clientY)
        doItOnceNextRaf(this.#updateMoveBound)
    }

    #pointerDownPosition = new Vector2()
    #setPointerId(event) {
        this.#buttonElement.setPointerCapture(event.pointerId)
        this.#moveEnabled = true
        this.#pointerDownPosition.x = event.clientX
        this.#pointerDownPosition.y = event.clientY
        this.#currentUserPosition.copy(this.#pointerDownPosition)
        this.#setPosition(this.#pointerDownPosition)
        this.#skillChosen = false
        this.#setScale(0.8)
        this.#buttonElement.style.zIndex = '9999'
    }

    #onLostPointerCaptureBound = this.#onLostPointerCapture.bind(this)
    #onLostPointerCapture() {
        this.#moveEnabled = false
        this.#offHighlight()
        this.#setScale(0.5)
        this.#buttonElement.style.zIndex = '0'
        this.#resetPosition()
        this.onChange.emit()
    }


    #initialPosition = new Vector2()
    setInitialPosition(x, y) {
        this.#initialPosition.x = x
        this.#initialPosition.y = y
        if (!this.#moveEnabled) {
            this.#setPosition(this.#initialPosition)
        }
    }
    #resetPosition() {
        this.#setPosition(this.#initialPosition)
    }

    constructor({
        initialPosition = { x: 100, y: 100 }
    }) {
        this.setInitialPosition(initialPosition.x, initialPosition.y)

        this.#buttonElement.onpointermove = this.#onMoveBound
        this.#buttonElement.onlostpointercapture = this.#onLostPointerCaptureBound
        this.#buttonElement.addEventListener('pointerdown', event => {
            event.preventDefault()
            event.stopPropagation()
            if (_vector2.set(-event.clientX, -event.clientY)
                .add(this.#initialPosition)
                .lengthSq() < SIZE025_SQ)
                this.#setPointerId(event)
        })

        document.body.appendChild(this.#buttonElement)
        this.#setScale(0.5)
    }

    dispose() {
        this.#buttonElement.remove()
    }
}

function makeArc(
    center,
    outerRadius,
    innerRadius,
    angle,
) {
    const startCos = Math.cos(angle + PI05)
    const startSin = Math.sin(angle + PI05)
    const endCos = Math.cos(angle)
    const endSin = Math.sin(angle)
    return `<path d="
            M ${startCos * outerRadius + center} ${startSin * outerRadius + center}
            A ${center} ${center}, 0, 0, 0, ${endCos * outerRadius + center} ${endSin * outerRadius + center} 
            L ${endCos * innerRadius + center} ${endSin * innerRadius + center} 
            A ${innerRadius} ${innerRadius}, 0, 0, 1, ${startCos * innerRadius + center} ${startSin * innerRadius + center}
            Z"
            stroke="orange"
            />`
}

function makeButtonView(size) {
    const radius = size / 2
    const outerRadius = SIZE05 - 0.5
    const innerRadius = outerRadius / 2

    let svg = /* svg */`
        <svg opacity="0.5" width="${SIZE}" height="${SIZE}" xmlns="http://www.w3.org/2000/svg">
    `
    if (!document.getElementById('skillButtonGradient'))
        svg += `
            <defs>
                <radialGradient id="skillButtonGradient">
                    <stop offset="50%" stop-color="transparent" />
                    <stop offset="80%" stop-color="red" />
                    <stop offset="95%" stop-color="orange" />
                </radialGradient>
            </defs>
            `

    svg += makeArc(radius, outerRadius, innerRadius, PI025 * 5)
    svg += makeArc(radius, outerRadius, innerRadius, PI025 * 7)
    svg += makeArc(radius, outerRadius, innerRadius, PI025)
    svg += makeArc(radius, outerRadius, innerRadius, PI025 * 3)

    svg += `</svg>`

    const element = stringToSvgElement(svg, SIZE, SIZE)
    element.style.position = 'fixed'
    element.style.userSelect = 'none'
    element.style.touchAction = 'none'
    element.oncontextmenu = eventPreventDefaultStopPropagation
    return element
}
