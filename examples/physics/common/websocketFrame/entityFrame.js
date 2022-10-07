import { CMD_ENTITY } from '../constant/websocketCommand.js'

const CMD_OFFSET = 2
let i = 0
const TYPE_OFFSET = i
const ID_OFFSET = TYPE_OFFSET + 2
const POSITION_X_OFFSET = ID_OFFSET + 8
const POSITION_Y_OFFSET = POSITION_X_OFFSET + 4
const POSITION_Z_OFFSET = POSITION_Y_OFFSET + 4
const VELOCITY_X_OFFSET = POSITION_Z_OFFSET + 4
const VELOCITY_Y_OFFSET = VELOCITY_X_OFFSET + 4
const VELOCITY_Z_OFFSET = VELOCITY_Y_OFFSET + 4
const ANIMATION_OFFSET = VELOCITY_Z_OFFSET + 4
const ANIMATION_TIME_OFFSET = ANIMATION_OFFSET + 2
const THETA_OFFSET = ANIMATION_TIME_OFFSET + 4
const LENGTH = THETA_OFFSET + 4

export class EntityFrame {
    buffer = new ArrayBuffer(1024)
    ui8a = new Uint8Array(this.buffer)
    #dataView = new DataView(this.buffer)

    #offset = 2
    get offset() { return this.#offset }
    set offset(value) { this.#offset = CMD_OFFSET + value * LENGTH }

    get type() { return this.#dataView.getUint16(this.#offset + TYPE_OFFSET) }
    set type(value) { return this.#dataView.setUint16(this.#offset + TYPE_OFFSET, value) }

    get id() { return this.#dataView.getUint32(this.#offset + ID_OFFSET) }
    set id(value) { return this.#dataView.setUint32(this.#offset + ID_OFFSET, value) }

    get positionX() { return this.#dataView.getFloat32(this.#offset + POSITION_X_OFFSET) }
    set positionX(value) { this.#dataView.setFloat32(this.#offset + POSITION_X_OFFSET, value) }

    get positionY() { return this.#dataView.getFloat32(this.#offset + POSITION_Y_OFFSET) }
    set positionY(a) { this.#dataView.setFloat32(this.#offset + POSITION_Y_OFFSET, a) }

    get positionZ() { return this.#dataView.getFloat32(this.#offset + POSITION_Z_OFFSET) }
    set positionZ(a) { this.#dataView.setFloat32(this.#offset + POSITION_Z_OFFSET, a) }

    get velocityX() { return this.#dataView.getFloat32(this.#offset + VELOCITY_X_OFFSET) }
    set velocityX(a) { this.#dataView.setFloat32(this.#offset + VELOCITY_X_OFFSET, a) }

    get velocityY() { return this.#dataView.getFloat32(this.#offset + VELOCITY_Y_OFFSET) }
    set velocityY(a) { this.#dataView.setFloat32(this.#offset + VELOCITY_Y_OFFSET, a) }

    get velocityZ() { return this.#dataView.getFloat32(this.#offset + VELOCITY_Z_OFFSET) }
    set velocityZ(a) { this.#dataView.setFloat32(this.#offset + VELOCITY_Z_OFFSET, a) }

    get animation() { return this.#dataView.getUint16(this.#offset + ANIMATION_OFFSET) }
    set animation(value) { this.#dataView.setUint16(this.#offset + ANIMATION_OFFSET, value) }

    get animationTime() { return this.#dataView.getFloat32(this.#offset + ANIMATION_TIME_OFFSET) }
    set animationTime(value) { this.#dataView.setFloat32(this.#offset + ANIMATION_TIME_OFFSET, value) }

    get theta() { return this.#dataView.getFloat32(this.#offset + THETA_OFFSET) }
    set theta(value) { this.#dataView.setFloat32(this.#offset + THETA_OFFSET, value) }

    constructor() {
        this.#dataView.setUint16(0, CMD_ENTITY)
    }
}








