import { inputsAction } from "../inputs/inputsActions.js"
import { inputControls } from "../inputs/inputsControls.js"
import { initInputsMove } from "../inputs/inputsMove.js"
import { serviceLoop } from "../services/serviceLoop.js"
import { serviceWebsocket } from "../services/serviceWebsocket.js"
import { frameHandlerActionsCooldown } from "./handlerActionsCooldown.js"
import { frameHandlerBlader, initSystemBlader } from "./systemFramesEntities/handlerBlader.js"
import { frameHandlerZone0 } from "./systemFramesZones/handlerZone0.js"

let nextControlsUpdate = 0

export function initSystemFrames() {
    const dispatcher = { [1]: frameHandlerBlader, [2]: frameHandlerZone0, [3]: frameHandlerActionsCooldown }
    initSystemBlader()

    const inputsMove = initInputsMove()

    let lastDataViewUpdate
    let lastBinaryActions = 0

    const bufferControls = new ArrayBuffer(2 + 4 * 3)
    const viewControls = new DataView(bufferControls)
    viewControls.setUint16(0, 1, true)

    serviceWebsocket.binaryDispatcher[2] = frameHandlerZone0
    serviceWebsocket.binaryDispatcher[3] = frameHandlerActionsCooldown

    const update = () => {
        if (serviceWebsocket.lastDataViewUpdate !== lastDataViewUpdate) {
            lastDataViewUpdate = serviceWebsocket.lastDataViewUpdate

            const view = serviceWebsocket.view
            const totalLength = view.byteOffset + view.byteLength

            let cursor = view.byteOffset + 1
            while (cursor < totalLength) {
                const family = view.getUint16(cursor, true)
                cursor += 2
                if (dispatcher[family]) {
                    cursor = dispatcher[family](view, cursor)
                } else {
                    console.warn(`frame corrupted: ${new Uint8Array(serviceWebsocket.view)}`)
                    return
                }
            }
        }

        const actions = inputsAction.binaryActions | inputControls.binaryActions

        if (nextControlsUpdate < serviceLoop.perfNowMs || lastBinaryActions !== actions) {
            nextControlsUpdate = serviceLoop.perfNowMs + 25

            inputsMove.update()

            viewControls.setFloat32(2, inputsMove.x, true)
            viewControls.setFloat32(6, inputsMove.y, true)

            lastBinaryActions = actions

            viewControls.setUint32(10, actions, true)

            serviceWebsocket.sendBuffer(bufferControls)
        }
    }

    serviceLoop.addUpdate(update)
}