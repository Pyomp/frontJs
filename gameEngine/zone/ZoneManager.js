import { ZoneData } from './ZoneData.js'

export class ZoneSystem {

    #zones = {}
    #zoneHeight
    #zoneWidth

    /** @type {[ZoneData]} */
    #zonesArray = []

    constructor({
        minX = -100,
        minY = -100,
        maxX = 100,
        maxY = 100,
        zoneHeight = 10,
        zoneWidth = 10,
    } = {}) {
        this.#zoneHeight = zoneHeight
        this.#zoneWidth = zoneWidth

        const width = maxX - minX
        const widthSample = Math.ceil(width / zoneWidth) + 1

        const height = maxY - minY
        const heightSample = Math.ceil(height / zoneHeight) + 1

        for (let i = 0; i < widthSample; i++) {
            const wId = Math.floor(minX + zoneWidth * i)
            this.#zones[wId] = {}
            for (let j = 0; j < heightSample; j++) {
                const hId = Math.floor(minY + zoneHeight * j)
                const zone = new ZoneData()
                this.#zones[wId][hId] = zone
                this.#zonesArray.push(zone)
            }
        }
    }

    #timeouts = {}
    addObject(entity, needsRefresh = true) {
        const position = entity.position
        const x = Math.floor(position.x / this.#zoneWidth)
        const y = Math.floor(position.z / this.#zoneHeight)

        this.#zones[x - 1][y - 1].onObjectAdd(entity)
        this.#zones[x - 1][y].onObjectAdd(entity)
        this.#zones[x - 1][y + 1].onObjectAdd(entity)

        this.#zones[x][y - 1].onObjectAdd(entity)
        this.#zones[x][y].onObjectAdd(entity)
        this.#zones[x][y + 1].onObjectAdd(entity)

        this.#zones[x + 1][y - 1].onObjectAdd(entity)
        this.#zones[x + 1][y].onObjectAdd(entity)
        this.#zones[x + 1][y + 1].onObjectAdd(entity)

        this.#set.add(position)

        clearTimeout(this.#timeouts[entity])
        this.#timeouts[entity] = setTimeout(() => { this.updateZone(entity) })

        return this.#zones[x][y]
    }

    removeObject(entity) {
        clearTimeout(this.#timeouts[entity])
        for (const zone of this.#zonesArray) {
            zone.delete(entity)
        }
    }

    updateZone(entity) {
        this.removeObject(entity)
        this.addObject(entity)
    }

}