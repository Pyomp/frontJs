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
    const r1 = 40
    const r2 = 95
    const r3 = 175
    const r4 = 250

    const buttonsPlacement = [
        { bottom: r1, right: r1, imgUrl: new URL('./actionImages/a.svg', import.meta.url).href }, // 0

        { bottom: r1 / 2 + r2 * Math.cos((PI05 / 2) * 0), right: r1 / 2 + r2 * Math.sin((PI05 / 2) * 0), imgUrl: new URL('./actionImages/b.svg', import.meta.url).href },
        { bottom: r1 / 2 + r2 * Math.cos((PI05 / 2) * 1), right: r1 / 2 + r2 * Math.sin((PI05 / 2) * 1), imgUrl: new URL('./actionImages/c.svg', import.meta.url).href },
        { bottom: r1 / 2 + r2 * Math.cos((PI05 / 2) * 2), right: r1 / 2 + r2 * Math.sin((PI05 / 2) * 2), imgUrl: new URL('./actionImages/d.svg', import.meta.url).href },

        { bottom: r1 / 4 + r3 * Math.cos((PI05 / 4) * 0), right: r1 / 4 + r3 * Math.sin((PI05 / 4) * 0), imgUrl: new URL('./actionImages/e.svg', import.meta.url).href },
        { bottom: r1 / 4 + r3 * Math.cos((PI05 / 4) * 1), right: r1 / 4 + r3 * Math.sin((PI05 / 4) * 1), imgUrl: new URL('./actionImages/e.svg', import.meta.url).href },
        { bottom: r1 / 4 + r3 * Math.cos((PI05 / 4) * 2), right: r1 / 4 + r3 * Math.sin((PI05 / 4) * 2), imgUrl: new URL('./actionImages/e.svg', import.meta.url).href },
        { bottom: r1 / 4 + r3 * Math.cos((PI05 / 4) * 3), right: r1 / 4 + r3 * Math.sin((PI05 / 4) * 3), imgUrl: new URL('./actionImages/e.svg', import.meta.url).href }, // 7
        { bottom: r1 / 4 + r3 * Math.cos((PI05 / 4) * 4), right: r1 / 4 + r3 * Math.sin((PI05 / 4) * 4), imgUrl: new URL('./actionImages/e.svg', import.meta.url).href },
    ]

    let buttonCenters = buttonsPlacement.map(a => [innerWidth - a.right - 35, innerHeight - a.bottom - 35])
    addEventListener('resize', () => { buttonCenters = buttonsPlacement.map(a => [innerWidth - a.right - 35, innerHeight - a.bottom - 35]) })

    let currentSlot = -1
    addEventListener('pointerdown', (event) => {
        if (isLocked() || currentSlot !== -1) return

        if (((innerWidth - event.clientX) ** 2 + (innerHeight - event.clientY) ** 2) > (r4 ** 2)) return

        event.preventDefault(); event.stopPropagation()

        document.body.setPointerCapture(event.pointerId)
        let slotId = -1
        let distance = Infinity
        for (let i = 0; i < buttonCenters.length; i++) {
            const center = buttonCenters[i]
            const distanceSq = (center[0] - event.clientX) ** 2 + (center[1] - event.clientY) ** 2

            if (distanceSq < distance) {
                distance = distanceSq
                slotId = i
            }
        }
        currentSlot = slotId
        const actionId = slotId

        actionsDownDispatcher[actionId]?.()
        actionsOnGoing[actionId] = true
        if (ActionToBinary[actionId] !== undefined) inputsAction.binaryActions |= ActionToBinary[actionId]
    }, { capture: true })

    addEventListener('lostpointercapture', (event) => {
        document.body.releasePointerCapture(event.pointerId)
        const actionId = currentSlot

        actionsOnGoing[actionId] = false

        actionsUpDispatcher[actionId]?.()
        if (ActionToBinary[actionId] !== undefined) inputsAction.binaryActions &= ~ActionToBinary[actionId]

        currentSlot = -1
    })

    for (let i = 0; i < 9; i++) {
        const button = new SkillButton({
            size: 60,
        })
        button.container.style.position = 'fixed'
        button.container.style.bottom = buttonsPlacement[i].bottom + 'px'
        button.container.style.right = buttonsPlacement[i].right + 'px'
        button.setImage(buttonsPlacement[i].imgUrl)
        serviceLoop.addUpdate(button.update)
        slots.push(button)
    }

    function setCooldown(actionId, cooldown, maxCooldown) {
        if (!slots[actionId]) return
        slots[actionId].cooldown = cooldown
        slots[actionId].maxCooldown = maxCooldown
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