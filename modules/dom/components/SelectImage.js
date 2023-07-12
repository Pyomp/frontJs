export class SelectImage {

    container = document.createElement('div')
    #select = document.createElement('div')
    #maxWidth
    #maxHeight
    #optionCount

    /**
     * @typedef {{ url: string, callback: () => void }} ImageOption
     * @param {{
     *      parent?: HTMLElement
     *      imageOptions: ImageOption[]
     *      maxWidth?: number
     *      maxHeight?: number
     * }} param1
     */
    constructor({
        parent,
        imageOptions,
        maxWidth = innerWidth / 2,
        maxHeight = innerHeight / 2,
    }) {
        this.#maxWidth = maxWidth
        this.#maxHeight = maxHeight
        this.#optionCount = imageOptions.length
        parent?.appendChild(this.container)
        this.#initStyle()
        this.initEvent(imageOptions)
    }

    #displaySelect(e) {
        if (this.#select.parentNode) return
        
        document.body.appendChild(this.#select)

        addEventListener('pointerup', () => { setTimeout(() => this.#select.remove()) }, { once: true })

        let x = e.clientX
        let y = e.clientY

        let columnCount = this.#optionCount
        this.#select.style.gridTemplateColumns = `repeat(${columnCount--}, 1fr)`
        while (this.#select.offsetWidth > this.#maxWidth) {
            this.#select.style.gridTemplateColumns = `repeat(${columnCount--}, 1fr)`
        }

        const height = this.#select.offsetHeight
        const width = this.#select.offsetWidth
        if (x + width > innerWidth) x = innerWidth - width
        if (y + height > innerHeight) y = innerHeight - height

        this.#select.style.left = `${x}px`
        this.#select.style.top = `${y}px`
    }

    #initStyle() {
        this.container.style.display = 'inline-block'

        this.#select.style.position = 'fixed'
        this.#select.style.display = 'grid'
        this.#select.style.gridTemplateColumns = 'repeat(10, 1fr)'
        this.#select.style.alignItems = 'center'
        this.#select.style.justifyItems = 'center'
        this.#select.style.maxHeight = `${this.#maxHeight}px`
        this.#select.style.overflowY = 'auto'
    }

    initEvent( /** @type {ImageOption[]} */ imageOptions) {

        this.container.onclick = this.#displaySelect.bind(this)

        for (let i = 0; i < imageOptions.length; i++) {
            const url = imageOptions[i].url

            const image = document.createElement('img')
            image.style.width = '50px'
            image.style.padding = '5px'
            image.src = url
            this.#select.appendChild(image)

            if (i === 0) this.container.appendChild(image.cloneNode(false))

            image.onclick = () => {
                const clone = image.cloneNode(false)
                this.container.innerHTML = ''
                this.container.appendChild(clone)
                imageOptions[i].callback()
            }
        }
    }
}
