import { MoveKeyboard } from '../../../gameEngine/physics/MoveKeyboard.js'
import { ThirdControls } from '../../../webGlEngine/utils/ThirdControls.js'

import { MoveFrame } from '../common/websocketFrame/motionFrame.js'

import { appData, inputManagerComputer, loop, reconciliationMotion, renderer, ws } from './global.js'
import { initCustomizationManager } from './managers/customizationManager.js'
import { initSkillManager } from './managers/skillsManager.js'

export function initPlayer() {
    const thirdControls = new ThirdControls(renderer.camera, renderer.canvas, renderer.onBeforeRender)

    const moveKeyboard = new MoveKeyboard(inputManagerComputer, appData.keycode, loop.updatesPhysics, thirdControls)

    // update zqsd move event to api
    const moveFrame = new MoveFrame()
    loop.updatesPhysics.add(() => {
        moveFrame.x = moveKeyboard.x
        moveFrame.y = moveKeyboard.y
        moveFrame.theta = moveKeyboard.theta
        ws.sendRaw(moveFrame.ui8a)
    })

    initCustomizationManager(thirdControls)
    initSkillManager()
}