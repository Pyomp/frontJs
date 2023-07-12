import { managerZones } from "../../../zones/managerZones.js" 

/**
 * @param {DataView} view 
 * @param {Number} offset
 */
export function frameHandlerZone0(view, offset) {
  let cursor = offset
  const zoneId = view.getUint16(cursor, true)
  cursor += 2
  managerZones.updateZone(zoneId)
  return cursor
}