import { updateBit } from "../../modules/utils/Binary.js"
import { Slots6 } from "../models/views/Slots6.js"
import { BERSERKER } from "../constants/classes/berserker.js"
import { loopRaf } from "../../modules/globals/loopRaf.js"
import {
    ACTION_0,
    ACTION_1,
    ACTION_2,
    ACTION_3,
    ACTION_4,
    ACTION_5,
    ACTION_6,
    ACTION_7,
    ACTION_8,
    ACTION_9,
    ACTION_10,
    ACTION_11
} from "../constants/constantsActions.js"

const SIZE = 50

const slots = []
function init() {
    const slots6_1 = new Slots6(SIZE)
    const slots6_2 = new Slots6(SIZE)
    slots6_1.setPosition(5, 7 + SIZE * 2)
    slots6_2.setPosition(5, 5)
    slots.push(...slots6_1.slots, ...slots6_2.slots)

    slots[ACTION_0].setAction(ACTION_0, BERSERKER.SKILLS[ACTION_0].image)
    slots[ACTION_1].setAction(ACTION_1, BERSERKER.SKILLS[ACTION_1].image)
    slots[ACTION_2].setAction(ACTION_2, BERSERKER.SKILLS[ACTION_2].image)
    slots[ACTION_3].setAction(ACTION_3, BERSERKER.SKILLS[ACTION_3].image)
    slots[ACTION_4].setAction(ACTION_4, BERSERKER.SKILLS[ACTION_4].image)
    slots[ACTION_5].setAction(ACTION_5, BERSERKER.SKILLS[ACTION_5].image)
    slots[ACTION_6].setAction(ACTION_6, BERSERKER.SKILLS[ACTION_6].image)
    slots[ACTION_7].setAction(ACTION_7, BERSERKER.SKILLS[ACTION_7].image)
    slots[ACTION_8].setAction(ACTION_8, BERSERKER.SKILLS[ACTION_8].image)
    slots[ACTION_9].setAction(ACTION_9, BERSERKER.SKILLS[ACTION_9].image)
    slots[ACTION_10].setAction(ACTION_10, BERSERKER.SKILLS[ACTION_10].image)
    slots[ACTION_11].setAction(ACTION_11, BERSERKER.SKILLS[ACTION_11].image)

    function onSlotEventChange(slot) {
        inputsAction.binaryActions = updateBit(inputsAction.binaryActions, slot.action, slot.pressed)
    }

    slots6_1.onChange.add(onSlotEventChange)
    slots6_2.onChange.add(onSlotEventChange)

    loopRaf.beforeRenderListeners.add(slots6_1.update)
    loopRaf.beforeRenderListeners.add(slots6_2.update)

    inputsAction.setCooldown = (actionId, cooldown, maxCooldown) => {
        slots[actionId].setCooldown(cooldown, maxCooldown)
    }
}

export const inputsAction = {
    init,
    setCooldown: (actionId, cooldown, maxCooldown) => { },
    binaryActions: 0
}
