import { isMobile } from '../../dom/browserInfo.js'
import {
    ACTION_DOWN,
    ACTION_LEFT,
    ACTION_RIGHT,
    ACTION_UP
} from '../../store/storeKeyCode.js'
import { service3D } from '../service3D.js'
import { initInputsPad } from './inputsPad/inputsPad.js'
import { serviceControls } from './serviceControls.js'

function initInputsKeyMove() {
    let x = 0
    let y = 0
    let theta = 0
    let length = 0

    const keycodeState = serviceControls.ac

    function update() {
        let newTheta = service3D.orbitControls.spherical.theta
        length = 0

        if (keycodeState[ACTION_UP] === true) {
            if (keycodeState[ACTION_LEFT] === true) newTheta -= PI075
            else if (keycodeState[ACTION_RIGHT] === true) newTheta += PI075
            else newTheta -= PI
            length = 1
        } else if (keycodeState[ACTION_DOWN] === true) {
            if (keycodeState[ACTION_LEFT] === true) newTheta -= PI025
            else if (keycodeState[ACTION_RIGHT] === true) newTheta += PI025
            length = 1
        } else {
            if (keycodeState[ACTION_LEFT] === true) {
                newTheta -= PI05
                length = 1
            } else if (keycodeState[ACTION_RIGHT] === true) {
                newTheta += PI05
                length = 1
            }
        }

        if (length) {
            x = Math.sin(newTheta)
            y = Math.cos(newTheta)
            theta = newTheta
        } else {
            x = 0
            y = 0
        }
    }
    return {
        update,
        get length() { return length },
        get theta() { return theta },
        get x() { return x },
        get y() { return y }
    }
}

function init() {
    delete inputsMove.init
    Object.assign(inputsMove, isMobile ? initInputsPad() : initInputsKeyMove())
}

export const inputsMove = {
    init,
    update: () => { },
    get length() { return 0 },
    get theta() { return 0 },
    get x() { return 0 },
    get y() { return 0 }
}

