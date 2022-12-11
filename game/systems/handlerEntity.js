import { Entity3D } from "../entities/Entity3D.js"
import { service3D } from "../services/service3D.js"
import { serviceLoop } from "../services/serviceLoop.js"
import { storeSettings } from "../store/storeSettings.js"

/**
 * @param {DataView} view 
 * @param {Number} offset
 */
export function frameHandlerEntity(view, offset, familyId) {
  let cursor = offset
  const entityId = view.getBigUint64(cursor, true)
  cursor += 8

  const instance = Entity3D.instances[familyId]?.[entityId] || new Entity3D(familyId, entityId)
  if (entityId == storeSettings.id) service3D.controls.target = instance.nodePosition

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

  instance.lastFrameUpdate = serviceLoop.perfNowSecond
  instance.newUpdate = true

  return cursor
}