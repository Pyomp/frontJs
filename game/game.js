import { serviceLoop } from "../services/serviceLoop.js"
import { Blader3D } from "./entities/blader/Blader3D.js" 
import { Tap } from "./entities/Tap.js.js"
import { ws } from "./services/ws.js.js"

export async function initGame() {
    /** asset init */
    await Promise.all([
        Blader3D.init(),
    ])
    document.addEventListener('pointerdown', (event) => {
        ws.send(1, { x: event.clientX / window.innerWidth, y: event.clientY / window.innerHeight })
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
            entity.lastUpdate = serviceLoop.dateNowSecond
            entity.x = x * window.innerWidth
            entity.y = y * window.innerHeight
            entity.time = time
        }
    })
}