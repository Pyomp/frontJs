import { isMobile } from "../../../modules/dom/browserInfo.js"
import { PI } from "../../../modules/math/MathUtils.js"
import { inputsAction } from "../../views/slots.js"
import { inputsControls } from "../inputs/inputsControls.js"
import { initInputsMove } from "../inputs/inputsMove.js"
import { context3D } from "../context3D.js"
import { loopRaf } from "../../../modules/globals/loopRaf.js"
import { websocketGame } from "../websocketGame.js"
import { frameHandlerActionsCooldown } from "./handlerActionsCooldown.js"
import { frameHandlerEntity } from "./handlerEntity.js"
import { frameHandlerZone0 } from "./zones/handlerZone0.js"

let nextControlsUpdate = 0

function init() {
    const dispatcher = {
        [1]: (view, cursor) => frameHandlerEntity(view, cursor, 1),
    }

    const inputsMove = initInputsMove()

    let lastDataViewUpdate
    let lastBinaryActions = 0

    const bufferControls = new ArrayBuffer(2 + 4 * 4)
    const viewControls = new DataView(bufferControls)
    viewControls.setUint16(0, 1, true)

    websocketGame.binaryDispatcher[2] = frameHandlerZone0
    websocketGame.binaryDispatcher[3] = frameHandlerActionsCooldown

    const update = () => {
        if (websocketGame.lastGameFrameUpdate !== lastDataViewUpdate) {
            lastDataViewUpdate = websocketGame.lastGameFrameUpdate

            const view = websocketGame.gameFrameView
            const totalLength = view.byteOffset + view.byteLength

            let cursor = view.byteOffset + 1
            while (cursor < totalLength) {
                const family = view.getUint16(cursor, true)
                cursor += 2
                if (dispatcher[family]) {
                    cursor = dispatcher[family](view, cursor)
                } else {
                    console.warn(`frame corrupted`)
                    return
                }
            }

            websocketFramesGame.lastUpdate = loopRaf.perfNowSecond
        }

        const actions = inputsAction.binaryActions | inputsControls.binaryActions

        // controls sender
        if (nextControlsUpdate < loopRaf.perfNowMs || lastBinaryActions !== actions) {
            nextControlsUpdate = loopRaf.perfNowMs + 25

            inputsMove.update()

            viewControls.setFloat32(2, inputsMove.x, true)
            viewControls.setFloat32(6, inputsMove.y, true)
            if (isMobile) {
                viewControls.setFloat32(10, inputsMove.theta, true)
            } else {
                viewControls.setFloat32(10, context3D.controls.spherical.theta + PI, true)
            }
            lastBinaryActions = actions

            viewControls.setUint32(14, actions, true)

            websocketGame.sendBuffer(bufferControls)
        }
    }

    loopRaf.beforeRenderListeners.add(update)
}

export const websocketFramesGame = {
    init,
    lastUpdate: 0,
}
