import { Color } from '../../../math/Color.js'

export class Light {
    needsUpdate = true

    #visible = 0
    get visible() { return this.#visible }
    set visible(value) { this.#visible = value; this.needsUpdate = true }

    #intensity = 1
    get intensity() { return this.#intensity }
    set intensity(value) { this.#intensity = value; this.needsUpdate = true }

    proxyHandler = {
        set: (target, p, value) => {
            target[p] = value
            this.needsUpdate = true
            return true
        }
    }
    
    /** @type {Color} */
    color = new Proxy(new Color(1, 1, 1), this.proxyHandler)
}