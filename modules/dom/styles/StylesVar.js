import { queueMicrotaskOnce } from '../eventLoopOnce.js'

/** 
 * @template {Object} T 
 */
export class StylesVar {
    /** @type {T} */ #varKeys = {}
    get varKeys() { return this.#varKeys }

    #styleElement = document.createElement('style')

    /** @param {T} object */
    constructor(object) {
        for (const key in object) {
            this.#varKeys[key] = `var(${key})`
        }

        this.varsValues = new Proxy(structuredClone(object), {
            set: (target, p, value, receiver) => {
                target[p] = value
                queueMicrotaskOnce.add(this.#updateElementBound)
                return true
            }
        })

        document.head.appendChild(this.#styleElement)
        this.#updateElement()
    }

    updateStyleVar(newEntries) {
        for (const key in newEntries) {
            this.varsValues[key] = newEntries[key]
        }
    }

    #updateElementBound = this.#updateElement.bind(this)
    #updateElement() {
        let str = ':root{\n'
        for (const key in this.varsValues) {
            this.varsValues[key]
            str += `${key}: ${this.varsValues[key]};\n`
        }
        str += '}'

        this.#styleElement.innerHTML = ''
        this.#styleElement.textContent = str
    }
}



