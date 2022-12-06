import { SkillButton } from "../../dom/components/SkillsButton.js"
import { PI025, PI05 } from "../../math/MathUtils.js"
import { ActionToBinary, ACTION_0, ACTION_1, ACTION_2, ACTION_3, ACTION_4, ACTION_5, ACTION_6, ACTION_INTERACT, ACTION_JUMP } from "../constants/constantsActions.js"
import { serviceLoop } from "../services/serviceLoop.js"

function init() {
    const lockSet = new Set()
    function isLocked() { return lockSet.size !== 0 }
    /** return the unlock function */
    function lock() {
        const symbol = Symbol()
        lockSet.add(symbol)
        reset()
        return () => { lockSet.delete(symbol) }
    }
    inputsAction.lock = lock

    function reset() {
        for (const key in actionsOnGoing) {
            actionsOnGoing[key] = false
        }
        inputsAction.binaryActions = 0
    }

    const actionsDownDispatcher = inputsAction.actionsDownDispatcher
    const actionsUpDispatcher = inputsAction.actionsUpDispatcher
    const actionsOnGoing = inputsAction.actionsOnGoing

    const slots = []

    Math.cos(PI025 + PI05)
    Math.sin(PI025 + PI05)
    const r1 = 5
    const r2 = 70
    const r3 = 130

    const buttonsPlacement = [
        { bottom: r1, right: r1, imgUrl: new URL('./actionImages/a.svg', import.meta.url).href }, // 0

        { bottom: r2 * Math.cos((PI05 / 2) * 0), right: r2 * Math.sin((PI05 / 2) * 0), imgUrl: new URL('./actionImages/b.svg', import.meta.url).href },
        { bottom: r2 * Math.cos((PI05 / 2) * 1), right: r2 * Math.sin((PI05 / 2) * 1), imgUrl: new URL('./actionImages/c.svg', import.meta.url).href },
        { bottom: r2 * Math.cos((PI05 / 2) * 2), right: r2 * Math.sin((PI05 / 2) * 2), imgUrl: new URL('./actionImages/d.svg', import.meta.url).href },

        { bottom: r3 * Math.cos((PI05 / 4) * 0), right: r3 * Math.sin((PI05 / 4) * 0), imgUrl: new URL('./actionImages/e.svg', import.meta.url).href },
        { bottom: r3 * Math.cos((PI05 / 4) * 1), right: r3 * Math.sin((PI05 / 4) * 1), imgUrl: new URL('./actionImages/e.svg', import.meta.url).href },
        { bottom: r3 * Math.cos((PI05 / 4) * 2), right: r3 * Math.sin((PI05 / 4) * 2), imgUrl: new URL('./actionImages/e.svg', import.meta.url).href },
        { bottom: r3 * Math.cos((PI05 / 4) * 3), right: r3 * Math.sin((PI05 / 4) * 3), imgUrl: new URL('./actionImages/e.svg', import.meta.url).href }, // 7
        { bottom: r3 * Math.cos((PI05 / 4) * 4), right: r3 * Math.sin((PI05 / 4) * 4), imgUrl: new URL('./actionImages/e.svg', import.meta.url).href },
    ]

    for (let i = 0; i < 9; i++) {
        const button = new SkillButton()
        button.container.style.position = 'fixed'
        button.container.style.bottom = buttonsPlacement[i].bottom + 'px'
        button.container.style.right = buttonsPlacement[i].right + 'px'
        button.setImage(buttonsPlacement[i].imgUrl)
        serviceLoop.addUpdate(button.update)
        slots.push(button)
    }

    const actionToSlot = {}

    function setSlot(slotId, actionId) {
        const binary = ActionToBinary[actionId]
        if (binary === undefined) return
        actionToSlot[actionId] = slots[slotId]
        slots[slotId].onDown = () => {
            if (isLocked()) return
            actionsDownDispatcher[actionId]?.()
            actionsOnGoing[actionId] = true
            inputsAction.binaryActions |= binary
        }
        slots[slotId].onUp = () => {
            if (isLocked()) return
            actionsOnGoing[actionId] = false
            inputsAction.binaryActions &= ~binary
            actionsUpDispatcher[actionId]?.()
        }
    }

    setSlot(0, ACTION_INTERACT)
    setSlot(1, ACTION_JUMP)
    setSlot(2, ACTION_0)
    setSlot(3, ACTION_1)
    setSlot(4, ACTION_2)
    setSlot(5, ACTION_3)
    setSlot(6, ACTION_4)
    setSlot(7, ACTION_5)
    setSlot(8, ACTION_6)

    function setCooldown(actionId, cooldown, maxCooldown) {
        if (!actionToSlot[actionId]) return
        actionToSlot[actionId].cooldown = cooldown
        actionToSlot[actionId].maxCooldown = maxCooldown
    }

    inputsAction.setCooldown = setCooldown
}

export const inputsAction = {
    init,
    /** @type {{[action: number]: Function}} */ actionsDownDispatcher: {},
    /** @type {{[action: number]: Function}} */ actionsUpDispatcher: {},
    /** @type {{[action: number]: boolean}} */ actionsOnGoing: {},
    /** @type {()=> Function} */ lock: () => () => { },
    setCooldown: () => { },
    binaryActions: 0
}