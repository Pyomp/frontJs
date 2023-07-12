export class FPSView {
    element = document.createElement('span')

    #fps = new Array(100).fill(60)

    #updateBound = this.#update.bind(this)
    #last = performance.now() / 1000
    #update(now) {
        const now_s = now / 1000
        const dt = now_s - this.#last
        this.#last = now_s

        this.#fps.unshift(1 / dt)
        this.#fps.length = 100
        this.element.innerHTML = (this.#fps.reduce((a, b) => a + b) / 100).toFixed()

        requestAnimationFrame(this.#updateBound)
    }

    #raf = requestAnimationFrame(this.#updateBound)

    constructor(parent = document.body) {
        this.element.style.position = 'fixed'
        this.element.style.bottom = '5px'
        this.element.style.right = '5px'
        parent.appendChild(this.element)
    }

    dispose() {
        cancelAnimationFrame(this.#raf)
        this.element.remove()
    }
}
