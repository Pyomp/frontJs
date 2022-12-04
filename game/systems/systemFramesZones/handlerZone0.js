import { managerZones } from "../../zones/managerZones.js"

/**
 * @param {DataView} view 
 * @param {Number} offset
 */
export function frameHandlerZone0(view, offset) {
  let cursor = offset
  
  managerZones.updateZone(2)

  return cursor
}