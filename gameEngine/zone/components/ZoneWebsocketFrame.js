

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
const ROTATION_OFFSET = ANIMATION_TIME_OFFSET + 4

const LENGTH = ROTATION_OFFSET + 4

export class ZoneWebsocketFrame {

    #buffer = new ArrayBuffer(1024)
    #dataView = new DataView(this.#buffer)

    #objectsOffset = new Map()
    #clients = new Set()

    onObjectAdd(object) {
        let i = 0
        const values = [...this.#objectsOffset.values()]
        while (values.includes(i)) i++
        this.#objectsOffset.set(object, i)
        const offset = i * LENGTH
        this.#dataView.setUint16(offset + TYPE_OFFSET, object.prototype.type)
        this.#dataView.setBigUint64(offset + ID_OFFSET, object.id)
        if (object.send) this.#clients.add(object)
    }

    onObjectRemove(object) {
        
        const offset = this.objectsOffset[object] * LENGTH
        this.#dataView.setUint16(offset + TYPE_OFFSET, 0)
        this.#objectsOffset.delete(object)
        this.#clients.delete(object)
    }

    updateObjectFrame(object) {
        const offset = this.objectsOffset[object] * LENGTH
        this.#dataView.setFloat32(offset + POSITION_X_OFFSET, object.position.x)
        this.#dataView.setFloat32(offset + POSITION_Y_OFFSET, object.position.y)
        this.#dataView.setFloat32(offset + POSITION_Z_OFFSET, object.position.z)
        this.#dataView.setFloat32(offset + VELOCITY_X_OFFSET, object.velocity.x)
        this.#dataView.setFloat32(offset + VELOCITY_Y_OFFSET, object.velocity.y)
        this.#dataView.setFloat32(offset + VELOCITY_Z_OFFSET, object.velocity.z)
        this.#dataView.setUint16(offset + ANIMATION_OFFSET, object.animation)
        this.#dataView.setFloat32(offset + ANIMATION_TIME_OFFSET, object.animationTime)
        this.#dataView.setFloat32(offset + ROTATION_OFFSET, object.rotation)
    }

    send() {
        for (const client of this.#clients) {
            client.send(this.#buffer)
        }
    }

}