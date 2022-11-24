
import { serviceLoop } from "../../../services/serviceLoop.js"
import { serviceWebsocket } from "../../../services/serviceWebsocket.js"



export function initSystemFramesEntities() {


    const dispatcher = { [1]: blader }

    let lastDataViewUpdate
    const update = () => {
        if (serviceWebsocket.lastDataViewUpdate === lastDataViewUpdate) return
        lastDataViewUpdate = serviceWebsocket.lastDataViewUpdate

        const view = serviceWebsocket.dataView
        const buffer = view.buffer
        const totalLength = view.byteOffset + view.byteLength
        let cursor = view.byteOffset

        while (cursor < totalLength) {
            const type = view.getUint16(cursor, true)
            cursor += 2
            const length = view.getUint16(cursor, true)
            cursor += 2
            if (dispatcher[type]) dispatcher[type](view, cursor, length)
            cursor += length
        }

        if (nextUpdate > serviceLoop.perfNowMs) return
        nextUpdate = serviceLoop.perfNowMs + 50

        inputsMove.update()

        view.setFloat32(0, inputsMove.x, true)
        view.setFloat32(4, inputsMove.y, true)
        view.setFloat32(8, inputsMove.theta, true)
        view.setFloat32(12, inputsMove.length, true)

        serviceWebsocket.sendBuffer(buffer)
    }

    serviceLoop.addUpdate(update)
}