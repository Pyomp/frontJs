import { ACTION_JUMP } from '../../../AppData/actions.js'
import { CMD_ACTION } from '../../common/constant/websocketCommand.js'
import { inputManagerComputer, ws } from '../global.js'

export function initSkillManager() {
    const ui8a = new Uint8Array(6)
    const dataView = new DataView(ui8a.buffer)
    dataView.setUint16(0, CMD_ACTION)

    if (inputManagerComputer) {
        inputManagerComputer.actionsDown[ACTION_JUMP] = () => {
            dataView.setUint32(2, ACTION_JUMP)
            ws.sendRaw(ui8a)
        }
    }
}