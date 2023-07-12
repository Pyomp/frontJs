import { styles } from "../../../modules/dom/styles/styles.js"
import { clamp } from "../../../modules/math/MathUtils.js"
import { createSvg, svgLine } from "../../../modules/utils/svg.js"

const HEIGHT = 10
const HEIGHT05 = HEIGHT / 2
const WIDTH = 200
const WIDTH05 = WIDTH / 2
const WIDTH_NO_PADDING = WIDTH - HEIGHT05

export class SkillLoader {
    element = createSvg({
        width: WIDTH,
        height: HEIGHT,
    })

    #line = svgLine({
        x1: HEIGHT05,
        y1: HEIGHT05,
        x2: HEIGHT05,
        y2: HEIGHT05,
    }, {
        'stroke-width': `${HEIGHT}px`,
        'stroke': `red`,
        'stroke-linecap': "round"
    })

    setValue(value) {
        this.#line.setAttribute('x2', (WIDTH_NO_PADDING * clamp(value, 0, 1)).toString())
    }

    setColor(value) {
        this.#line.setAttribute('stroke', value)
    }

    constructor() {
        this.#initStyle()
        this.element.appendChild(this.#line)
        document.body.appendChild(this.element)
        window.addEventListener('resize', this.#updatePositionBound)
    }

    dispose() {
        window.removeEventListener('resize', this.#updatePositionBound)
    }

    #initStyle() {
        this.element.style.background = styles.vars["--background-transparent03"]
        this.element.style.borderRadius = `${HEIGHT05}px`
        this.element.style.userSelect = 'none'
        this.element.style.pointerEvents = 'none'

        this.element.style.position = 'fixed'
        this.#updatePosition()
    }

    #updatePositionBound = this.#updatePosition.bind(this)
    #updatePosition() {
        this.element.style.left = `${innerWidth / 2 - WIDTH05}px`
        this.element.style.top = `${(innerHeight / 6) * 5 - HEIGHT}px`
    }
}
