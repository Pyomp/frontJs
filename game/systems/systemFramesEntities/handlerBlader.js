import { serviceLoop } from "../../services/serviceLoop.js"
import { Blader3D } from "../../entities/blader/Blader3D.js"
import { storeSettings } from "../../store/storeSettings.js"
import { service3D } from "../../services/service3D.js"

const instances = {}

export function initSystemBlader() {
  storeSettings.onId.add(() => {
    if (instances[storeSettings.id]) { service3D.controls.target = instances[storeSettings.id].node3dPosition }
  })
}

/**
 * @param {DataView} view 
 * @param {Number} offset
 */
export function frameHandlerBlader(view, offset) {
  let cursor = offset
  const id = view.getBigUint64(cursor, true)
  cursor += 8

  const instance = Blader3D.instances[id] || new Blader3D(id)
  if (id === storeSettings.id) service3D.controls.target = instance.node3dPosition

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