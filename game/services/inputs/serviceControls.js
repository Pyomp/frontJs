import { isMobile } from "../../../dom/browserInfo.js"
import { storeShortcuts } from "../../store/storeShortcuts.js"
import { service3D } from "../service3D.js"

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
        reset()
        return () => { lockSet.delete(symbol) }
    }

    function reset() {
        for (const shortcut of _shortcutsOnGoing) {
            actionsUpDispatcher[shortcut.action]?.()
        }
        for (const key in actionsOnGoing) {
            actionsOnGoing[key] = false
        }
    }

    let binaryActions = new Uint32Array([0])

    const actionsDownDispatcher = {}
    const actionsUpDispatcher = {}

    const _shortcutsOnGoing = new Set()
    const actionsOnGoing = {}

    const buttons = new Set()
    const codes = new Set()
    let altKey = false
    let ctrlKey = false
    let metaKey = false
    let shiftKey = false

    const matcher = {
        buttons,
        codes,
        get altKey() { return altKey },
        get ctrlKey() { return ctrlKey },
        get metaKey() { return metaKey },
        get shiftKey() { return shiftKey }
    }

    addEventListener("mousedown", (event) => {
        if (document.pointerLockElement === null) return

        if (isLocked()) return

        buttons.add(event.button)
        altKey = event.altKey
        ctrlKey = event.ctrlKey
        metaKey = event.metaKey
        shiftKey = event.shiftKey

        for (const shortcut of storeShortcuts) {
            if (shortcut.match(event)) {
                _shortcutsOnGoing.add(shortcut)
                actionsOnGoing[shortcut.action] = true

                const callback = actionsDownDispatcher[shortcut.action]
                if (callback !== undefined) {
                    event.preventDefault(); event.stopPropagation()
                    callback(event)
                }
            }
        }
    })

    addEventListener("mouseup", (event) => {
        buttons.delete(event.button)
        altKey = event.altKey
        ctrlKey = event.ctrlKey
        metaKey = event.metaKey
        shiftKey = event.shiftKey

        for (const shortcut of _shortcutsOnGoing) {
            if (!shortcut.match(matcher)) {
                _shortcutsOnGoing.delete(shortcut)
                actionsOnGoing[shortcut.action] = false

                binaryActions[0] &= ~(1 << shortcut.action)
                const callback = actionsUpDispatcher[shortcut.action]
                if (callback !== undefined) callback(event)
                event.preventDefault(); event.stopPropagation()
            }
        }
    })

    addEventListener("keydown", (event) => {
        const code = event.code

        if (document.activeElement.tagName === 'INPUT') {
            if (code === 'Escape') document.activeElement.blur()
            return
        }

        if (document.pointerLockElement === null) {
            service3D.renderer.canvas.requestPointerLock()
        } else if (event.altKey === true || code === 'Escape') {
            event.preventDefault()
            document.exitPointerLock()
        }

        if (isLocked()) return

        codes.add(code)
        altKey = event.altKey
        ctrlKey = event.ctrlKey
        metaKey = event.metaKey
        shiftKey = event.shiftKey

        for (const shortcut of storeShortcuts) {
            if (shortcut.match(event)) {
                _shortcutsOnGoing.add(shortcut)
                actionsOnGoing[shortcut.action] = true

                const callback = actionsDownDispatcher[shortcut.action]
                if (callback !== undefined) {
                    event.preventDefault(); event.stopPropagation()
                    callback(event)
                }
            }
        }
    }, { capture: true })

    addEventListener("keyup", (event) => {
        codes.delete(event.code)
        altKey = event.altKey
        ctrlKey = event.ctrlKey
        metaKey = event.metaKey
        shiftKey = event.shiftKey

        for (const shortcut of _shortcutsOnGoing) {
            if (!shortcut.match(matcher)) {
                _shortcutsOnGoing.delete(shortcut)
                actionsOnGoing[shortcut.action] = false

                binaryActions[0] &= ~(1 << shortcut.action)
                const callback = actionsUpDispatcher[shortcut.action]
                if (callback !== undefined) callback(event)
                event.preventDefault(); event.stopPropagation()
            }
        }
    }, { capture: true })

    return {
        actionsDownDispatcher,
        actionsUpDispatcher,
        actionOnGoing: actionsOnGoing,
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

