import { Vector2 } from "../../../modules/math/Vector2.js"
import { EventSet } from "../../../modules/utils/EventSet.js"
import { Slot } from "./Slot.js"

export class Slots6 {
    element = document.createElement('div')
    onChange = new EventSet()

    #size2
    #size3

    constructor(slotSize) {
        this.#size2 = slotSize * 2
        this.#size3 = slotSize * 3

        this.slots = [new Slot(slotSize), new Slot(slotSize), new Slot(slotSize), new Slot(slotSize), new Slot(slotSize), new Slot(slotSize),]

        this.#initElement()
        window.addEventListener('resize', this.#updatePositionBound)
        for (const slot of this.slots) {
            slot.onChange = () => { this.onChange.emit(slot) }
        }
    }

    dispose() {
        window.removeEventListener('resize', this.#updatePositionBound)
    }

    #initElement() {
        this.element.style.display = 'grid'
        this.element.style.grid = '1fr 1fr / 1fr 1fr 1fr'
        this.element.style.gap = '1px'
        this.element.style.position = 'fixed'

        // this.element.style.backgroundBlendMode = 'color'

        document.body.appendChild(this.element)

        for (const slot of this.slots) {
            this.element.appendChild(slot.element)
        }
    }

    update = this.#update.bind(this)
    #update(dt_s) {
        for (const slot of this.slots) slot.update(dt_s)
    }

    wantedPosition = new Vector2(0, 0)
    #position = new Vector2(0, 0)

    translatePosition(dx, dy) {
        this.#position.x += dx
        this.#position.y += dy
        this.wantedPosition.copy(this.#position)
        this.#updatePosition()
    }

    setPosition(x, y) {
        this.wantedPosition.set(x, y)
        this.#updatePosition()
    }

    #updatePositionBound = this.#updatePosition.bind(this)
    #updatePosition() {
        if (this.wantedPosition.x < 0) this.#position.x = 0
        else if ((this.wantedPosition.x + this.#size3) > innerWidth)
            this.#position.x = Math.max(innerWidth - this.#size3, 0)
        else this.#position.x = this.wantedPosition.x

        if (this.wantedPosition.y < 0) this.#position.y = 0
        else if ((this.wantedPosition.y + this.#size2) > innerHeight)
            this.#position.y = Math.max(innerHeight - this.#size2, 0)
        else this.#position.y = this.wantedPosition.y

        this.#updateStyle()
    }


    #updateStyle() {
        this.element.style.right = `${this.#position.x}px`
        this.element.style.bottom = `${this.#position.y}px`
    }
}
