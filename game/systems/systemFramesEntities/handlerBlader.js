import { serviceLoop } from "../../../services/serviceLoop.js"
import { Blader3D } from "../../entities/blader/Blader3D.js"


const instances = {}

/**
 * @param {DataView} view 
 * @param {Number} offset 
 * @param {Number} length 
 */
export const handlerBlader = (view, offset, length) => {
    let cursor = offset
    const family = view.getUint16(cursor, true)
    cursor += 2
    const id = view.getBigUint64(cursor, true)
    cursor += 8

  /** @type {Blader3D} */  let instance
    if (!instances[family]) {
        instance = new Blader3D()
        instances[family] = { [id]: instance }
    } else if (!instances[family][id]) {
        instance = new Blader3D()
        instances[family][id] = instance
    } else { instance = instances[family][id] }

    const position = instance.position
    position.x = view.getFloat32(cursor, true)
    cursor += 4
    position.y = view.getFloat32(cursor, true)
    cursor += 4
    position.z = view.getFloat32(cursor, true)
    cursor += 4

    const velocity = instance.velocity
    velocity.x = view.getFloat32(cursor, true)
    cursor += 4
    velocity.y = view.getFloat32(cursor, true)
    cursor += 4
    velocity.z = view.getFloat32(cursor, true)
    cursor += 4

    instance.rotation = view.getFloat32(cursor, true)
    cursor += 4

    instance.animationTime = view.getFloat32(cursor, true)
    cursor += 4

    instance.animation = view.getUint16(cursor, true)
    cursor += 2

    instance.lastUpdateSecond = serviceLoop.perfNowSecond
    instance.newUpdate = true
}