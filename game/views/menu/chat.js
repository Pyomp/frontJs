import { styles } from "../../../modules/dom/styles/styles.js"
import { LocalStorageChatHistory } from "../../constants/constantsLocalStorage.js"

function init() {
    const container = chat.container
    container.style.background = styles.vars["--background-transparent01"]
    container.style.transitionProperty = 'background'
    container.style.transitionDuration = '0.3s'
    // container.style.height = '300px'

    const content = document.createElement('div')
    content.style.height = '100px'
    content.style.width = '300px'
    container.appendChild(content)

    const spanContainer = document.createElement('div')
    spanContainer.style.display = 'flex'
    spanContainer.style.flexDirection = 'column-reverse'
    spanContainer.style.overflowY = 'auto'
    spanContainer.style.height = '100%'
    content.appendChild(spanContainer)

    const spans = []
    for (let i = 0; i < 100; i++) {
        const span = document.createElement('span')
        spanContainer.appendChild(span)
        spans.push(span)
    }

    const input = document.createElement('input')
    input.style.width = '100%'
    input.style.height = '20px'
    input.style.borderRadius = '0'
    input.style.background = styles.vars["--background-transparent03"]
    container.appendChild(input)

    const history = []
    try {
        const savedHistory = JSON.parse(localStorage.getItem(LocalStorageChatHistory))
        for (const line of savedHistory) {
            if (line.constructor === String) {
                history.push(line)
            }
        }
    } catch { }


    let historyIndex = -1
    function onArrowUp() {
        historyIndex++
        if (historyIndex > history.length - 1) {
            historyIndex--
        } else {
            input.value = history[historyIndex]
        }
    }

    function onArrowDown() {
        historyIndex--
        if (historyIndex < 0) {
            historyIndex = -1
            input.value = ''
        } else {
            input.value = history[historyIndex]
        }
    }

    let messageJustAppended = false
    let messageJustAppendedTimeout
    let spanConsoleIndex = 0
    function append(str) {
        spanConsoleIndex = (spanConsoleIndex + 1) % 100
        spans[spanConsoleIndex].textContent = str
        spanContainer.prepend(spans[spanConsoleIndex])

        messageJustAppended = true
        focus()
        clearTimeout(messageJustAppendedTimeout)
        messageJustAppendedTimeout = setTimeout(() => { messageJustAppended = false; blur() })
    }

    let help = ``
    const dispatcher = { ['help']: () => { append(help) } }

    function addCommand(command, info, callback, window) {
        if (dispatcher[command] !== undefined) {
            console.warn('Command already present in console.')
            return
        }
        help += `\n${command}\n ${info}\n`
        if (window === undefined) {
            dispatcher[command] = (data) => {
                append(callback(data))
            }
        } else {
            dispatcher[command] = callback
        }
    }
    addCommand('coucou', 'coucou [data]<br> say coucou to data', (data) => `\ncoucou ${data}`)

    function onEnterKey() {
        const str = input.value
        if (str === '') return
        history.unshift(str)
        if (history.length > 100) history.length = 100
        localStorage.setItem(LocalStorageChatHistory, JSON.stringify(history))
        historyIndex = -1

        input.value = ''
        input.blur()

        const split = str.split(' ')
        dispatcher[split[0]]?.(...split.slice(1))
    }

    function onKeyInput(event) {
        event.stopPropagation()
        const code = event.code
        if (code === 'Enter') onEnterKey()
        else if (code === 'ArrowUp') onArrowUp()
        else if (code === 'ArrowDown') onArrowDown()
    }
    input.addEventListener('keydown', onKeyInput)

    addEventListener('pointerdown', () => { if (document.activeElement === input) input.blur() }, { capture: true })
    addEventListener('keydown', ({ code }) => {
        if (code === 'Enter' && document.activeElement.tagName !== 'INPUT' && !chat.isLock) input.focus()
    })

    let isMouseHover = false
    container.addEventListener("mouseleave", (event) => { isMouseHover = false; blur() })
    container.addEventListener("mouseover", (event) => { isMouseHover = true; focus() })

    let blurTimeout
    function blur() {
        if (document.activeElement === input) return
        if (isMouseHover === true) return
        if (messageJustAppended === true) return
        clearTimeout(blurTimeout)
        blurTimeout = setTimeout(() => {
            container.style.background = styles.vars["--background-transparent01"]
        }, 3000)
    }

    function focus() {
        clearTimeout(blurTimeout)
        container.style.background = styles.vars["--background-transparent05"]
    }

    input.addEventListener('blur', blur)
    input.addEventListener('focus', focus)
}

export const chat = {
    init,
    container: document.createElement('div'),
    isLock: false
}






