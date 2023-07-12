import { SkillLoader } from "../models/views/SkillLoader.js"
import { loopRaf } from "../../modules/globals/loopRaf.js"

const Colors = ['hsl(120, 100%, 60%)', 'hsl(30, 100%, 60%)', 'hsl(0, 100%, 60%)']

const view = new SkillLoader()
view.element.style.display = 'none'

let _time = 0
let _speed = 1

function update(dt_s) {
    if (lastSetTime + 100 > loopRaf.perfNowMs) {
        if (_time < 3) {
            _time += dt_s * _speed

            view.setColor(Colors[Math.floor(_time)] || Colors[2])
            view.setValue(_time > 3 ? 1 : _time % 1)
        }
    } else {
        view.element.style.display = 'none'
        loopRaf.beforeRenderListeners.delete(update)
    }
}

let lastSetTime = 0

/**
 * time: [0, 3[ stand for 3 level (green -> orange -> red)
 * If time is not changed within 100ms, element will disappear
*/
export const skillLoader = {
    set speed(s) { _speed = s },
    set time(t_s) {
        lastSetTime = loopRaf.perfNowMs
        view.element.style.display = 'inline'
        _time = t_s
        loopRaf.beforeRenderListeners.add(update)
    },
}
