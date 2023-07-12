import { styles } from "../../../modules/dom/styles/styles.js"
import { voidFunction } from "../../../modules/utils/utils.js"
import { inputsAction } from "../slots.js"
import { inputsControls } from "../../globals/inputs/inputsControls.js"
import { chat } from "./chat"

async function init() {
    const MenuWidth = 40
    chat.init()

    const menuContainer = document.createElement('div')
    menuContainer.style.position = 'fixed'
    menuContainer.style.height = '100%'
    menuContainer.style.width = `${MenuWidth}px`
    menuContainer.style.background = 'transparent'
    menuContainer.style.pointerEvents = 'none'
    menuContainer.style.userSelect = 'none'
    menuContainer.style.display = 'flex'
    menuContainer.style.flexDirection = 'column'
    menuContainer.style.transition = 'background 0.3s'
    // document.body.appendChild(menuContainer)

    /**@return {SVGAElement}*/
    function setIconElement(svgElement) {
        svgElement.style.fill = styles.vars["--color1"]
        svgElement.style.width = '100%'
        svgElement.style.height = 'min-content'
        svgElement.style.padding = '10px'
        svgElement.classList.add('button')
        svgElement.style.pointerEvents = 'initial'
        svgElement.onpointerdown = (event) => { event.preventDefault(); event.stopPropagation() }
        svgElement.onpointerup = (event) => { event.preventDefault(); event.stopPropagation() }
        return svgElement
    }


    const ContentWidth = 350
    const contentContainer = document.createElement('div')
    contentContainer.style.position = 'fixed'
    contentContainer.style.left = `${MenuWidth}px`
    contentContainer.style.height = '100%'
    contentContainer.style.width = `${ContentWidth}px`
    contentContainer.style.maxWidth = `calc(100% - ${MenuWidth}px)`
    contentContainer.style.pointerEvents = 'none'
    contentContainer.style.overflowX = 'hidden'
    contentContainer.style.overflowY = 'auto'
    contentContainer.style.userSelect = 'none'
    contentContainer.onpointerdown = (event) => { event.preventDefault(); event.stopPropagation() }
    contentContainer.onpointerup = (event) => { event.preventDefault(); event.stopPropagation() }

    // document.body.appendChild(contentContainer)

    const contents = []

    let opened = false

    let inputControlsUnlock = voidFunction
    let inputsActionUnlock = voidFunction

    function closeAll() {
        opened = false

        inputControlsUnlock()
        inputsActionUnlock()

        menuContainer.style.pointerEvents = 'none'
        contentContainer.style.pointerEvents = 'none'
        menuContainer.style.background = 'transparent'
        for (const content of contents) {
            content.style.opacity = '0'
            content.style.left = '-100%'
        }
    }

    function createContainer(associatedButton) {
        const div = document.createElement('div')
        div.style.pointerEvents = 'auto'
        div.style.height = '100%'
        div.style.width = '100%'
        div.style.background = styles.vars["--background-transparent07"]
        div.style.position = 'absolute'
        div.style.left = '-100%'
        div.style.opacity = '0'
        div.style.transitionProperty = 'opacity, left'
        div.style.transitionDuration = '0.3s, 0.3s'
        div.style.pointerEvents = 'none'

        div.ontransitionend = (event) => { if (div.style.opacity === '0') div.style.visibility = 'hidden' }
        contentContainer.appendChild(div)

        contents.push(div)

        associatedButton.onclick = (event) => {
            event.preventDefault(); event.stopPropagation()
            let wasClosing = div.style.opacity === '0'
            closeAll()
            if (wasClosing) {
                div.style.visibility = 'visible'
                div.style.opacity = '1'
                div.style.left = '0px'

                opened = true

                inputControlsUnlock()
                inputControlsUnlock = inputsControls.lock()
                inputsActionUnlock()
                inputsActionUnlock = inputsAction.lock()

                contentContainer.style.pointerEvents = ''
                menuContainer.style.pointerEvents = ''
                menuContainer.style.background = styles.vars["--background-transparent07"]
            }
        }

        return div
    }

    function addCustomElement(associatedButton, element) {
        const div = document.createElement('div')
        div.style.pointerEvents = 'none'
        div.style.position = 'fixed'
        div.style.left = `${MenuWidth}px`
        div.style.maxHeight = '100%'
        div.style.overflowX = 'hidden'
        div.style.overflowY = 'auto'
        // document.body.appendChild(div)

        element.style.position = 'relative'
        element.style.opacity = '0'
        element.style.pointerEvents = 'auto'
        element.style.transitionProperty = 'opacity, left'
        element.style.transitionDuration = '0.3s, 0.3s'
        element.ontransitionend = (event) => { if (element.style.opacity === '0') element.style.visibility = 'hidden' }
        div.appendChild(element)

        contents.push(element)

        associatedButton.onclick = (event) => {
            event.preventDefault(); event.stopPropagation()
            let wasClosing = element.style.opacity === '0'
            closeAll()
            if (wasClosing) {
                element.style.visibility = 'visible'
                element.style.opacity = '1'
                element.style.left = '0px'
            }
        }

        return div
    }


    const TotalWidth = MenuWidth + ContentWidth
    addEventListener('pointerdown', (event) => {
        if (opened && event.clientX > TotalWidth) {
            event.preventDefault(); event.stopPropagation()
            closeAll()
        }
    }, { capture: true })

    ///////////////////////

    const [chatSvgStr, cogSvgStr, bagSvgStr] =
        await Promise.all([
            fetch(new URL('./icons/chat-bubble.svg', import.meta.url)).then(res => res.text()),
            fetch(new URL('./icons/cog.svg', import.meta.url)).then(res => res.text()),
            fetch(new URL('./icons/school-bag.svg', import.meta.url)).then(res => res.text()),
        ])

    menuContainer.innerHTML = chatSvgStr + cogSvgStr + bagSvgStr
    const chatSvg = setIconElement(menuContainer.firstElementChild)
    const cogSvg = setIconElement(chatSvg.nextElementSibling)
    const bagSvg = setIconElement(cogSvg.nextElementSibling)

    addCustomElement(chatSvg, chat.container)

    const settingsContainer = createContainer(cogSvg)
    settingsContainer.textContent = 'SETTINGS'

    const bagContainer = createContainer(bagSvg)
    bagContainer.textContent = 'BAG'
}

export const menu = {
    init,
}
