import { PI, PI025, PI05, PI075 } from '../math/MathUtils.js'

export class MoveKeyboard {

    #controls
    #keycodeState
    #keyCodeAppData

    isRunning = false

    theta = 0
    radius = 0
    x = 0
    y = 0

    /**
     * @param { InputManagerComputer } inputManagerComputer
     * @param {{
     *      up: [KeyCode: string]
     *      right: [KeyCode: string]
     *      down: [KeyCode: string]
     *      left: [KeyCode: string]
     * }} keyCodeAppData see '/examples/keycode/AppData/models/KeyCodeAppData.js'
     * @param {Set} updates 
     * @param {{ theta }} controls 
     */
    constructor(
        inputManagerComputer,
        keyCodeAppData,
        updates,
        controls,
    ) {
        this.#keycodeState = inputManagerComputer.keycodeState
        this.#controls = controls
        this.#keyCodeAppData = keyCodeAppData

        const update = this.#update.bind(this)
        updates.add(update)
        this.dispose = () => { updates.delete(update) }
    }

    #update() {
        let theta = this.#controls.theta
        this.isRunning = false
        if (document.activeElement.tagName !== 'INPUT') {
            if (this.#keycodeState[this.#keyCodeAppData.up] === true) {
                if (this.#keycodeState[this.#keyCodeAppData.left] === true) theta -= PI075
                else if (this.#keycodeState[this.#keyCodeAppData.right] === true) theta += PI075
                else theta -= PI

                this.isRunning = true
            } else if (this.#keycodeState[this.#keyCodeAppData.down] === true) {
                if (this.#keycodeState[this.#keyCodeAppData.left] === true) theta -= PI025
                else if (this.#keycodeState[this.#keyCodeAppData.right] === true) theta += PI025
                this.isRunning = true
            } else {
                if (this.#keycodeState[this.#keyCodeAppData.left] === true) {
                    theta -= PI05
                    this.isRunning = true
                } else if (this.#keycodeState[this.#keyCodeAppData.right] === true) {
                    theta += PI05
                    this.isRunning = true
                }
            }
        }

        if (this.isRunning) {
            this.x = Math.sin(theta)
            this.y = Math.cos(theta)
            this.theta = theta
        } else {
            this.x = 0
            this.y = 0
        }
    }
}










