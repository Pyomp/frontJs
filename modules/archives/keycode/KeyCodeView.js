import {
    InputManagerComputer,
    PREFIX_KEYBOARD,
    PREFIX_KEYBOARD_ALT,
    PREFIX_KEYBOARD_CTRL,
    PREFIX_KEYBOARD_CTRL_ALT,
    PREFIX_KEYBOARD_CTRL_SHIFT,
    PREFIX_KEYBOARD_SHIFT,
    PREFIX_KEYBOARD_SHIFT_ALT,
    PREFIX_MOUSE,
    PREFIX_MOUSE_ALT,
    PREFIX_MOUSE_CTRL,
    PREFIX_MOUSE_CTRL_ALT,
    PREFIX_MOUSE_CTRL_SHIFT,
    PREFIX_MOUSE_SHIFT
} from '../../gameEngine/input/InputManagerComputer.js'
import { historyClose } from '../../modules/dom/historyClose.js'
import { mutationManager } from '../../modules/dom/mutationManager.js'
import { styleVar } from '../../modules/dom/styleVar.js'
import { inputManagerComputer } from './global.js'

const modifierStr = {
    [PREFIX_KEYBOARD]: '',
    [PREFIX_KEYBOARD_CTRL]: 'Ctrl + ',
    [PREFIX_KEYBOARD_SHIFT]: 'Shift + ',
    [PREFIX_KEYBOARD_ALT]: 'Alt + ',
    [PREFIX_KEYBOARD_CTRL_SHIFT]: 'Ctrl + Shift + ',
    [PREFIX_KEYBOARD_CTRL_ALT]: 'Ctrl + Alt + ',
    [PREFIX_KEYBOARD_SHIFT_ALT]: 'Shift + Alt + ',

    [PREFIX_MOUSE]: 'Button ',
    [PREFIX_MOUSE_CTRL]: 'Ctrl + Button ',
    [PREFIX_MOUSE_SHIFT]: 'Shift + Button ',
    [PREFIX_MOUSE_ALT]: 'Alt + Button ',
    [PREFIX_MOUSE_CTRL_SHIFT]: 'Ctrl + Shift + Button ',
    [PREFIX_MOUSE_CTRL_ALT]: 'Ctrl + Alt + Button ',
    [PREFIX_MOUSE_CTRL_ALT]: 'Shift + Alt + Button ',
}

const codeToText = (code) => {
    if (code === '') return ''

    let str = modifierStr[code[0]]

    const name = getKey(code.slice(1))

    if (name === ' ') { str += 'Space' }
    else str += name
    return str
}


let getKey = (keycode) => keycode

// get the real key from event.code, not available in all browsers (chromium 👍)
let promiseLayoutMap
if (navigator.keyboard) {
    promiseLayoutMap = navigator.keyboard.getLayoutMap().then(keyboardLayoutMap => {
        getKey = (keycode) => keyboardLayoutMap.get(keycode) ?? keycode
    })
}

export class KeyCodeView {

    #view = new View('div', {
        ref: 'container',
        style: {
            maxWidth: '500px',
            display: 'grid',
            grid: 'auto / auto auto',
            gridGap: '0px 15px',
            alignItems: 'center',
            padding: "10px",
            background: styleVar['--background1'],
        },
        children: [
            new View('span', {
                style: {
                    gridColumn: '1 / 3',
                    color: 'hsl(300, 100%, 60%)'
                },
                i18n: 'To handle all keyboards around the world, what you are seeing may not represent your reality, but the key you chose is physically correct.'
            })
        ]
    })

    #container = this.#view.element

    #keyChangeView
    /**
     * @param {HTMLElement} parent 
     * @param {string} param
     * @param {Key_Change} key_change
     */
    constructor(parent, keyCodeAppData) {

        parent.appendChild(this.#container)

        this.#keyChangeView = new KeyChangeView(keyCodeAppData)

        for (const key of keyCodeAppData.keys()) {

            new View('span', { parent: this.#container, textContent: key })

            const button = new View('button', {
                style: {
                    width: '100%',
                    background: 'none',
                    padding: '3px',
                    display: 'flex', justifyContent: 'center', alignItems: 'center',
                    border: '3px inset grey',
                    borderRadius: '10px',
                    cursor: 'pointer',
                },
                parent: this.#container,
            }).element

            const text = new View('span', { parent: button }).element
            if (promiseLayoutMap) promiseLayoutMap.then(() => { text.textContent = codeToText(keyCodeAppData[key]) })
            else text.textContent = codeToText(keyCodeAppData[key])

            button.addEventListener('click', () => { this.#keyChangeView.display(key) })

            keyCodeAppData.addEventListener(key, () => {
                text.textContent = codeToText(keyCodeAppData[key])
            })
        }
    }
}

/**
 * Display the key combination.
 * On `confirm` button, change the `keyCodeAppData` (a data store see `./AppData/models/KeyCodeAppData.js`).
*/
class KeyChangeView {

    // html view ( > 100 lines don't get afraid 😄 )
    #view = new View('div', {
        style: {
            position: 'fixed',
            top: '0',
            left: '0',
            width: '100%',
            height: '100%',
            display: 'flex', justifyContent: 'center', alignItems: 'center',
            zIndex: '888',
            background: styleVar['--background-transparent'],
            backdropFilter: 'blur(1px)'
        },
        children: [
            new View('div', { // forground
                style: {
                    background: styleVar['--background1'],
                    padding: '10px',
                    borderRadius: '5px',
                    maxWidth: '250px',
                },
                children: [
                    new View('div', {
                        style: {
                            display: 'flex', alignItems: 'center', justifyContent: 'center',
                            marginBottom: '5px',
                        },
                        children: [
                            new View('div', {
                                ref: 'keycodePressed',
                                style: {
                                    display: 'flex', justifyContent: 'center', alignItems: 'center',
                                    border: '3px inset grey',
                                    borderRadius: '10px',
                                    cursor: 'pointer',
                                    height: '20px',
                                    minWidth: '150px',
                                },
                                children: [
                                    new View('span', {
                                        ref: 'keyChangeSpan',
                                        style: { margin: '0 5px' },
                                    }),
                                ]
                            }),
                            new View('div', {
                                ref: 'hint',
                                style: { padding: '2px' }
                            })
                        ]
                    }),
                    new View('div', {
                        style: {
                            display: 'flex', justifyContent: 'center', alignItems: 'center',
                        },
                        children: [
                            new View('button', {
                                ref: 'buttonConfirm',
                                i18n: 'confirm',
                                style: {
                                    backgroundColor: 'hsl(120, 100%, 40%)'
                                }
                            }),
                            new View('button', {
                                ref: 'buttonCancel',
                                i18n: 'cancel',
                                style: {
                                    backgroundColor: 'hsl(0, 100%, 45%)',
                                }
                            }),

                        ]
                    }),
                    new View('div', { // error
                        ref: 'errorContainer',
                        style: { color: '#ff6611' },
                        children: [
                            new View('span', { ref: 'errorKeycode' }),
                            new View('span', { i18n: ' already used by ' }),
                            new View('span', { ref: 'errorActionName' }),
                            new View('span', { i18n: '.<br>keys will be exchanged.' }),
                        ]
                    })
                ],
            }),
        ]
    })

    #container = this.#view.element

    #hint = this.#view.ref['hint']
    #keycodePressed = this.#view.ref['keycodePressed']

    #buttonConfirm = this.#view.ref['buttonConfirm']
    #buttonCancel = this.#view.ref['buttonCancel']

    #errorContainer = this.#view.ref['errorContainer']
    #errorKeycode = this.#view.ref['errorKeycode']
    #errorActionName = this.#view.ref['errorActionName']

    #iconOk = new View('img', {
        attributes: {
            width: 16,
            height: 16,
            src: new URL('./icons/ok.svg', import.meta.url).href
        }
    }).element

    #iconCaution = new View('img', {
        attributes: {
            width: 16,
            height: 16,
            src: new URL('./icons/caution.svg', import.meta.url).href
        }
    }).element
    // end view

    // set the caution hint when the key is already taken
    #setError(currentPressed, actionName) {
        this.#errorContainer.style.display = 'block'
        this.#errorKeycode.textContent = currentPressed
        this.#errorActionName.textContent = actionName
    }

    #clearError() {
        this.#errorContainer.style.display = 'none'
    }

    // event keyup / mouseup
    #currentCode
    #currentActionName
    #onInput(e) {
        this.#currentCode = InputManagerComputer.getKeycodeFromEvent(event)
        this.#keycodePressed.textContent = codeToText(this.#currentCode)

        const actionAlreadyUsed = this.#keyCodeAppData.getActionNameFromKeyCode(this.#currentCode)
        if (actionAlreadyUsed !== undefined) {
            this.#setError(this.#keycodePressed.textContent, actionAlreadyUsed)
            this.#iconOk.remove()
            this.#hint.appendChild(this.#iconCaution)
        } else {
            this.#clearError()
            this.#iconCaution.remove()
            this.#hint.appendChild(this.#iconOk)
        }
    }

    #onMouse(event) {
        if (event.composedPath().includes(this.#buttonConfirm)) return
        this.#onInput(event)
    }

    #keyCodeAppData

    #onKey(event) {
        if (event.key !== 'Control'
            && event.key !== 'Shift'
            && event.key !== 'Alt'
            && event.key !== 'Meta'
        ) {
            event.preventDefault(); event.stopPropagation()
            this.#onInput(event)
        }
    }

    #keyListener
    #mouseListener

    // display the view
    display(actionName) {
        if (this.#container.parentNode) return

        inputManagerComputer.lock()

        // data
        this.#currentActionName = actionName
        this.#currentCode = this.#keyCodeAppData[actionName]

        // view
        this.#clearError()
        this.#iconOk.remove()
        this.#iconCaution.remove()
        document.body.appendChild(this.#container)
        this.#keycodePressed.textContent = codeToText(this.#currentCode)

        // event
        historyClose.add(this.#container)
        this.#keyListener = this.#onKey.bind(this)
        this.#mouseListener = this.#onMouse.bind(this)
        document.addEventListener('keyup', this.#keyListener)
        document.addEventListener('mouseup', this.#mouseListener)
    }

    #closeListener
    // use a `MutationObserver` to trigger the close event utility see `/modules/dom/mutationManager.js`
    #onClose(e) {

        e?.stopPropagation()

        document.removeEventListener('keyup', this.#keyListener)
        document.removeEventListener('mouseup', this.#mouseListener)

        inputManagerComputer.unlock()
    }

    // confirm button event
    #onConfirm(event) {

        event.preventDefault()
        event.stopPropagation()

        const alreadyUsed = this.#keyCodeAppData.getActionNameFromKeyCode(this.#currentCode)
        if (alreadyUsed !== undefined) {
            this.#keyCodeAppData[alreadyUsed] = this.#keyCodeAppData[this.#currentActionName]
        }
        this.#keyCodeAppData[this.#currentActionName] = this.#currentCode

        this.#container.remove()
    }

    /**
     * @param {{[actionName: string]: [keyCode: string] , getActionNameFromKeyCode: function }} keyCodeAppData 
     */
    constructor(keyCodeAppData) {
        this.#keyCodeAppData = keyCodeAppData
        this.#closeListener = this.#onClose.bind(this)
        mutationManager.addCloseListener(this.#container, this.#closeListener)
        this.#buttonConfirm.addEventListener('click', (event) => { this.#onConfirm(event) })
        this.#buttonCancel.addEventListener('click', () => { this.#container.remove() })
    }
}
