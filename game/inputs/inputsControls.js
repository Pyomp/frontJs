import { isMobile } from "../../dom/browserInfo.js"
import { storeShortcuts } from "../store/storeShortcuts.js"
import { service3D } from "../services/service3D.js"
import { ActionToBinary } from "../constants/constantsActions.js"

function initServiceControls() {
    const lockSet = new Set()
    function isLocked() { return lockSet.size !== 0 }
    /** return the unlock function */
    function lock() {
        const symbol = Symbol()
        lockSet.add(symbol)
        reset()
        return () => { lockSet.delete(symbol) }
    }
    inputControls.lock = lock

    function reset() {
        for (const shortcut of _shortcutsOnGoing) {
            actionsUpDispatcher[shortcut.action]?.()
        }
        for (const key in actionsOnGoing) {
            actionsOnGoing[key] = false
        }
    }

    const actionsDownDispatcher = inputControls.actionsDownDispatcher
    const actionsUpDispatcher = inputControls.actionsUpDispatcher
    const actionsOnGoing = inputControls.actionsOnGoing

    const _shortcutsOnGoing = new Set()


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
                const binary = ActionToBinary[shortcut.action]
                if (binary !== undefined) inputControls.binaryActions |= binary

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
                const binary = ActionToBinary[shortcut.action]
                if (binary !== undefined) inputControls.binaryActions &= ~binary

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
                const binary = ActionToBinary[shortcut.action]
                if (binary !== undefined) inputControls.binaryActions |= binary

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
                const binary = ActionToBinary[shortcut.action]
                if (binary !== undefined) inputControls.binaryActions &= ~binary

                const callback = actionsUpDispatcher[shortcut.action]
                if (callback !== undefined) callback(event)
                event.preventDefault(); event.stopPropagation()
            }
        }
    }, { capture: true })
}

function init() {
    delete inputControls.init
    if (!isMobile) {
        initServiceControls()
    }
}

export const inputControls = {
    init,
    /** @type {{[action: number]: Function}} */ actionsDownDispatcher: {},
    /** @type {{[action: number]: Function}} */ actionsUpDispatcher: {},
    /** @type {{[action: number]: boolean}} */ actionsOnGoing: {},
    lock: () => () => { },
    binaryActions: 0
}

