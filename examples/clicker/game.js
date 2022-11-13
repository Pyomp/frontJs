import { loop } from "../../services/loop.js"
import { Tap } from "./entities/Tap.js"
import { ws } from "./services/ws.js"

export function initGame() {
    document.addEventListener('pointerdown', (event) => {
        ws.send(1, { x: event.clientX, y: event.clientY })
    })

    const entities = {}
    setInterval(() => {
        const limitTime = loop.dateNowSecond - 0.1
        for (const [id, obj] of Object.entries(entities)) {
            if (obj.lastUpdate < limitTime) {
                obj.dispose()
                delete entities[id]
            }
        }
    }, 50)

    loop.addUpdate(() => {
        let cursor = ws.data.byteOffset
        const bufferLength = ws.data.buffer.byteLength

        while (cursor < bufferLength) {
            const family = ws.data.getUint16(cursor, true)
            cursor += 2
            const state = ws.data.getUint8(cursor, true)
            cursor += 2
            const id = ws.data.getUint32(cursor, true)
            cursor += 4
            const x = ws.data.getFloat32(cursor, true)
            cursor += 4
            const y = ws.data.getFloat32(cursor, true)
            cursor += 4
            const time = ws.data.getFloat32(cursor, true)
            cursor += 4

            if (!entities[id]) {
                entities[id] = new Tap()
            }

            const entity = entities[id]
            entity.lastUpdate = loop.dateNowSecond
            entity.x = x
            entity.y = y
            entity.time = time
        }
    })
}