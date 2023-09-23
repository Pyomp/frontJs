import { context3D } from "../globals/context3D.js"
import { Zone0 } from "./zone0/zone0.js"

let currentId = -1
let zoneEntity

const zoneDictionary = {
    [2]: Zone0
}

let _isChangingScene = false

async function updateZone(id) {
    if (_isChangingScene) return

    if (currentId !== id) {
        _isChangingScene = true
        managerZones.isReady = false
        managerZones.node3D = undefined
        zoneEntity?.dispose()
        zoneDictionary[currentId]?.free()

        currentId = id

        await zoneDictionary[currentId].init()
        const zone = new zoneDictionary[currentId]()
        context3D.controls.groundGeometries = zone.groundGeometries
        managerZones.isReady = true
        managerZones.node3D = zone.node3D
    }

    _isChangingScene = false
}

export const managerZones = {
    fromFrame(view, offset) {
        let cursor = offset
        const zoneId = view.getUint16(cursor, true)
        cursor += 2

        updateZone(zoneId)

        return cursor
    },
    node3D: undefined,
    isReady: false
}
