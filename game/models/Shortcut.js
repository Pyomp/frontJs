import { EventSet } from "../../modules/utils/EventSet.js"

export class Shortcut {
    #button = -1

    #code = ""

    #ctrlKey = false
    #altKey = false
    #metaKey = false
    #shiftKey = false

    onChange = new EventSet()

    #action
    get action() { return this.#action }

    /**
     * 
     * @param {{
     * action?: number,
     * code?: string,
     * button?: number,
     * altKey?: boolean,
     * ctrlKey?: boolean,
     * metaKey?: boolean,
     * shiftKey?: boolean
     * }} param0 
     */
    constructor({
        action = -1,
        code = undefined,
        button = undefined,
        altKey = false,
        ctrlKey = false,
        metaKey = false,
        shiftKey = false
    }) {
        this.#action = action
        this.set({ code, button, altKey, ctrlKey, metaKey, shiftKey })
    }

    match(event) {
        if (
            this.#altKey === event.altKey
            && this.#ctrlKey === event.ctrlKey
            && this.#metaKey === event.metaKey
            && this.#shiftKey === event.shiftKey
        ) {
            if (event.code === this.#code) return true
            if (event.button === this.#button) return true
            if (event.codes?.has && event.codes.has(this.#code)) return true
            if (event.buttons?.has && event.buttons.has(this.#button)) return true
        }
        return false
    }

    toString() {
        const controls =
            (this.#altKey ? 1 << 3 : 0)
            + (this.#ctrlKey ? 1 << 2 : 0)
            + (this.#metaKey ? 1 << 1 : 0)
            + (this.#shiftKey ? 1 : 0)

        if (this.#button !== -1)
            return "" + (controls + (1 << 4)) + this.#button
        else
            return controls + this.#code
    }

    fromString(keycode) {
        if (keycode.length < 2) return

        const controls = parseInt(keycode[0], 10)

        if (controls < 0 || Number.isNaN(controls)) return

        const altKey = (controls & (1 << 3)) !== 0
        const ctrlKey = (controls & (1 << 2)) !== 0
        const metaKey = (controls & (1 << 1)) !== 0
        const shiftKey = (controls & 1) !== 0
        if (controls & (1 << 4)) {
            this.set({
                button: parseInt(keycode[1], 10),
                altKey,
                ctrlKey,
                metaKey,
                shiftKey
            })
        } else {
            this.set({
                code: keycode.slice(1),
                altKey,
                ctrlKey,
                metaKey,
                shiftKey
            })
        }
    }

    set({
        code = undefined,
        button = undefined,
        altKey = false,
        ctrlKey = false,
        metaKey = false,
        shiftKey = false
    }) {
        if (code) {
            this.#button = -1
            this.#code = code
        } else {
            if (Number.isInteger(button) && button > -1 && button < 100) {
                this.#button = button
                this.#code = ''
            } else {
                this.#button = -1
                this.#code = ''
                this.#altKey = false
                this.#ctrlKey = false
                this.#metaKey = false
                this.#shiftKey = false
                this.onChange.emit()
                return
            }
        }

        this.#altKey = altKey
        this.#ctrlKey = ctrlKey
        this.#metaKey = metaKey
        this.#shiftKey = shiftKey

        this.onChange.emit()
    }
}