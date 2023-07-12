import { createHTMLElement } from '../../htmlElement.js.js'

export class KeyboardKeySvg {

    container = createHTMLElement('div', {
        style: {
            margin: '5px', width: '50px', height: '50px',
            fontWeight: '900',
            display: 'inline-flex', justifyContent: 'center', alignItems: 'center',
            background: `url(${new URL('./key.svg', import.meta.url).href})`
        },
    })

    constructor(parent, key) {
        parent.appendChild(this.container)
        this.update(key)
    }

    dispose = () => {
        this.container.remove()
    }

    update = (key) => {
        if (key?.constructor === String) {
            this.container.textContent = key
        }
    }
}


