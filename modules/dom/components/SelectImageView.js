import { createHTMLElement } from '../htmlElement.js.js'


export class SelectImageView {

    container = document.createElement('div')
    select = createHTMLElement('div', {
        style: {
            position: 'fixed',
            display: 'grid',
            gridTemplateColumns: 'repeat(10, 1fr)',
            alignItems: 'center',
            justifyItems: 'center',
            overflowY: 'auto',
        }
    })

    #parent
    #imagesUrl
    #onClicks = []
    #maxWidth
    /**
     * @param {HTMLElement} parent
     * @param {string[]} imagesUrl must correspond with callbacks
     * @param {[()=>{}]} callbacks must correspond with imagesUrl
     */
    constructor(
        parent,
        imagesUrl,
        callbacks,
        {
            maxWidth = 350,
            maxHeight = 350,
            imagesStyle = {
                width: '50px',
                padding: '5px',
            }
        }
    ) {
        this.#parent = parent
        this.#imagesUrl = imagesUrl
        this.#callbacks = callbacks
        this.#maxWidth = maxWidth

        parent.appendChild(this.container)

        this.select.style.maxHeight = `${maxHeight}px`

        this.container.onclick = this.#displaySelect

        for (let i = 0; i < this.#imagesUrl.length; i++) {
            const url = this.#imagesUrl[i]

            const image = createHTMLElement('img', {
                style: imagesStyle,
                attributes: { src: url },
                parent: this.select
            })

            if (i === 0) this.container.appendChild(image.cloneNode(false))

            const onClick = () => {
                this.container.innerHTML = ''
                const clone = image.cloneNode(false)
                this.container.appendChild(clone)
                callbacks[i]()
                this.select.remove()
                removeEventListener('pointerdown', this.#onClose)
            }

            image.onclick = onClick
            this.#onClicks.push(onClick)
        }
    }

    #onClose = (e) => {
        if (e.composedPath().includes(this.select) === false) {
            this.select.remove()
            removeEventListener('pointerdown', this.#onClose)
        }
    }

    #displaySelect = (e) => {
        this.#parent.appendChild(this.select)
        let x = e.clientX
        let y = e.clientY

        let columnCount = this.#imagesUrl.length
        this.select.style.gridTemplateColumns = `repeat(${columnCount--}, 1fr)`
        while (this.select.offsetWidth > this.#maxWidth) {
            this.select.style.gridTemplateColumns = `repeat(${columnCount--}, 1fr)`
        }

        const height = this.select.offsetHeight
        const width = this.select.offsetWidth
        if (x + width > innerWidth) x = innerWidth - width
        if (y + height > innerHeight) y = innerHeight - height

        this.select.style.left = `${x}px`
        this.select.style.top = `${y}px`

        addEventListener('pointerdown', this.#onClose)
    }

    click = (index) => {
        this.#onClicks[index]()
    }

    dispose = () => {
        this.container.remove()
    }

}






