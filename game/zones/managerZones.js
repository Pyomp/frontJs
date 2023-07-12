import { context3D } from "../globals/context3D.js"
import { Zone0 } from "./zone0/zone0.js"

let currentId = -1
let zoneEntity

const zoneDictionary = {
    [2]: Zone0
}

let isChangingScene = false
let currentZone
export const managerZones = {
    async updateZone(id) {
        if (isChangingScene) return

        if (currentId !== id) {
            isChangingScene = true
            this.node3D = undefined
            zoneEntity?.dispose()
            zoneDictionary[currentId]?.destroy()

            currentId = id

            await zoneDictionary[currentId].init()
            const zone = new zoneDictionary[currentId]()
            context3D.controls.groundGeometries = zone.groundGeometries
            this.node3D = zone.node3D
        }

        isChangingScene = false
    },

    node3D: undefined
}
