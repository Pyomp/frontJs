export class ExampleParticleSystemDebugView {
    element = document.createElement('div')
    #particleCount = document.createElement('span')
    #renderer
    #raf

    constructor(renderer, parent = document.body) {
        this.#renderer = renderer
        this.element.append('Particle count: ')
        this.element.appendChild(this.#particleCount)
        this.#initElementStyle()
        parent.appendChild(this.element)
        this.#raf = requestAnimationFrame(this.#updateBound)
    }

    #updateBound = this.#update.bind(this)
    #update() {
        this.#particleCount.innerHTML = this.#renderer.particleManager.particleCount
        this.#raf = requestAnimationFrame(this.#updateBound)
    }

    #initElementStyle() {
        this.element.style.position = 'fixed'
        this.element.style.top = '0px'
        this.element.style.left = '0px'
    }

    dispose() {
        this.element.remove()
        cancelAnimationFrame(this.#raf)
    }
}