const model = document.createElement('span')
model.style.background = 'radial-gradient(hsla(30, 100%, 60%, 0) 20%, hsla(10, 100%, 70%, 1) 40%, hsla(0, 100%, 70%, 0) 50%)'
model.style.position = 'fixed'
model.style.width = '100px'
model.style.height = '100px'
model.style.opacity = 0
model.style.transform = `scale(0)`
model.style.transitionProperty = 'transform, opacity'
model.style.transitionDuration = '0.02s, 0.02s'
model.style.pointerEvents = 'none'
model.style.userSelect = 'none'

export class Tap {
    #clone = model.cloneNode()

    constructor() {
        requestAnimationFrame(() => {
            document.body.appendChild(this.#clone)
        })
    }

    dispose() { this.#clone.remove() }

    lastUpdate = Date.now()
    set x(value) { this.#clone.style.left = `${value - 50}px` }
    set y(value) { this.#clone.style.top = `${value - 50}px` }
    set time(value) {
        this.#clone.style.transform = `scale(${value})`
        this.#clone.style.opacity = 1 - Math.abs(value - 0.5) * 2
    }
}