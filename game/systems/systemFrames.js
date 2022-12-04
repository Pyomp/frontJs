
import { initInputsMove } from "../services/inputs/inputsMove.js"
import { serviceLoop } from "../services/serviceLoop.js"
import { serviceWebsocket } from "../services/serviceWebsocket.js"
import { frameHandlerBlader, initSystemBlader } from "./systemFramesEntities/handlerBlader.js"
import { frameHandlerZone0 } from "./systemFramesZones/handlerZone0.js"

let nextControlsUpdate = 0

export function initSystemFrames() {
    const dispatcher = { [1]: frameHandlerBlader, [2]: frameHandlerZone0 }
    initSystemBlader()

    const inputsMove = initInputsMove()

    let lastDataViewUpdate

    const bufferControls = new ArrayBuffer(2 + 4 * 2)
    const viewControls = new DataView(bufferControls)
    viewControls.setUint16(0, 1, true)

    const update = () => {
        if (serviceWebsocket.lastDataViewUpdate !== lastDataViewUpdate) {
            lastDataViewUpdate = serviceWebsocket.lastDataViewUpdate

            const view = serviceWebsocket.dataView
            const totalLength = view.byteOffset + view.byteLength
            let cursor = view.byteOffset
            while (cursor < totalLength) {
                const family = view.getUint16(cursor, true)
                cursor += 2
                if (dispatcher[family]) {
                    cursor = dispatcher[family](view, cursor)
                } else {
                    console.warn(`frame corrupted: ${new Uint8Array(serviceWebsocket.dataView)}`)
                    return
                }
            }
        }

        if (nextControlsUpdate < serviceLoop.perfNowMs) {
            nextControlsUpdate = serviceLoop.perfNowMs + 20

            inputsMove.update()

            viewControls.setFloat32(2, inputsMove.x, true)
            viewControls.setFloat32(6, inputsMove.y, true)

            serviceWebsocket.sendBuffer(bufferControls)
        }
    }

    serviceLoop.addUpdate(update)
}