import { createSvgElement } from "../browserUtils.js"

const TRANSITION_DURATION = '0.2s'

export class LeftMenuView {
    #iconsContainer = document.createElement('div')
    #contentContainer = document.createElement('div')

    #contentOpened = false
    #contents = []
    #width

    constructor(selectionWidth = 50, contentWidth = 400, closeOnClickOutside = true) {
        this.#width = selectionWidth + contentWidth

        this.#initIconsContainer(selectionWidth)
        this.#initContentContainer(selectionWidth, contentWidth)

        if (closeOnClickOutside) window.addEventListener('pointerdown', this.#onClickOutsideBound, { capture: true })
        window.addEventListener('resize', this.#onResizeBound)
        this.#onResizeBound()
    }

    dispose() {
        window.removeEventListener('pointerdown', this.#onClickOutsideBound, { capture: true })
        window.removeEventListener('resize', this.#onResizeBound)
    }

    #initIconsContainer(width) {
        this.#iconsContainer.style.position = 'fixed'
        this.#iconsContainer.style.height = '100%'
        this.#iconsContainer.style.width = `${width}px`
        this.#iconsContainer.style.background = 'rgba(0,0,0,0)'
        this.#iconsContainer.style.pointerEvents = 'none'
        this.#iconsContainer.style.userSelect = 'none'
        this.#iconsContainer.style.display = 'flex'
        this.#iconsContainer.style.flexDirection = 'column'
        this.#iconsContainer.style.transition = `background ${TRANSITION_DURATION}`
        document.body.appendChild(this.#iconsContainer)
    }

    #initContentContainer(left, width) {
        this.#contentContainer.style.position = 'fixed'
        this.#contentContainer.style.left = `${left}px`

        this.#contentContainer.style.width = `${width}px`
        this.#contentContainer.style.overflowX = 'hidden'
        this.#contentContainer.style.overflowY = 'auto'
        // this.#contentContainer.onpointerdown = (event) => { event.preventDefault(); event.stopPropagation() }
        // this.#contentContainer.onpointerup = (event) => { event.preventDefault(); event.stopPropagation() }
        document.body.appendChild(this.#contentContainer)
    }

    async addSection(/** @type {URL} */ iconUrl, contentElement) {
        let element
        if (iconUrl.href.slice(-4) === '.svg') {
            element = await createSvgElement(iconUrl)
        } else {
            element = new Image()
            element.src = iconUrl.href
        }

        this.#setupIcon(element)
        this.#setupContainer(contentElement)
        this.#setupToggleEvent(element, contentElement)
    }

    #setupIcon(element) {
        element.style.width = '100%'
        element.style.height = 'min-content'
        element.style.padding = '10px'
        element.classList.add('button')
        element.style.pointerEvents = 'initial'
        element.onpointerdown = (event) => { event.preventDefault(); event.stopPropagation() }
        element.onpointerup = (event) => { event.preventDefault(); event.stopPropagation() }

        this.#iconsContainer.appendChild(element)
    }

    #setupContainer(element) {
        // element.style.pointerEvents = 'initial'
        element.style.height = '100%'
        element.style.width = '100%'
        element.style.background = 'rgba(0,0,0,0.7)'
        element.style.position = 'absolute'
        element.style.left = '-100%'
        element.style.opacity = '0'
        element.style.transitionProperty = 'opacity, left'
        element.style.transitionDuration = `${TRANSITION_DURATION}, ${TRANSITION_DURATION}`

        element.ontransitionend = () => {
            if (element.style.opacity === '0') {
                element.style.visibility = 'hidden'
            }
        }

        this.#contentContainer.appendChild(element)
        this.#contents.push(element)
    }

    #setupToggleEvent(
        iconElement,
        contentElement
    ) {
        iconElement.onclick = (event) => {
            event.preventDefault(); event.stopPropagation()
            const isClosed = contentElement.style.opacity === '0'
            this.#closeAll()
            if (isClosed) {
                contentElement.style.visibility = 'visible'
                contentElement.style.opacity = '1'
                contentElement.style.left = '0px'

                this.#contentOpened = true

                this.#contentContainer.style.pointerEvents = 'auto'

                this.#iconsContainer.style.background = 'rgba(0,0,0,0.7)'
            }
        }
    }

    #closeAll() {
        this.#contentOpened = false

        this.#contentContainer.style.pointerEvents = 'none'

        this.#iconsContainer.style.background = 'rgba(0,0,0,0)'
        for (const content of this.#contents) {
            content.style.opacity = '0'
            content.style.left = '-100%'
        }
    }

    #onClickOutsideBound = this.#onClickOutside.bind(this)
    #onClickOutside(event) {
        if (this.#contentOpened && event.clientX > this.#width) {
            event.preventDefault(); event.stopPropagation()
            this.#closeAll()
        }
    }

    #onResizeBound = this.#onResize.bind(this)
    #onResize() {
        this.#iconsContainer.style.height = `${innerHeight}px`
        this.#contentContainer.style.height = `${innerHeight}px`
    }
}
