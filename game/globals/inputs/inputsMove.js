import { isMobile } from '../../../modules/dom/browserInfo.js'
import { PI, PI025, PI05, PI075 } from '../../../modules/math/MathUtils.js'
import {
    ACTION_DOWN,
    ACTION_LEFT,
    ACTION_RIGHT,
    ACTION_UP
} from '../../constants/constantsActions.js'
import { context3D } from '../../globals/context3D.js'
import { initInputsPad } from './inputsPad/inputsPad.js'
import { inputsControls } from './inputsControls.js'

function initInputsKeyMove() {
    let x = 0
    let y = 0
    let theta = 0
    let length = 0

    const keycodeState = inputsControls.actionsOnGoing

    function update() {
        let newTheta = context3D.controls.spherical.theta
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
        get x() { return x },
        get y() { return y },
        get theta() { return theta }
    }
}

export function initInputsMove() { return isMobile ? initInputsPad() : initInputsKeyMove() }
