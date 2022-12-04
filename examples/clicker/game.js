import { serviceLoop } from "../../game/services/serviceLoop.js"
import { Tap } from "./entities/Tap.js"
import { serviceWebsocket } from "../../game/services/serviceWebsocket.js"

export function initGame() {
    document.addEventListener('pointerdown', (event) => {
        serviceWebsocket.send(1, { x: event.clientX / window.innerWidth, y: event.clientY / window.innerHeight })
    })

    const entities = {}
    setInterval(() => {
        const limitTime = serviceLoop.dateNowSecond - 0.1
        for (const [id, obj] of Object.entries(entities)) {
            if (obj.lastUpdate < limitTime) {
                obj.dispose()
                delete entities[id]
            }
        }
    }, 50)

    serviceLoop.addUpdate(() => {
        let cursor = serviceWebsocket.dataView.byteOffset
        const bufferLength = serviceWebsocket.dataView.buffer.byteLength

        while (cursor < bufferLength) {
            const family = serviceWebsocket.dataView.getUint16(cursor, true)
            cursor += 2
            const state = serviceWebsocket.dataView.getUint8(cursor, true)
            cursor += 2
            const id = serviceWebsocket.dataView.getUint32(cursor, true)
            cursor += 4
            const x = serviceWebsocket.dataView.getFloat32(cursor, true)
            cursor += 4
            const y = serviceWebsocket.dataView.getFloat32(cursor, true)
            cursor += 4
            const time = serviceWebsocket.dataView.getFloat32(cursor, true)
            cursor += 4

            if (!entities[id]) {
                entities[id] = new Tap()
            }

            const entity = entities[id]
            entity.lastUpdate = serviceLoop.dateNowSecond
            entity.x = x * window.innerWidth
            entity.y = y * window.innerHeight
            entity.time = time
        }
    })
}