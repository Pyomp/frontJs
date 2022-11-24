
import { inputsMove } from "../../services/inputs/inputsMove.js" 
import { serviceLoop } from "../../services/serviceLoop.js" 
import { serviceWebsocket } from "../../services/serviceWebsocket.js" 

export function initSystemFramesControls() {
    const buffer = new ArrayBuffer(4 * 4)
    const view = new DataView(buffer)

    let nextUpdate = 0

    const update = () => {
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