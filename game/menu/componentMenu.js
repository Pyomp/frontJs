import { serviceStyle } from "../../examples/styles/serviceStyle.js"
import { inputsAction } from "../inputs/inputsActions.js"
import { inputControls } from "../inputs/inputsControls.js"
import { service3D } from "../services/service3D.js"
import { componentChat } from "./componentChat.js"

async function init() {
    const MenuWidth = 40
    componentChat.init()
    componentChat.container.style.position = 'fixed'
    componentChat.container.style.left = `${MenuWidth}px`
    document.body.appendChild(componentChat.container)

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

    const [cogSvgStr, bagSvgStr] =
        await Promise.all([
            fetch(new URL('./icons/cog.svg', import.meta.url)).then(res => res.text()),
            fetch(new URL('./icons/school-bag.svg', import.meta.url)).then(res => res.text())
        ])

    menuContainer.innerHTML = cogSvgStr + bagSvgStr

    /**@return {SVGAElement}*/
    function setIconElement(svgElement) {
        svgElement.style.fill = serviceStyle.vars["--color1"]
        svgElement.style.width = '100%'
        svgElement.style.height = 'min-content'
        svgElement.style.padding = '10px'
        svgElement.classList.add('button')
        svgElement.style.pointerEvents = 'initial'
        svgElement.onpointerdown = (event) => { event.preventDefault(); event.stopPropagation() }
        svgElement.onpointerup = (event) => { event.preventDefault(); event.stopPropagation() }
        return svgElement
    }

    const cogSvg = setIconElement(menuContainer.firstElementChild)
    const bagSvg = setIconElement(cogSvg.nextElementSibling)

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
    contentContainer.onpointerdown = (event) => { event.preventDefault(); event.stopPropagation() }
    contentContainer.onpointerup = (event) => { event.preventDefault(); event.stopPropagation() }

    document.body.appendChild(contentContainer)

    const StyleLeftClosed = `${-ContentWidth}px`
    const StyleLeftOpened = `0px`

    const contents = []

    let opened = false

    let inputControlsUnlock = () => { }
    let inputsActionUnlock = () => { }

    function closeAll() {
        opened = false

        componentChat.isLock = false
        inputControlsUnlock()
        inputsActionUnlock()

        menuContainer.style.pointerEvents = 'none'
        contentContainer.style.pointerEvents = 'none'
        menuContainer.style.background = 'transparent'
        for (const content of contents) {
            content.style.opacity = '0'
            content.style.left = StyleLeftClosed
        }
    }

    function createContainer(associatedButton) {
        const div = document.createElement('div')
        div.style.position = 'absolute'
        div.style.left = StyleLeftClosed
        div.style.pointerEvents = 'initial'
        div.style.height = '100%'
        div.style.width = '100%'
        div.style.background = serviceStyle.vars["--background-transparent07"]
        div.style.opacity = '0'
        div.style.transitionProperty = 'opacity, left'
        div.style.transitionDuration = '0.3s, 0.3s'

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
                div.style.left = StyleLeftOpened

                opened = true

                componentChat.isLock = true
                inputControlsUnlock()
                inputControlsUnlock = inputControls.lock()
                inputsActionUnlock()
                inputsActionUnlock = inputsAction.lock()

                menuContainer.style.pointerEvents = ''
                contentContainer.style.pointerEvents = ''
                menuContainer.style.background = serviceStyle.vars["--background-transparent07"]
            }
        }

        return div
    }

    const settingsContainer = createContainer(cogSvg)
    settingsContainer.textContent = 'SETTINGS'
    const bagContainer = createContainer(bagSvg)
    bagContainer.textContent = 'BAG'

    const TotalWidth = MenuWidth + ContentWidth
    addEventListener('pointerdown', (event) => {
        if (opened && event.clientX > TotalWidth) {
            event.preventDefault(); event.stopPropagation()
            closeAll()
        }
    }, { capture: true })

    document.body.appendChild(menuContainer)
}

export const componentMenu = {
    init,
}
