import { Zone0 } from "./zone0/TerrainNode.js"

let currentId = -1
let zoneEntity

const zoneDictionary = {
    [2]: Zone0
}

let isChangingScene = false

export const managerZones = {
    async updateZone(id) {
        if (isChangingScene) return
        isChangingScene = true

        if (currentId !== id) {
            zoneEntity?.dispose()
            zoneDictionary[currentId]?.destroy()

            currentId = id

            await zoneDictionary[currentId].assets.init()
            new zoneDictionary[currentId]()
        }

        isChangingScene = false
    }
}