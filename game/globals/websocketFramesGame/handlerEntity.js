import { Entity3D } from "../../entities/Entity3D.js"
import { context3D } from "../../globals/context3D.js"
import { loopRaf } from "../../../modules/globals/loopRaf.js"
import { storeSettings } from "../stores/storeSettings.js"

/**
 * @param {DataView} view 
 * @param {Number} offset
 */
export function frameHandlerEntity(view, offset, familyId) {
  let cursor = offset

  const entityId = view.getBigUint64(cursor, true)
  cursor += 8

  // @ts-ignore "bigint cannot be used as index"
  if (!Entity3D.instances[familyId]?.[entityId]) {
    const entity = new Entity3D(familyId, entityId)
    if (entityId == storeSettings.id) {
      entity.isMe = true
      context3D.controls.target = entity.nodePosition
      context3D.controls.enabled = true
    }
  }

  // @ts-ignore "bigint cannot be used as index"
  const instance = Entity3D.instances[familyId]?.[entityId]

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
  instance.animation = view.getUint16(cursor, true)
  cursor += 2
  instance.animationTime = view.getFloat32(cursor, true)
  cursor += 4
  instance.animationSpeed = view.getFloat32(cursor, true)
  cursor += 4
  instance.hp = view.getUint16(cursor, true)
  cursor += 2
  instance.maxHp = view.getUint16(cursor, true)
  cursor += 2

  instance.lastFrameUpdate = loopRaf.perfNowSecond
  instance.newUpdate = true

  return cursor
}
