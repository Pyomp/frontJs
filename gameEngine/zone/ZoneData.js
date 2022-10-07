import { ZoneWebsocketFrame } from './components/ZoneWebsocketFrame.js'

export class ZoneData {
    terrains = new Set()
    objects3DStatic = new Set()
    #entities = new Set()

    zoneWebsocketFrame = new ZoneWebsocketFrame()

    add(entity) {
        this.#entities.add(entity)
        this.zoneWebsocketFrame.onObjectAdd(entity)
    }

    delete(entity) {
        if (this.#entities.delete(entity)) {
            this.zoneWebsocketFrame.onObjectRemove(entity)
        }
    }

    has(entity) {
        return this.#entities.has(entity)
    }

}