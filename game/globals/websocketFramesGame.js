import { isMobile } from "../../modules/dom/browserInfo.js"
import { PI } from "../../modules/math/MathUtils.js"
import { inputsAction } from "../views/slots.js"
import { inputsControls } from "./inputs/inputsControls.js"
import { initInputsMove } from "./inputs/inputsMove.js"
import { context3D } from "./context3D.js"
import { loopRaf } from "../../modules/globals/loopRaf.js"
import { websocketGame } from "./websocketGame.js"
import { entityManager } from "../entities/entityManager.js"
import { managerZones } from "../zones/managerZones.js"

let nextControlsUpdate = 0

function init() {
    const inputsMove = initInputsMove()

    let lastDataViewUpdate
    let lastBinaryActions = 0

    const bufferControls = new ArrayBuffer(2 + 4 * 4)
    const viewControls = new DataView(bufferControls)
    viewControls.setUint16(0, 1, true)

    websocketGame.binaryDispatcher[2] = managerZones.fromFrame
    websocketGame.binaryDispatcher[3] = inputsAction.fromFrame

    const update = () => {
        if (websocketGame.lastGameFrameUpdate !== lastDataViewUpdate && managerZones.isReady) {
            lastDataViewUpdate = websocketGame.lastGameFrameUpdate

            const view = websocketGame.gameFrameView
            const totalLength = view.byteOffset + view.byteLength

            let cursor = view.byteOffset + 1
            while (cursor < totalLength) {
                const familyId = view.getUint16(cursor, true)
                cursor += 2
                cursor += entityManager.updateFrame(familyId, view, cursor)
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
