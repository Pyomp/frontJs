import { CMD_MOTION } from '../constant/websocketCommand.js'

export class MoveFrame {
    buffer = new ArrayBuffer(14)
    ui8a = new Uint8Array(this.buffer)
    #dataView = new DataView(this.buffer)

    get x() { return this.#dataView.getFloat32(2) }
    set x(value) { this.#dataView.setFloat32(2, value) }

    get y() { return this.#dataView.getFloat32(6) }
    set y(value) { this.#dataView.setFloat32(6, value) }

    get theta() { return this.#dataView.getFloat32(10) }
    set theta(value) { this.#dataView.setFloat32(10, value) }

    constructor() {
        this.#dataView.setUint16(0, CMD_MOTION)
    }
}

