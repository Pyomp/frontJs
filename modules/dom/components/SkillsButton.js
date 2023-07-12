import { PI05, PI2 } from "../../math/MathUtils.js"

const xmlns = "http://www.w3.org/2000/svg"

export class SkillButton {
    container = document.createElementNS(xmlns, "svg")

    #cd = document.createElementNS(xmlns, 'path')

    #text = document.createElementNS(xmlns, 'text')

    #middle

    setImage(imageUrl) {
        this.container.style.backgroundImage = `url(${imageUrl})`
    }

    constructor({
        parent = document.body,
        size = 60
    }) {
        const m = size / 2
        this.#middle = m
        this.container.setAttributeNS(null, 'height', size)
        this.container.setAttributeNS(null, 'width', size)
        this.container.setAttributeNS(null, 'overflow', 'visible')
        this.container.style.userSelect = 'none'
        this.container.style.pointerEvents = 'none'
        this.container.style.backgroundSize = 'cover'
        this.container.style.touchAction = 'none'

        parent.appendChild(this.container)

        this.#cd.setAttributeNS(null, 'fill', '#00000088')
        this.#cd.setAttributeNS(null, 'd', `M ${m} ${m} L ${m} 0 A ${m} ${m} 0 1 0 0 0`)
        this.container.appendChild(this.#cd)

        this.#text.setAttribute('fill', '#ffffff')
        this.#text.setAttribute('dominant-baseline', 'middle')
        this.#text.setAttribute('text-anchor', 'middle')
        this.#text.style.fontSize = `${m / 2}px`
        this.#text.setAttribute('x', m)
        this.#text.setAttribute('y', m)
        this.container.appendChild(this.#text)
    }

    dispose() {
        this.container.remove()
    }
    
    cooldown = 0.1
    maxCooldown = 10

    update = this.#updatePrototype.bind(this)
    #updatePrototype(dt_s) {
        if (this.cooldown > 0) {
            this.cooldown -= dt_s
            const cdNormalized = Math.max(this.cooldown / this.maxCooldown, 0)
            const angleCd = (1 - cdNormalized) * PI2 - PI05
            const s = Math.sin(angleCd)
            const c = Math.cos(angleCd)
            const m = (c < 0 ? 0 : 1) ^ (s < 1 ? 0 : 0)
            this.#cd.setAttributeNS(null, 'd', `M ${this.#middle} ${this.#middle} L ${this.#middle} 0 A ${this.#middle} ${this.#middle} 0 ${m} 0 ${this.#middle + this.#middle * c} ${this.#middle + this.#middle * s}`)

            if (cdNormalized > 0) this.#text.innerHTML = this.cooldown.toFixed(1)
            else this.#text.innerHTML = ''
        }
    }
}

export class SkillButtonDir {
    container = document.createElementNS(xmlns, "svg")

    #direction = document.createElementNS(xmlns, 'line')

    #cd = document.createElementNS(xmlns, 'path')

    #text = document.createElementNS(xmlns, 'text')

    #middle

    #directionMaxLength
    #directionMaxLengthSq

    #absoluteCenterX = 0
    #absoluteCenterY = 0

    #updateAbsoluteCenter() {
        const { x, y } = this.container.getBoundingClientRect()
        this.#absoluteCenterX = x
        this.#absoluteCenterY = y
    }
    #resizeObserver = new ResizeObserver(this.#updateAbsoluteCenter.bind(this))

    setImage() {
        this.container.style.backgroundImage = `url(${imageUrl})`
    }

    onDown = () => { }
    onMove = () => { }
    onUp = () => { }

    constructor({
        parent = document.body,
        size = 50,
        directionColor = '#5555ff55',
        directionWidth = size * 0.5,
        directionMaxLength = size * 2,
    } = {}) {
        const m = size / 2
        this.#middle = m
        this.#directionMaxLength = directionMaxLength
        this.#directionMaxLengthSq = directionMaxLength ** 2

        this.container.setAttributeNS(null, 'height', size)
        this.container.setAttributeNS(null, 'width', size)
        this.container.setAttributeNS(null, 'overflow', 'visible')
        parent.appendChild(this.container)

        this.#cd.setAttributeNS(null, 'fill', '#00000088')
        this.#cd.setAttributeNS(null, 'd', `M ${m} ${m} L ${m} 0 A ${m} ${m} 0 1 0 0 0`)
        this.container.appendChild(this.#cd)

        this.#text.setAttribute('fill', '#ffffff')
        this.#text.setAttribute('dominant-baseline', 'middle')
        this.#text.setAttribute('text-anchor', 'middle')
        this.#text.style.fontSize = `${m / 2}px`
        this.#text.setAttribute('x', m)
        this.#text.setAttribute('y', m)
        this.container.appendChild(this.#text)

        this.#direction.setAttribute('x1', m)
        this.#direction.setAttribute('y1', m)
        this.#direction.setAttribute('x2', m)
        this.#direction.setAttribute('y2', m)
        this.#direction.setAttribute('stroke', directionColor)
        this.#direction.setAttribute('stroke-width', directionWidth)
        this.#direction.setAttribute('stroke-linecap', 'round')

        this.#direction.setAttributeNS(null, 'x1', m)
        this.#direction.setAttributeNS(null, 'y1', m)
        this.#direction.setAttributeNS(null, 'x2', m + 10)
        this.#direction.setAttributeNS(null, 'y2', m + 10)
        this.container.appendChild(this.#direction)

        this.container.onpointerdown = this.#onpointerdown.bind(this)
        this.container.onpointermove = this.#onpointermove.bind(this)
        this.container.onlostpointercapture = this.#onlostpointercapture.bind(this)

        this.#resizeObserver.observe(this.container)
    }

    dispose() {
        this.#resizeObserver.disconnect()
        this.container.remove()
    }

    cooldown = 10
    maxCooldown = 10

    #centerDirectionX
    #centerDirectionY

    #distanceDirectionX
    #distanceDirectionY

    #eventX
    #eventY

    #onpointerdown(event) {
        this.container.setPointerCapture(event.pointerId)
        this.#centerDirectionX = event.clientX - this.#absoluteCenterX
        this.#centerDirectionY = event.clientY - this.#absoluteCenterY
        this.#direction.setAttributeNS(null, 'x1', this.#centerDirectionX)
        this.#direction.setAttributeNS(null, 'y1', this.#centerDirectionY)
        this.container.appendChild(this.#direction)
        this.#direction.setAttributeNS(null, 'x2', this.#centerDirectionX)
        this.#direction.setAttributeNS(null, 'y2', this.#centerDirectionY)
        this.onDown()
    }

    #moveNeedsUpdate = false
    update = this.#updatePrototype.bind(this)
    #updatePrototype(dt_s) {
        if (this.cooldown > 0) {
            this.cooldown -= dt_s
            const cdNormalized = Math.max(this.cooldown / this.maxCooldown, 0)
            const angleCd = (1 - cdNormalized) * PI2 - PI05
            const s = Math.sin(angleCd)
            const c = Math.cos(angleCd)
            const m = (c < 0 ? 0 : 1) ^ (s < 1 ? 0 : 0)
            this.#cd.setAttributeNS(null, 'd', `M ${this.#middle} ${this.#middle} L ${this.#middle} 0 A ${this.#middle} ${this.#middle} 0 ${m} 0 ${this.#middle + this.#middle * c} ${this.#middle + this.#middle * s}`)

            if (cdNormalized > 0) this.#text.innerHTML = this.cooldown.toFixed(1)
            else this.#text.innerHTML = ''
        }

        if (this.#moveNeedsUpdate) {
            this.#moveNeedsUpdate = false
            this.#distanceDirectionX = this.#eventX - this.#absoluteCenterX
            this.#distanceDirectionY = this.#eventY - this.#absoluteCenterY

            const distanceSq = this.#distanceDirectionX ** 2 + this.#distanceDirectionY ** 2
            if (distanceSq > this.#directionMaxLengthSq) {
                const distance = distanceSq ** 0.5
                const cos = this.#distanceDirectionX / distance
                const sin = this.#distanceDirectionY / distance
                this.#distanceDirectionX = cos * this.#directionMaxLength
                this.#distanceDirectionY = sin * this.#directionMaxLength
            }

            this.#direction.setAttributeNS(null, 'x2', this.#distanceDirectionX)
            this.#direction.setAttributeNS(null, 'y2', this.#distanceDirectionY)

            this.onMove({
                x: this.#distanceDirectionX / this.#directionMaxLength,
                y: this.#distanceDirectionY / this.#directionMaxLength
            })
        }
    }

    #onpointermove(event) {
        if (!this.container.hasPointerCapture(event.pointerId)) return
        this.#eventX = event.clientX
        this.#eventY = event.clientY
        this.#moveNeedsUpdate = true
    }



    #onlostpointercapture(event) {
        this.container.releasePointerCapture(event.pointerId)
        this.onUp({
            x: this.#distanceDirectionX / this.#directionMaxLength,
            y: this.#distanceDirectionY / this.#directionMaxLength
        })
        this.#direction.remove()
    }
}