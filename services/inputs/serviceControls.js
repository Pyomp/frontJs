import { isMobile } from "../../dom/browserInfo.js"
import { storeKeyCode } from "../../store/storeKeyCode.js"

export const PREFIX_MOUSE = 'a'
export const PREFIX_MOUSE_CTRL = 'b'
export const PREFIX_MOUSE_CTRL_SHIFT = 'e'
export const PREFIX_MOUSE_CTRL_ALT = 'f'
export const PREFIX_MOUSE_SHIFT = 'c'
export const PREFIX_MOUSE_SHIFT_ALT = 'g'
export const PREFIX_MOUSE_ALT = 'd'

export const PREFIX_KEYBOARD = '0'
export const PREFIX_KEYBOARD_CTRL = '1'
export const PREFIX_KEYBOARD_CTRL_SHIFT = '4'
export const PREFIX_KEYBOARD_CTRL_ALT = '5'
export const PREFIX_KEYBOARD_SHIFT = '2'
export const PREFIX_KEYBOARD_SHIFT_ALT = '6'
export const PREFIX_KEYBOARD_ALT = '3'

function initServiceControls() {
    function getCodeKeyPrefixKeyboard(event) {
        if (event.ctrlKey === true) {
            if (event.shiftKey === true) return PREFIX_KEYBOARD_CTRL_SHIFT
            else if (event.altKey === true) return PREFIX_KEYBOARD_CTRL_ALT
            else return PREFIX_KEYBOARD_CTRL
        } else if (event.shiftKey === true) {
            if (event.altKey === true) return PREFIX_KEYBOARD_SHIFT_ALT
            else return PREFIX_KEYBOARD_SHIFT
        }
        else if (event.altKey === true) return PREFIX_KEYBOARD_ALT
        else return PREFIX_KEYBOARD
    }

    function getCodeKeyPrefixMouse(e) {
        if (e.ctrlKey === true) {
            if (e.shiftKey === true) return PREFIX_MOUSE_CTRL_SHIFT
            else if (e.altKey === true) return PREFIX_MOUSE_CTRL_ALT
            else return PREFIX_MOUSE_CTRL
        } else if (e.shiftKey === true) {
            if (e.altKey === true) return PREFIX_MOUSE_SHIFT_ALT
            else return PREFIX_MOUSE_SHIFT
        }
        else if (e.altKey === true) return PREFIX_MOUSE_ALT
        else return PREFIX_MOUSE
    }

    const lockSet = new Set()
    function isLocked() { return lockSet.size !== 0 }
    /** return the unlock function */
    function lock() {
        const symbol = Symbol()
        lockSet.add(symbol)
        return () => { lockSet.delete(symbol) }
    }

    let binaryActions = new BigUint64Array([0])

    const actionsDownDispatcher = {}
    const actionsUpDispatcher = {}

    let actionOnGoing = {}

    addEventListener("mousedown", (e) => {
        if (document.pointerLockElement === null) {
            window.requestPointerLock()
            return
        }

        if (isLocked()) return

        const code = getCodeKeyPrefixMouse(e) + e.button

        const actionIndex = storeKeyCode.keycodeToAction[code]

        if (actionIndex !== undefined) {
            actionOnGoing[actionIndex] = true
            binaryActions[0] |= (1 << actionIndex)
            const callback = actionsDownDispatcher[actionIndex]
            if (callback !== undefined) {
                e.preventDefault(); e.stopPropagation()
                callback(e)
            }
        }
    })

    addEventListener("mouseup", (e) => {
        for (const key in actionOnGoing) {
            if (key.substring(1) === e.button && ['a', 'b', 'c', 'd', 'e', 'f', 'g'].includes(key[0])) {
                const actionIndex = storeKeyCode.keycodeToAction[key]

                if (actionIndex !== undefined) {
                    actionOnGoing[actionIndex] = false
                    binaryActions[0] &= ~(1 << actionIndex)
                    const callback = actionsUpDispatcher[actionIndex]
                    if (callback !== undefined) callback(e)
                    e.preventDefault(); e.stopPropagation()
                }
            }
        }
    })

    addEventListener("keydown", (e) => {
        const key = e.code

        if (document.activeElement.tagName === 'INPUT') {
            if (key === 'Escape') document.activeElement.blur()
            return
        }

        if (document.pointerLockElement !== null && (key === 'Alt' || key === 'Escape')) {
            e.preventDefault()
            document.exitPointerLock()
        }

        if (isLocked()) return

        const code = getCodeKeyPrefixKeyboard(e) + key

        const actionIndex = storeKeyCode.keycodeToAction[code]

        if (actionIndex !== undefined) {
            if (document.pointerLockElement === null) window.requestPointerLock()
            actionOnGoing[actionIndex] = true
            binaryActions[0] |= (1 << actionIndex)
            const callback = actionsDownDispatcher[actionIndex]
            e.preventDefault(); e.stopPropagation()
            if (callback !== undefined) callback(e)
        }
    }, { capture: true })

    addEventListener("keyup", (e) => {
        for (const key in actionOnGoing) {
            const code = e.code

            if (key.slice(1) === code && ['0', '1', '2', '3', '4', '5', '6'].includes(key[0])) {
                const actionIndex = storeKeyCode.keycodeToAction[key]

                if (actionIndex !== undefined) {
                    actionOnGoing[actionIndex] = false
                    binaryActions[0] &= ~(1 << actionIndex)
                    const callback = actionsUpDispatcher[actionIndex]
                    if (callback !== undefined) callback(e)
                    e.preventDefault(); e.stopPropagation()
                }
            }
        }
    }, { capture: true })

    // window.addEventListener('blur', () => {
    //     actions = 0
    //     for (const key in keycodeState) {
    //         delete keycodeState[key]
    //     }
    // }, { capture: true })

    return {
        actionsDownDispatcher,
        actionsUpDispatcher,
        actionOnGoing,
        lock,
        get binaryActions() { return binaryActions },
    }
}

function init() {
    delete serviceControls.init
    if (!isMobile) {
        Object.assign(serviceControls, initServiceControls())
    }
}

export const serviceControls = {
    init,
    /** @type {{[action: number]: Function}} */ actionsDownDispatcher: undefined,
    /** @type {{[action: number]: Function}} */ actionsUpDispatcher: undefined,
    /** @type {{[action: number]: boolean}} */ actionOnGoing: undefined,
    /** @type {()=> Function} */ lock: undefined,
    binaryActions: undefined
}

