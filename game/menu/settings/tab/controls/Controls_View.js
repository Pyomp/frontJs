import { createHTMLElement, strHTMLsafe } from '../../../../../../lib/dom/htmlElement.js'
import { i18nH } from '../../../../../../lib/dom/i18n.js'
import { cautionIMG, okIMG } from '../../../../../../lib/dom/icons/icons.js'
import { history_close } from '../../../../../../lib/dom/input_utils.js'
import { STYLE } from '../../../../../../lib/dom/style/Style.js'
import { app_data, input_manager, ws } from '../../../../../global.js'

const modifierStr = {
    '0': '',
    '1': 'Ctrl + ',
    '2': 'Shift + ',
    '3': 'Alt + ',
    '4': 'Ctrl + Shift + ',
    '5': 'Ctrl + Alt + ',
    '6': 'Shift + Alt + ',

    'a': 'Button ',
    'b': 'Ctrl + Button ',
    'c': 'Shift + Button ',
    'd': 'Alt + Button ',
    'e': 'Ctrl + Shift + Button ',
    'f': 'Ctrl + Alt + Button ',
    'g': 'Shift + Alt + Button ',
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

if (navigator.keyboard) {
    const keyboard = navigator.keyboard
    keyboard.getLayoutMap()
        .then(keyboardLayoutMap => {
            getKey = (keycode) => keyboardLayoutMap.get(keycode) ?? keycode
        })
}

class Key {
    /**
     * @param {HTMLElement} parent 
     * @param {string} param
     * @param {Key_Change} key_change
     */
    constructor(
        parent,
        param,
        key_change,
    ) {
        const key_code_data = app_data.key_code
        createHTMLElement('span', {}, parent, param)

        const button = createHTMLElement('div', {
            display: 'flex', justifyContent: 'center', alignItems: 'center',
            border: '3px inset grey',
            borderRadius: '10px',
            cursor: 'pointer',
        }, parent)

        const text = createHTMLElement('span', { margin: '0 5px' }, button)
        text.innerHTML = strHTMLsafe(codeToText(key_code_data[param]))

        const on_click = () => { key_change.display(param) }
        button.addEventListener('click', on_click)

        key_code_data.addEventListener(param, () => {
            text.innerHTML = strHTMLsafe(codeToText(key_code_data[param]))
            ws.settings.update_key_code()
        })
    }
}

/********************/
/*    Shortcut      */
/********************/
export class Controls_View {
    /**
     * 
     * @param {Input_Manager} input_manager 
     */
    constructor(
        parent,
    ) {
        const key_code_data = app_data.key_code
        this.container = createHTMLElement('div', {
            display: 'grid',
            grid: 'auto / auto auto',
            gridGap: '5px 15px',
            alignItems: 'center',
            padding: "5px"
        }, parent)

        createHTMLElement('span', {
            gridColumn: '1 / 3',
            color: 'hsl(300, 100%, 60%)'
        }, this.container, `keyboard_settings_note`)

        const key_change = new Key_Change_View(input_manager)

        for (const key of key_code_data.keys()) {
            if (key_code_data[key].constructor === String) {
                new Key(this.container, key, key_change)
            }
        }
    }
}

class Key_Change_View {

    constructor() {
        const key_code_data = app_data.key_code
        const ok = okIMG(16, 16)
        const caution = cautionIMG(16, 16)
        const background = createHTMLElement('div', {
            position: 'fixed',
            top: '0',
            left: '0',
            width: '100%',
            height: '100%',
            display: 'flex', justifyContent: 'center', alignItems: 'center',
            zIndex: '888',
            background: STYLE.var.colorBackground,
            backdropFilter: 'blur(1px)'
        })

        const foreground = createHTMLElement('div', {
            background: STYLE.var.colorBackground,
            padding: '10px',
            borderRadius: '5px',
            maxWidth: '250px',
        }, background)

        {
            // key view
            const key_change_div = createHTMLElement('div', {
                display: 'flex', alignItems: 'center', justifyContent: 'center',
                marginBottom: '5px',
            }, foreground)

            const key_change_span_container = createHTMLElement('div', {
                display: 'flex', justifyContent: 'center', alignItems: 'center',
                border: '3px inset grey',
                borderRadius: '10px',
                cursor: 'pointer',
                height: '20px',
                minWidth: '150px',
            }, key_change_div)

            const keyChangeSpan = createHTMLElement('span', { margin: '0 5px' }, key_change_span_container)

            const hint = createHTMLElement('div', {
                padding: '2px'
            }, key_change_div)

            // error
            const error = createHTMLElement('div', { color: '#ff6611' }, foreground)
            const error1 = createHTMLElement('span', {}, error)
            const error2 = createHTMLElement('span', {}, error)
            const error3 = createHTMLElement('span', {}, error)
            const error4 = createHTMLElement('span', {}, error)

            // buttons
            const btnContainer = createHTMLElement('div', {
                display: 'flex', justifyContent: 'center', alignItems: 'center',
            }, foreground)
            {
                const keyChangeBtnOk = createHTMLElement('button', {
                    backgroundColor: 'hsl(120, 100%, 40%)'
                }, btnContainer, 'confirm')

                const keyChangeBtnNok = createHTMLElement('button', {
                    backgroundColor: 'hsl(0, 100%, 45%)',
                }, btnContainer, 'cancel')

                let current
                let code = ''

                const setError = (code, key) => {
                    error1.innerHTML = strHTMLsafe(code)
                    i18nH(error2, ' already used by ')
                    i18nH(error3, key)
                    i18nH(error4, '.<br>keys will be exchanged.')
                }

                const clearError = () => { error1.innerHTML = ''; i18nH(error2, ''); i18nH(error3, ''); i18nH(error4, '') }

                const onKey = (e) => {
                    if (e.key !== 'Control'
                        && e.key !== 'Shift'
                        && e.key !== 'Alt'
                        && e.key !== 'Meta'
                    ) {
                        e.preventDefault(); e.stopPropagation()
                        code = input_manager.get_keyCode(e)
                        keyChangeSpan.innerHTML = codeToText(code)

                        const alreadyUsed = key_code_data.get_name_from_code(code)
                        if (alreadyUsed !== undefined) {
                            setError(keyChangeSpan.innerHTML, alreadyUsed)
                            ok.remove()
                            hint.appendChild(caution)
                        } else {
                            clearError()
                            caution.remove()
                            hint.appendChild(ok)
                        }
                    }
                }

                const onMouse = (e) => {
                    if (e.composedPath().includes(keyChangeBtnOk)) return

                    code = input_manager.get_keyCode(e)
                    keyChangeSpan.innerHTML = codeToText(code)

                    const alreadyUsed = key_code_data.get_name_from_code(code)
                    if (alreadyUsed !== undefined) {
                        setError(keyChangeSpan.innerHTML, alreadyUsed)
                        ok.remove()
                        hint.appendChild(caution)
                    } else {
                        clearError()
                        caution.remove()
                        hint.appendChild(ok)
                    }
                }

                keyChangeBtnOk.addEventListener('click', (e) => {
                    e.preventDefault()
                    e.stopPropagation()

                    const alreadyUsed = key_code_data.get_name_from_code(code)
                    if (alreadyUsed !== undefined) {
                        key_code_data[alreadyUsed] = key_code_data[current]
                    }
                    key_code_data[current] = code

                    onEndKeyChange(e)
                })

                const onEndKeyChange = (e) => {
                    e?.stopPropagation()
                    window.removeEventListener('keydown', onKey)
                    window.removeEventListener('mousedown', onMouse)

                    input_manager.unlock()

                    background.remove()
                    history_close.delete(onEndKeyChange)
                }

                keyChangeBtnNok.addEventListener('click', onEndKeyChange)
                this.display = (name) => {
                    clearError()
                    ok.remove()
                    caution.remove()

                    input_manager.lock()

                    document.body.appendChild(background)

                    code = key_code_data[name]
                    keyChangeSpan.innerHTML = codeToText(code)
                    current = name

                    addEventListener('keydown', onKey)
                    addEventListener('mousedown', onMouse)

                    history_close.add(onEndKeyChange)
                }
            }
        }
    }
}
