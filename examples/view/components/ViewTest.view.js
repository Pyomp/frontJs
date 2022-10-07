import { View } from '../../../modules/dom/View.js'

export class ViewTest {
    view = new View('div', {
        ref: 'container',
        style: {
            width: 'fit-content',
            background: 'hsla(0, 0%, 0%, 0.5)',
            padding: '10px',
            display: 'flex', flexDirection: 'column', alignItems: 'center'
        },
        shadowStyle: `
            button {
                background: red;
                cursor: pointer;
            }
        `,
        children: [
            new View('button', { ref: 'woow', i18n: 'Wooow' }),
            new View('div', {
                children: [
                    new View('button', { ref: 'minus', textContent: ' - ' }),
                    new View('span', { ref: 'infoSpan', textContent: '0' }),
                    new View('button', {
                        ref: 'plus',
                        textContent: ' + ',
                        style: {
                            fontSize: 'larger',
                        }
                    }),
                ]
            }),
            new View('p', {
                ref: 'pwoow',
                style: {
                    opacity: 0,
                    transition: 'opacity 0.5s'
                },
                i18n: 'coucou world'
            })
        ]
    })

    #woowButton = this.view.ref['woow']
    #minusButton = this.view.ref['minus']
    #infoSpan = this.view.ref['infoSpan']
    #plusButton = this.view.ref['plus']
    #woowP = this.view.ref['pwoow']

    #onCreate = () => { this.#woowP.style.opacity ^= 1 }
    #onMinus = () => { this.#infoSpan.textContent-- }
    #onPlus = () => { this.#infoSpan.textContent++ }

    constructor(parent) {
        parent.appendChild(this.view.element)
        this.#woowButton.addEventListener('click', this.#onCreate)
        this.#minusButton.addEventListener('click', this.#onMinus)
        this.#plusButton.addEventListener('click', this.#onPlus)
    }

    dispose() {
        this.view.element.remove()
    }
}