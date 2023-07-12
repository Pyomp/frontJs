import { inputsAction } from "../../views/slots.js"

/**
 * @param {DataView} view 
 * @param {Number} offset
 */
export function frameHandlerActionsCooldown(view, offset) {
    let cursor = offset
    const length = view.getUint16(cursor, true)
    cursor += 2

    const limit = length + cursor

    while (cursor < limit) {
        const action = view.getUint8(cursor)
        cursor += 1
        const cooldown = view.getFloat32(cursor, true)
        cursor += 4
        const maxCooldown = view.getFloat32(cursor, true)
        cursor += 4
        inputsAction.setCooldown(action, cooldown, maxCooldown)
    }

    return cursor
}
