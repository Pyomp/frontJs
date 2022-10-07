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

// code for general event (mouse & keyboard)
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

function getKeycodeFromEvent(event) {
    if (event.type.includes('mouse') === true) {
        return getCodeKeyPrefixMouse(event) + event.button
    } else if (event.type.includes('key') === true) {
        return getCodeKeyPrefixKeyboard(event) + event.code
    }
}

/**
 * Input manager for keyboard and mouse.
 * A `keycode` is a `string` representing the combinaison of inputs pressed.  
 * (example: Ctrl + Alt + mouse button 2 => keyCode = `f2`).  
 * You can see above wich prefix is used, the right side is `event.button` for mouse and `event.code` for keyboard.  
*/
export class InputManagerComputer {
    actionsDown = {}
    actionsUp = {}

    defaultKeyCodeAction = {}

    keycodeState = {}

    #lockCount = 0
    // if lockCount > 0, inputs will be locked (can handle multiple locks but you should have the same number of lock and unlock)
    lock() { this.#lockCount++ }
    unlock() {
        this.#lockCount--
        if (this.#lockCount < 0) {
            console.warn(new Error(`lockCount < 0, wrong lock / unlock flow`))
            this.#lockCount = 0
        }
    }

    pointerLockActivated = false
    static getKeycodeFromEvent = getKeycodeFromEvent

    /**
     * @param {HTMLElement} htmlElement the mouse listener element (keyboard is global, on `document`)
     * @param {{getActionNameFromKeyCode}} keyCodeAppData
    */
    constructor(
        htmlElement,
        keyCodeAppData
    ) {
        // mouse general events
        htmlElement.addEventListener("mousedown", (e) => {

            if (this.pointerLockActivated === true && document.pointerLockElement === null) {
                htmlElement.requestPointerLock()
                return
            }

            if (this.#lockCount > 0) return
            const code = getCodeKeyPrefixMouse(e) + e.button
            this.keycodeState[code] = true

            const actionName = keyCodeAppData.getActionNameFromKeyCode(code)

            if (actionName !== undefined) {
                const callback = this.actionsDown[actionName]
                if (callback !== undefined) {
                    e.preventDefault(); e.stopPropagation()
                    callback(e)
                }
            }

        }, { capture: true })

        htmlElement.addEventListener("mouseup", (e) => {
            if (this.#lockCount > 0) return

            const code = getCodeKeyPrefixMouse(e) + e.button
            this.keycodeState[code] = false

            // 
            for (const key in this.keycodeState) {
                if (['a', 'b', 'c', 'd', 'e', 'f', 'g'].includes(key[0])
                    && key.substring(1) === e.button)
                    this.keycodeState[key] = false
            }

            const actionName = keyCodeAppData.getActionNameFromKeyCode(code)

            if (actionName !== undefined) {
                const callback = this.actionsUp[actionName]
                if (callback !== undefined) {
                    e.preventDefault(); e.stopPropagation()
                    callback(e)
                }
            }
        }, { capture: true })

        // KeyBoard general events
        addEventListener("keydown", (e) => {
            const key = e.code

            if (document.activeElement.tagName.toUpperCase() === 'INPUT') {
                if (key === 'Escape') document.activeElement.blur()
                return
            }

            if (this.pointerLockActivated === true) {
                if (document.pointerLockElement === null) {
                    htmlElement.requestPointerLock()
                } else {
                    if (key === 'Alt' || key === 'Escape') {
                        e.preventDefault()
                        document.exitPointerLock()
                    }
                }
            }

            if (this.#lockCount > 0) return
            if (e.repeat) return

            const code = getCodeKeyPrefixKeyboard(e) + key

            this.keycodeState[code] = true

            const defaultCallback = this.defaultKeyCodeAction[code]
            if (defaultCallback !== undefined) { defaultCallback(); return }

            const actionName = keyCodeAppData.getActionNameFromKeyCode(code)

            if (actionName !== undefined) {
                const callback = this.actionsDown[actionName]
                if (callback !== undefined) {
                    e.preventDefault(); e.stopPropagation()
                    callback(e)
                }
            }

        }, { capture: true })

        addEventListener("keyup", (e) => {
            if (this.#lockCount > 0) return
            if (e.repeat) return

            const code = getCodeKeyPrefixKeyboard(e) + e.code

            for (const key in this.keycodeState) {
                const code = e.code
                if (['0', '1', '2', '3', '4', '5', '6'].includes(key[0])
                    && key?.substring(1) === code)
                    this.keycodeState[key] = false
            }


            const index = keyCodeAppData.getActionNameFromKeyCode(code)

            if (index !== undefined) {
                const cb = this.actionsUp[index]
                if (cb !== undefined) {
                    e.preventDefault(); e.stopPropagation()
                    cb(e)
                }
            }

        }, { capture: true })

        window.addEventListener('blur', () => {
            for (const key in this.keycodeState) {
                delete this.keycodeState[key]
            }
        }, { capture: true })
    }
}


